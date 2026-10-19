import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
instance_dir = os.path.join(backend_dir, "instance")
os.makedirs(instance_dir, exist_ok=True)
default_sqlite_path = os.path.join(instance_dir, "fittrack.db")

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", f"sqlite:///{default_sqlite_path}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = 3600 * 24  # 1 day
