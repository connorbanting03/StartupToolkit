from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import APP_NAME, APP_ENV
from backend.routers import projects, tools, recommendations, auth

app = FastAPI(
    title=APP_NAME,
    version="0.1.0",
    docs_url="/api/docs" if APP_ENV == "development" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://rawtoready.co",
    ],
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
