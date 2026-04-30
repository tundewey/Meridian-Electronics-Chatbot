import logging
from typing import Any

from mcp.client.session import ClientSession
from mcp.client.streamable_http import streamable_http_client

from app.settings import settings

logger = logging.getLogger(__name__)


class McpClient:
    def __init__(self) -> None:
        self._cached_tools: list[Any] = []
        self._initialized_list = False

    async def refresh_tools(self) -> None:
        url = settings.mcp_server_url
        async with streamable_http_client(url) as (read, write, _get_session_id):
            async with ClientSession(read, write) as session:
                await session.initialize()
                result = await session.list_tools()
                self._cached_tools = list(result.tools)
                self._initialized_list = True
                for t in self._cached_tools:
                    logger.info("MCP tool: %s", t.name)

    def tool_summaries(self) -> list[dict[str, Any]]:
        return [
            {"name": t.name, "description": getattr(t, "description", None)}
            for t in self._cached_tools
        ]

    async def call_tool(self, name: str, arguments: dict[str, Any] | None = None) -> Any:
        url = settings.mcp_server_url
        async with streamable_http_client(url) as (read, write, _):
            async with ClientSession(read, write) as session:
                await session.initialize()
                return await session.call_tool(name, arguments or {})


mcp_client = McpClient()