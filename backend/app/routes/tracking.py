from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, datetime
from ..models import NutritionLog, WaterLog, SleepLog, WeightLog
from ..extensions import db

track_bp = Blueprint("track", __name__)
def _uid(): return int(get_jwt_identity())

@track_bp.get("/nutrition")
@jwt_required()
def list_nutrition():
    rows = NutritionLog.query.filter_by(user_id=_uid()).order_by(NutritionLog.date.desc()).limit(100).all()
    return jsonify([r.to_dict() for r in rows])

@track_bp.post("/nutrition")
@jwt_required()
def add_nutrition():
    d = request.get_json() or {}
    if not d.get("food_name"): return jsonify({"message": "food_name required"}), 400
    r = NutritionLog(user_id=_uid(), meal_type=d.get("meal_type", "snack"),
                     food_name=d["food_name"], calories=d.get("calories", 0),
                     protein=d.get("protein", 0), carbs=d.get("carbs", 0), fat=d.get("fat", 0))
    if d.get("date"): r.date = date.fromisoformat(d["date"])
    db.session.add(r); db.session.commit()
    return jsonify(r.to_dict()), 201

@track_bp.get("/water")
@jwt_required()
def list_water():
    rows = WaterLog.query.filter_by(user_id=_uid()).order_by(WaterLog.date.desc()).limit(60).all()
    return jsonify([r.to_dict() for r in rows])

@track_bp.post("/water")
@jwt_required()
def add_water():
    d = request.get_json() or {}
    r = WaterLog(user_id=_uid(), amount_ml=d.get("amount_ml", 250))
    if d.get("date"): r.date = date.fromisoformat(d["date"])
    db.session.add(r); db.session.commit()
    return jsonify(r.to_dict()), 201

@track_bp.get("/sleep")
@jwt_required()
def list_sleep():
    rows = SleepLog.query.filter_by(user_id=_uid()).order_by(SleepLog.date.desc()).limit(30).all()
    return jsonify([r.to_dict() for r in rows])

@track_bp.post("/sleep")
@jwt_required()
def add_sleep():
    d = request.get_json() or {}
    try:
        bed = datetime.fromisoformat(d["bedtime"]); up = datetime.fromisoformat(d["wakeup"])
    except Exception:
        return jsonify({"message": "bedtime and wakeup ISO datetimes required"}), 400
    dur = round((up - bed).total_seconds() / 3600, 1)
    r = SleepLog(user_id=_uid(), bedtime=bed, wakeup=up, duration_hours=dur)
    if d.get("date"): r.date = date.fromisoformat(d["date"])
    db.session.add(r); db.session.commit()
    return jsonify(r.to_dict()), 201

@track_bp.get("/weight")
@jwt_required()
def list_weight():
    rows = WeightLog.query.filter_by(user_id=_uid()).order_by(WeightLog.date.asc()).all()
    return jsonify([r.to_dict() for r in rows])

@track_bp.post("/weight")
@jwt_required()
def add_weight():
    d = request.get_json() or {}
    if d.get("weight_kg") is None: return jsonify({"message": "weight_kg required"}), 400
    r = WeightLog(user_id=_uid(), weight_kg=d["weight_kg"])
    if d.get("date"): r.date = date.fromisoformat(d["date"])
    db.session.add(r); db.session.commit()
    return jsonify(r.to_dict()), 201
