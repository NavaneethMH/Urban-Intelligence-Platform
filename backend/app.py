import os
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

APP_ENV = os.getenv("APP_ENV", "development")
EDGE_API = os.getenv(
    "INNOVEXA_EDGE_API",
    "https://inuomrehmxijwvtcuxhy.supabase.co/functions/v1/innovexa-api",
)
SUPABASE_ANON_KEY = os.getenv(
    "SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludW9tcmVobXhpand2dGN1eGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDcwODgsImV4cCI6MjEwNTMyMzA4OH0.xHdzNWMQ7rtLgAxyOzguSHPw5Ys3GYun6rZFUKURX1E",
)

app = FastAPI(
    title="INNOVEXA Urban Intelligence API",
    version="0.1.0",
    description="Prototype API adapter for SIH PS26124.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


def headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
    }


class EventPatch(BaseModel):
    review_status: str | None = None
    alert_status: str | None = None


class AlertPatch(BaseModel):
    state: str | None = None
    assigned_to: str | None = None


async def edge(method: str, path: str, payload: dict[str, Any] | None = None) -> Any:
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.request(
            method,
            f"{EDGE_API}{path}",
            headers=headers(),
            json=payload,
        )
    if response.status_code >= 400:
        try:
            detail = response.json().get("error", response.text)
        except Exception:
            detail = response.text
        raise HTTPException(response.status_code, detail)
    return response.json()


@app.get("/health")
async def health() -> dict[str, Any]:
    remote = await edge("GET", "/health")
    return {"ok": True, "service": "innovexa-fastapi-api", "env": APP_ENV, "upstream": remote}


@app.get("/api/v1/bootstrap")
async def bootstrap() -> JSONResponse:
    return JSONResponse(await edge("GET", "/bootstrap"))


@app.patch("/api/v1/events/{event_id}")
async def patch_event(event_id: str, patch: EventPatch) -> JSONResponse:
    payload = {k: v for k, v in patch.model_dump().items() if v is not None}
    return JSONResponse(await edge("PATCH", f"/events/{event_id}", payload))


@app.patch("/api/v1/alerts/{alert_id}")
async def patch_alert(alert_id: str, patch: AlertPatch) -> JSONResponse:
    payload = {k: v for k, v in patch.model_dump().items() if v is not None}
    return JSONResponse(await edge("PATCH", f"/alerts/{alert_id}", payload))
