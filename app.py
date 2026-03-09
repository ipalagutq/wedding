from __future__ import annotations

import json
import os
import re
import sqlite3
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

try:
    from google.oauth2.service_account import Credentials as _GoogleCredentials  # type: ignore
    from googleapiclient.discovery import build as _google_build  # type: ignore
    from googleapiclient.errors import HttpError as _GoogleHttpError  # type: ignore
except Exception:  # noqa: BLE001
    _GoogleCredentials = None
    _google_build = None
    _GoogleHttpError = None

ROOT = Path(__file__).resolve().parent
PUBLIC_DIR = ROOT / "public"
DATA_DIR = ROOT / "data"
SUBMISSIONS_DIR = DATA_DIR / "submissions"
SQLITE_PATH = DATA_DIR / "rsvp.sqlite"

SUBMISSIONS_DIR.mkdir(parents=True, exist_ok=True)


class RSVPRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    contact: str = Field(default="", max_length=120)
    attendance: Literal["yes", "no", "maybe"]
    guests: Optional[int] = Field(default=None, ge=1, le=10)
    diet: str = Field(default="", max_length=200)
    plus_ones: list[str] = Field(default_factory=list)
    song: str = Field(default="", max_length=200)
    comment: str = Field(default="", max_length=1000)
    meta: dict[str, Any] = Field(default_factory=dict)


@dataclass(frozen=True)
class StoredRSVP:
    id: str
    created_at: str
    ip: Optional[str]
    payload: dict[str, Any]


def _utc_now_iso() -> str:
    return datetime.now(tz=timezone.utc).isoformat()


def _safe_filename(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"\s+", "_", s)
    s = re.sub(r"[^a-z0-9_\-]+", "", s)
    return s[:40] or "guest"


def _client_ip(request: Request) -> Optional[str]:
    # ngrok/прокси могут прокидывать X-Forwarded-For
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip() or None
    if request.client:
        return request.client.host
    return None


def _storage_mode() -> str:
    # file (по умолчанию) или sqlite
    return os.getenv("RSVP_STORAGE", "file").strip().lower()


def _ensure_sqlite_schema() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(SQLITE_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS rsvp (
              id TEXT PRIMARY KEY,
              created_at TEXT NOT NULL,
              ip TEXT,
              name TEXT NOT NULL,
              contact TEXT,
              attendance TEXT NOT NULL,
              guests INTEGER,
              diet TEXT,
                            plus_ones_json TEXT,
              song TEXT,
              comment TEXT,
              meta_json TEXT NOT NULL
            );
            """
        )

        # lightweight migration for older DBs
        cols = {row[1] for row in conn.execute("PRAGMA table_info(rsvp);").fetchall()}
        if "plus_ones_json" not in cols:
            conn.execute("ALTER TABLE rsvp ADD COLUMN plus_ones_json TEXT;")
        if "song" not in cols:
            conn.execute("ALTER TABLE rsvp ADD COLUMN song TEXT;")

        conn.commit()


def _store_file(item: StoredRSVP) -> None:
    SUBMISSIONS_DIR.mkdir(parents=True, exist_ok=True)
    name = _safe_filename(str(item.payload.get("name", "")))
    ts = item.created_at.replace(":", "-")
    path = SUBMISSIONS_DIR / f"{ts}_{name}_{item.id}.json"
    path.write_text(json.dumps(asdict(item), ensure_ascii=False, indent=2), encoding="utf-8")


def _store_sqlite(item: StoredRSVP) -> None:
    _ensure_sqlite_schema()
    payload = item.payload
    with sqlite3.connect(SQLITE_PATH) as conn:
        conn.execute(
            """
            INSERT INTO rsvp (id, created_at, ip, name, contact, attendance, guests, diet, plus_ones_json, song, comment, meta_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                item.id,
                item.created_at,
                item.ip,
                payload.get("name"),
                payload.get("contact"),
                payload.get("attendance"),
                payload.get("guests"),
                payload.get("diet"),
                json.dumps(payload.get("plus_ones", []), ensure_ascii=False),
                payload.get("song"),
                payload.get("comment"),
                json.dumps(payload.get("meta", {}), ensure_ascii=False),
            ),
        )
        conn.commit()


def _sheets_configured() -> bool:
    return bool(os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID", "").strip())


def _get_google_credentials() -> Any:
    if _GoogleCredentials is None:
        raise RuntimeError("google-auth is not installed")

    scopes = ["https://www.googleapis.com/auth/spreadsheets"]

    raw_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
    if raw_json:
        info = json.loads(raw_json)
        return _GoogleCredentials.from_service_account_info(info, scopes=scopes)

    file_path = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "").strip()
    if file_path:
        return _GoogleCredentials.from_service_account_file(file_path, scopes=scopes)

    raise RuntimeError("Google service account credentials are not configured")


