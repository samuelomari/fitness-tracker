from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from ..models import Goal
from ..extensions import db

goals_bp = Blueprint("goals", __name__)

def _uid(): return int(get_jwt_identity())

@goals_bp.get("")
@jwt_required()
def list_goals():
    goals = Goal.query.filter_by(user_id=_uid()).order_by(Goal.id.desc()).all()
    return jsonify([g.to_dict() for g in goals])

@goals_bp.post("")
@jwt_required()
def create_goal():
    data = request.get_json() or {}
    if not data.get("title") or not data.get("goal_type") or data.get("target") is None:
        return jsonify({"message": "title, goal_type, target required"}), 400
    g = Goal(user_id=_uid(), title=data["title"], goal_type=data["goal_type"],
             target=data["target"], current_progress=data.get("current_progress", 0),
             status=data.get("status", "active"))
    if data.get("deadline"): g.deadline = date.fromisoformat(data["deadline"])
    db.session.add(g); db.session.commit()
    return jsonify(g.to_dict()), 201

@goals_bp.put("/<int:gid>")
@jwt_required()
def update_goal(gid):
    g = Goal.query.filter_by(id=gid, user_id=_uid()).first()
    if not g: return jsonify({"message": "Not found"}), 404
    data = request.get_json() or {}
    for f in ["title", "goal_type", "target", "current_progress", "status"]:
        if f in data: setattr(g, f, data[f])
    if data.get("deadline"): g.deadline = date.fromisoformat(data["deadline"])
    if g.target and g.current_progress >= g.target: g.status = "completed"
    db.session.commit()
    return jsonify(g.to_dict())

@goals_bp.delete("/<int:gid>")
@jwt_required()
def delete_goal(gid):
    g = Goal.query.filter_by(id=gid, user_id=_uid()).first()
    if not g: return jsonify({"message": "Not found"}), 404
    db.session.delete(g); db.session.commit()
    return jsonify({"message": "Deleted"})
