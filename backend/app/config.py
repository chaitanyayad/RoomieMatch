from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://roomie:roomie@db:5432/roomiematch"
    secret_key: str = "dev-secret-key-change-in-production"
    google_client_id: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 1 week

    class Config:
        env_file = ".env"


settings = Settings()
