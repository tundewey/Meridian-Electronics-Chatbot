from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.chat import router as chat_router
from app.mcp_client import mcp_client
from app.settings import settings

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await mcp_client.refresh_tools()
    except Exception as e:
        logger.warning("MCP tools prefetch failed: %s", e)
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/debug/tools")
async def debug_tools():
    if not mcp_client._initialized_list:
        await mcp_client.refresh_tools()
    return {"tools": mcp_client.tool_summaries()}