from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from ..models import Workout
from ..extensions import db

workouts_bp = Blueprint("workouts", __name__)


def _uid():
    return int(get_jwt_identity())


@workouts_bp.get("")
@jwt_required()
def list_workouts():
    q = Workout.query.filter_by(user_id=_uid()).order_by(Workout.date.desc())
    return jsonify([w.to_dict() for w in q.all()])


@workouts_bp.post("")
@jwt_required()
def create_workout():
    data = request.get_json() or {}
    if not data.get("exercise_name"):
        return jsonify({"message": "exercise_name required"}), 400
    w = Workout(user_id=_uid(), exercise_name=data["exercise_name"],
                sets=data.get("sets", 0), reps=data.get("reps", 0),
                weight_kg=data.get("weight_kg", 0),
                duration_min=data.get("duration_min", 0),
                calories=data.get("calories", 0))
    if data.get("date"):
        w.date = date.fromisoformat(data["date"])
    db.session.add(w)
    db.session.commit()
    return jsonify(w.to_dict()), 201


@workouts_bp.put("/<int:wid>")
@jwt_required()
def update_workout(wid):
    w = Workout.query.filter_by(id=wid, user_id=_uid()).first()
    if not w:
        return jsonify({"message": "Not found"}), 404
    data = request.get_json() or {}
    for f in ["exercise_name", "sets", "reps", "weight_kg", "duration_min", "calories"]:
        if f in data:
            setattr(w, f, data[f])
    if data.get("date"):
        w.date = date.fromisoformat(data["date"])
    db.session.commit()
    return jsonify(w.to_dict())


@workouts_bp.delete("/<int:wid>")
@jwt_required()
def delete_workout(wid):
    w = Workout.query.filter_by(id=wid, user_id=_uid()).first()
    if not w:
        return jsonify({"message": "Not found"}), 404
    db.session.delete(w)
    db.session.commit()
    return jsonify({"message": "Deleted"})
