import os
import sys
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-12345")
    
    raw_db_url = os.environ.get("DATABASE_URL", "").strip()
    
    if raw_db_url:
        database_url = raw_db_url
        # If user provides postgres:// or postgresql://, explicitly route to psycopg2
        # (SQLAlchemy 2.0+ defaults postgresql:// to 'psycopg' v3 if present, which caused ModuleNotFoundError)
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif database_url.startswith("postgresql://"):
            database_url = database_url.replace("postgresql://", "postgresql+psycopg2://", 1)

        # Ensure sslmode for Neon / cloud postgres
        if "neon.tech" in database_url and "sslmode=" not in database_url:
            database_url += ("&" if "?" in database_url else "?") + "sslmode=require"
            
        SQLALCHEMY_DATABASE_URI = database_url
    else:
        # Serverless fallback for local or missing DB
        is_serverless = os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")
        if is_serverless:
            SQLALCHEMY_DATABASE_URI = "sqlite:////tmp/patients.db"
        else:
            backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
            db_path = os.path.join(backend_dir, "patients.db")
            SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    if SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
        SQLALCHEMY_ENGINE_OPTIONS = {}
    else:
        SQLALCHEMY_ENGINE_OPTIONS = {
            "pool_pre_ping": True,
            "pool_recycle": 60,
            "connect_args": {
                "connect_timeout": 15
            }
        }


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_ENGINE_OPTIONS = {}
