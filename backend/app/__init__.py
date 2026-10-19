from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config
from .extensions import db, bcrypt


def create_app(config_overrides=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if config_overrides:
        app.config.update(config_overrides)
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
    from .routes.activity import activity_bp
    from .routes.library import lib_bp
    from .routes.challenges import chal_bp
    from .routes.badges import badge_bp
    from .routes.reports import report_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(workouts_bp, url_prefix="/api/workouts")
    app.register_blueprint(goals_bp, url_prefix="/api/goals")
    app.register_blueprint(track_bp, url_prefix="/api/track")
    app.register_blueprint(dash_bp, url_prefix="/api/dashboard")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(activity_bp, url_prefix="/api/activity")
    app.register_blueprint(lib_bp, url_prefix="/api/library")
    app.register_blueprint(chal_bp, url_prefix="/api/challenges")
    app.register_blueprint(badge_bp, url_prefix="/api/badges")
    app.register_blueprint(report_bp, url_prefix="/api/reports")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    with app.app_context():
        db.create_all()
    return app
