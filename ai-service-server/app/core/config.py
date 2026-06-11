from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Speaking AI Tutor Service"
    API_V1_STR: str = "/api/v1"
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    WHISPER_MODEL_PATH: str = os.path.join(BASE_DIR, "models", "whisper", "ggml-base.en.bin")
    WAV2VEC2_MODEL_PATH: str = os.path.join(BASE_DIR, "models", "wav2vec2")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

settings = Settings()
