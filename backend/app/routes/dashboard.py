from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, timedelta
from sqlalchemy import func
from ..models import Workout, Goal, User, WeightLog
from ..extensions import db

dash_bp = Blueprint("dashboard", __name__)

@dash_bp.get("/summary")
@jwt_required()
def summary():
    uid = int(get_jwt_identity())
    total = Workout.query.filter_by(user_id=uid).count()
    cals = db.session.query(func.coalesce(func.sum(Workout.calories), 0)).filter_by(user_id=uid).scalar()
    week_ago = date.today() - timedelta(days=7)
    weekly = Workout.query.filter(Workout.user_id == uid, Workout.date >= week_ago).count()
    user = User.query.get(uid)
    goals = Goal.query.filter_by(user_id=uid, status="active").all()
    streak = 0
    d = date.today()
    dates = {w.date for w in Workout.query.filter_by(user_id=uid).all()}
    while d in dates:
        streak += 1; d -= timedelta(days=1)
    weights = [w.to_dict() for w in WeightLog.query.filter_by(user_id=uid).order_by(WeightLog.date.asc()).all()]
    by_day = (db.session.query(Workout.date, func.sum(Workout.calories))
              .filter(Workout.user_id == uid, Workout.date >= week_ago)
              .group_by(Workout.date).all())
    return jsonify({
        "total_workouts": total, "calories_burned": float(cals or 0),
        "current_weight": user.weight_kg if user else None,
        "active_goals": [g.to_dict() for g in goals],
        "weekly_workouts": weekly, "streak_days": streak,
        "weight_history": weights,
        "calories_by_day": [{"date": str(k), "calories": float(v)} for k, v in by_day],
    })