def _append_rsvp_to_sheet(payload: dict[str, Any]) -> None:
    if not _sheets_configured():
        return
    if _google_build is None:
        raise RuntimeError("google-api-python-client is not installed")

    spreadsheet_id = os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID", "").strip()
    sheet_range = os.getenv("GOOGLE_SHEETS_RANGE", "RSVP!A:E").strip() or "RSVP!A:E"

    creds = _get_google_credentials()
    service = _google_build("sheets", "v4", credentials=creds, cache_discovery=False)

    def quote_sheet_title(title: str) -> str:
        # A1 notation: sheet titles with spaces/special chars must be single-quoted.
        # Quoting is always safe; escape single quote by doubling it.
        t = (title or "").strip()
        if t.startswith("'") and t.endswith("'") and len(t) >= 2:
            return t
        t = t.replace("'", "''")
        return f"'{t}'"

    def get_first_sheet_title() -> str:
        meta = (
            service.spreadsheets()
            .get(spreadsheetId=spreadsheet_id, fields="sheets(properties(title))")
            .execute()
        )
        sheets = meta.get("sheets") or []
        for s in sheets:
            title = ((s or {}).get("properties") or {}).get("title")
            if isinstance(title, str) and title.strip():
                return title.strip()
        raise RuntimeError("Spreadsheet has no sheets")

    def normalize_range(rng: str) -> str:
        rng = (rng or "").strip()
        if not rng:
            rng = "A:E"
        if "!" not in rng:
            return f"{quote_sheet_title(get_first_sheet_title())}!{rng}"
        tab, rest = rng.split("!", 1)
        tab = tab.strip()
        rest = rest.strip() or "A:E"
        if not tab:
            tab = get_first_sheet_title()
        return f"{quote_sheet_title(tab)}!{rest}"

    name = str(payload.get("name") or "").strip()
    contact = str(payload.get("contact") or payload.get("id") or "").strip()
    attendance = str(payload.get("attendance") or "").strip().lower()
    attendance_text = "Да" if attendance == "yes" else "Нет" if attendance == "no" else attendance
    plus_ones = payload.get("plus_ones")
    if not isinstance(plus_ones, list):
        plus_ones = []
    plus_ones = [str(x).strip() for x in plus_ones if str(x).strip()][:2]
    song = str(payload.get("song") or "").strip()

    row = [name, attendance_text, contact, json.dumps(plus_ones, ensure_ascii=False), song]

    effective_range = normalize_range(sheet_range)
    try:
        service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range=effective_range,
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body={"values": [row]},
        ).execute()
    except Exception as e:  # noqa: BLE001
        # If user configured a non-existing tab (e.g. RSVP), retry with first sheet.
        msg = str(e)
        if "Unable to parse range" in msg:
            fallback_range = normalize_range("A:E")
            service.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id,
                range=fallback_range,
                valueInputOption="USER_ENTERED",
                insertDataOption="INSERT_ROWS",
                body={"values": [row]},
            ).execute()
            return
        raise


app = FastAPI(title="Wedding Invitation", version="1.0.0")


@app.middleware("http")
async def _no_cache_for_frontend_assets(request: Request, call_next):
    response = await call_next(request)

    if request.method not in {"GET", "HEAD"}:
        return response

    path = request.url.path
    if path == "/" or path.endswith(".html"):
        response.headers["Cache-Control"] = "no-store"
        response.headers["Pragma"] = "no-cache"
    elif path.endswith(".js") or path.endswith(".css"):
        response.headers["Cache-Control"] = "no-cache"
        response.headers["Pragma"] = "no-cache"

    return response


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/girls-references")
def girls_references() -> JSONResponse:
    exts = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"}
    folder = PUBLIC_DIR / "girls_references"

    if not folder.exists() or not folder.is_dir():
        return JSONResponse(
            {"items": []},
            headers={"Cache-Control": "no-store", "Pragma": "no-cache"},
        )

    items: list[str] = []
    for p in folder.iterdir():
        if not p.is_file():
            continue
        if p.suffix.lower() not in exts:
            continue
        items.append(p.name)

    items.sort()
    return JSONResponse(
        {"items": [f"/girls_references/{name}" for name in items]},
        headers={"Cache-Control": "no-store", "Pragma": "no-cache"},
    )


@app.post("/api/rsvp")
async def rsvp(req: Request, body: RSVPRequest) -> JSONResponse:
    mode = _storage_mode()
    created_at = _utc_now_iso()

    payload = body.model_dump()
    item = StoredRSVP(
        id=uuid.uuid4().hex,
        created_at=created_at,
        ip=_client_ip(req),
        payload=payload,
    )

    try:
        if mode == "sqlite":
            _store_sqlite(item)
        else:
            _store_file(item)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Storage error: {e}")

    try:
        _append_rsvp_to_sheet(payload)
    except Exception as e:  # noqa: BLE001
        # Data is still stored locally; but signal failure so it's visible.
        raise HTTPException(status_code=500, detail=f"Google Sheets error: {e}")

    return JSONResponse({"ok": True, "id": item.id, "stored": mode})


# Явно отдаём index (на случай если хочется прям FileResponse)
@app.get("/")
def index() -> FileResponse:
    return FileResponse(
        PUBLIC_DIR / "index.html",
        headers={"Cache-Control": "no-store", "Pragma": "no-cache"},
    )


# Статика (монтируем ПОСЛЕ API-роутов, иначе '/' перехватывает всё включая /api и /health)
app.mount("/", StaticFiles(directory=str(PUBLIC_DIR), html=True), name="static")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )
