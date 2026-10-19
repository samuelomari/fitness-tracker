from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from datetime import date, timedelta
from ..models import Workout, Goal, User
from ..extensions import db

activity_bp = Blueprint("activity", __name__)

def _uid(): return int(get_jwt_identity())

@activity_bp.get("/heatmap")
@jwt_required()
def heatmap():
    """GitHub-style: last `days` (default 120) with workout counts + calories."""
    days = min(int(request.args.get("days", 120)), 365)
    start = date.today() - timedelta(days=days - 1)
    rows = (db.session.query(Workout.date, func.count(Workout.id), func.coalesce(func.sum(Workout.calories), 0))
            .filter(Workout.user_id == _uid(), Workout.date >= start)
            .group_by(Workout.date).all())
    by_date = {str(d): {"count": c, "calories": float(k)} for d, c, k in rows}
    out, d = [], start
    while d <= date.today():
        k = d.isoformat()
        info = by_date.get(k, {"count": 0, "calories": 0})
        out.append({"date": k, **info, "level": 0 if info["count"] == 0 else min(4, info["count"])})
        d += timedelta(days=1)
    return jsonify({"days": out, "total": sum(x["count"] for x in out)})

@activity_bp.get("/frequency")
@jwt_required()
def frequency():
    """Workouts per week for last N weeks (default 12)."""
    weeks = min(int(request.args.get("weeks", 12)), 52)
    start = date.today() - timedelta(weeks=weeks)
    rows = (db.session.query(Workout.date, func.count(Workout.id))
            .filter(Workout.user_id == _uid(), Workout.date >= start)
            .group_by(Workout.date).all())
    buckets = {}
    for d, c in rows:
        monday = (d - timedelta(days=d.weekday())).isoformat()
        buckets[monday] = buckets.get(monday, 0) + c
    return jsonify([{"week": k, "workouts": v} for k, v in sorted(buckets.items())])
