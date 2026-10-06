from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from ..models import User, Workout
from ..extensions import db

admin_bp = Blueprint("admin", __name__)

def _require_admin():
    u = User.query.get(int(get_jwt_identity()))
    if not u or not u.is_admin:
        return None
    return u

@admin_bp.get("/users")
@jwt_required()
def users():
    if not _require_admin(): return jsonify({"message": "Forbidden"}), 403
    return jsonify([u.to_dict() for u in User.query.all()])

@admin_bp.delete("/users/<int:uid>")
@jwt_required()
def delete_user(uid):
    if not _require_admin(): return jsonify({"message": "Forbidden"}), 403
    u = User.query.get(uid)
    if not u: return jsonify({"message": "Not found"}), 404
    db.session.delete(u); db.session.commit()
    return jsonify({"message": "Deleted"})

@admin_bp.put("/users/<int:uid>/suspend")
@jwt_required()
def suspend(uid):
    if not _require_admin(): return jsonify({"message": "Forbidden"}), 403
    u = User.query.get(uid)
    if not u: return jsonify({"message": "Not found"}), 404
    u.is_active = not u.is_active; db.session.commit()
    return jsonify(u.to_dict())

@admin_bp.get("/stats")
@jwt_required()
def stats():
    if not _require_admin(): return jsonify({"message": "Forbidden"}), 403
    top = (db.session.query(Workout.exercise_name, func.count(Workout.id))
           .group_by(Workout.exercise_name).order_by(func.count(Workout.id).desc()).limit(5).all())
    return jsonify({
        "total_users": User.query.count(),
        "active_users": User.query.filter_by(is_active=True).count(),
        "total_workouts": Workout.query.count(),
        "popular_exercises": [{"name": n, "count": c} for n, c in top],
    })
