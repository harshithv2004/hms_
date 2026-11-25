import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-12345")
    
    # Handle PostgreSQL URL scheme: SQLAlchemy 1.4+ requires postgresql:// instead of postgres://
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        # Ensure sslmode for Neon / cloud postgres if not specified
        if "neon.tech" in database_url and "sslmode=" not in database_url:
            database_url += ("&" if "?" in database_url else "?") + "sslmode=require"
        SQLALCHEMY_DATABASE_URI = database_url
    else:
        # Default fallback for local testing if no PostgreSQL database provided
        # Points to SQLite inside the backend folder
        backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        db_path = os.path.join(backend_dir, "patients.db")
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    } if not SQLALCHEMY_DATABASE_URI.startswith("sqlite") else {}


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_ENGINE_OPTIONS = {}
