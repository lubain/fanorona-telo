from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Origines autorisées pour le frontend, séparées par des virgules
    frontend_urls: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"

    # Charge automatiquement depuis un fichier .env s'il existe
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
