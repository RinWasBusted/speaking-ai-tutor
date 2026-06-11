from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.whisper import load_whisper_model
from app.core.wav2vec2 import load_wav2vec2_model
from app.api.whisper import router as whisper_router
from app.api.wav2vec2 import router as wav2vec2_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load Whisper model when the server starts
    load_whisper_model()
    # Load Wav2Vec2 model when the server starts
    load_wav2vec2_model()
    yield
    # Clean up can go here if needed

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan
    )

    # Set up CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    app.include_router(whisper_router, prefix=settings.API_V1_STR, tags=["whisper"])
    app.include_router(wav2vec2_router, prefix=settings.API_V1_STR, tags=["wav2vec2"])

    @app.get("/health")
    def health_check():
        return {"status": "ok"}

    return app

app = create_app()
