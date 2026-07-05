"""Plana — FastAPI agent server.

Exposes two AG-UI endpoints:

  POST /fixed/   — room designer agent (fixed-schema A2UI layout)
  POST /dynamic/ — dynamic A2UI surface generator (follow-up Q&A)

Run with:  uvicorn main:app --port 8123 --reload
"""
from __future__ import annotations

import logging
import os

import uvicorn
from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import LangGraphAGUIAgent
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from src.multimodal_middleware import install as _install_doc_inlining  # noqa: E402

_install_doc_inlining()

from src.dynamic_agent import graph as dynamic_graph  # noqa: E402
from src.fixed_agent import graph as fixed_graph  # noqa: E402

app = FastAPI(title="Plana Agents")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_AGENT_CONFIG = {"recursion_limit": 50}

add_langgraph_fastapi_endpoint(
    app=app,
    agent=LangGraphAGUIAgent(
        name="fixed_agent",
        description="Plana room designer agent — generates a to-scale interactive floor plan from a room description or floor plan image.",
        graph=fixed_graph,
        config=_AGENT_CONFIG,
    ),
    path="/fixed",
)

add_langgraph_fastapi_endpoint(
    app=app,
    agent=LangGraphAGUIAgent(
        name="dynamic_agent",
        description="Plana dynamic surface agent — generates A2UI surfaces from follow-up questions using a secondary LLM.",
        graph=dynamic_graph,
        config=_AGENT_CONFIG,
    ),
    path="/dynamic",
)


@app.get("/")
def root():
    return {
        "ok": True,
        "app": "Plana",
        "agents": {
            "fixed_agent": "/fixed/",
            "dynamic_agent": "/dynamic/",
        },
    }


def main():
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "8123")),
        reload=True,
    )


if __name__ == "__main__":
    main()
