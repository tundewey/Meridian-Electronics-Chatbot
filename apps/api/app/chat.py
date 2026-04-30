"""POST /v1/chat — OpenRouter + MCP tools."""

from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from mcp.types import CallToolResult, TextContent
from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from app.mcp_client import mcp_client
from app.settings import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1", tags=["chat"])

MAX_TOOL_ROUNDS = 12

OPENROUTER_BASE = "https://openrouter.ai/api/v1"


class ChatMessageIn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessageIn]


class ChatResponse(BaseModel):
    message: dict[str, str] = Field(
        ...,
        examples=[{"role": "assistant", "content": "Hello!"}],
    )


def _mcp_tools_for_llm() -> list[dict[str, Any]]:
    tools: list[dict[str, Any]] = []
    for t in mcp_client._cached_tools:
        schema = t.inputSchema if isinstance(t.inputSchema, dict) else {"type": "object", "properties": {}}
        tools.append(
            {
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": (t.description or "")[:4096],
                    "parameters": schema,
                },
            }
        )
    return tools


def _format_tool_result(result: CallToolResult) -> str:
    if result.isError:
        return json.dumps({"error": True, "details": [b.model_dump() for b in result.content]})
    parts: list[str] = []
    for block in result.content:
        if isinstance(block, TextContent):
            parts.append(block.text)
        else:
            parts.append(block.model_dump_json())
    if result.structuredContent is not None:
        parts.append(json.dumps(result.structuredContent))
    return "\n".join(parts) if parts else "(no content)"


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    if not settings.openrouter_api_key.strip():
        raise HTTPException(
            status_code=503,
            detail="OPENROUTER_API_KEY is not set. Add it to apps/api/.env",
        )

    if not req.messages:
        raise HTTPException(status_code=400, detail="messages must not be empty")

    if not mcp_client._initialized_list:
        try:
            await mcp_client.refresh_tools()
        except Exception as e:
            logger.warning("Could not refresh MCP tools before chat: %s", e)

    client = AsyncOpenAI(
        base_url=OPENROUTER_BASE,
        api_key=settings.openrouter_api_key,
    )

    openai_messages: list[dict[str, Any]] = [
        {"role": m.role, "content": m.content} for m in req.messages if m.role in ("user", "assistant", "system")
    ]

    if not openai_messages:
        raise HTTPException(status_code=400, detail="no valid messages")

    tools = _mcp_tools_for_llm()
    tool_round = 0

    while tool_round < MAX_TOOL_ROUNDS:
        tool_round += 1
        kwargs: dict[str, Any] = {
            "model": settings.openrouter_model,
            "messages": openai_messages,
        }
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"

        completion = await client.chat.completions.create(**kwargs)
        choice = completion.choices[0]
        msg = choice.message

        if choice.finish_reason == "tool_calls" and msg.tool_calls:
            openai_messages.append(
                {
                    "role": "assistant",
                    "content": msg.content or "",
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": "function",
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments or "{}",
                            },
                        }
                        for tc in msg.tool_calls
                    ],
                }
            )
            for tc in msg.tool_calls:
                name = tc.function.name
                try:
                    raw_args = tc.function.arguments or "{}"
                    args = json.loads(raw_args) if raw_args.strip() else {}
                except json.JSONDecodeError:
                    args = {}
                try:
                    result = await mcp_client.call_tool(name, args)
                    content = _format_tool_result(result)
                except Exception as e:
                    logger.exception("MCP tool call failed: %s", name)
                    content = json.dumps({"error": str(e)})
                openai_messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": content,
                    }
                )
            continue

        text = (msg.content or "").strip()
        if not text and msg.tool_calls:
            continue
        return ChatResponse(message={"role": "assistant", "content": text or "(no response)"})

    return ChatResponse(
        message={
            "role": "assistant",
            "content": "Stopped after too many tool rounds. Try a simpler question.",
        }
    )
