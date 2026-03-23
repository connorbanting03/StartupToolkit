from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from backend.config import APP_NAME, APP_ENV
from backend.routers import projects, tools, recommendations, auth

app = FastAPI(
    title=APP_NAME,
    version="0.1.0",
    docs_url="/api/docs" if APP_ENV == "development" else None,
    redoc_url=None,
)

# ALLOWED_ORIGINS env var: comma-separated list of allowed origins
# e.g. "https://my-frontend.railway.app,https://startupblueprintkit.com"
_origins_env = os.environ.get("ALLOWED_ORIGINS", "")
allowed_origins = [
    "http://localhost:3000",
    *[o.strip() for o in _origins_env.split(",") if o.strip()],
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tools.router)
app.include_router(recommendations.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": APP_NAME}
