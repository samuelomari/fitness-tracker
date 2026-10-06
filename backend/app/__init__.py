from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config
from .extensions import db, bcrypt


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    bcrypt.init_app(app)
    JWTManager(app)
    CORS(app)

    from .routes.auth import auth_bp
    from .routes.workouts import workouts_bp
    from .routes.goals import goals_bp
    from .routes.tracking import track_bp
    from .routes.dashboard import dash_bp
    from .routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(workouts_bp, url_prefix="/api/workouts")
    app.register_blueprint(goals_bp, url_prefix="/api/goals")
    app.register_blueprint(track_bp, url_prefix="/api/track")
    app.register_blueprint(dash_bp, url_prefix="/api/dashboard")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    with app.app_context():
        db.create_all()
    return app
