from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Exercise, User
from ..extensions import db

lib_bp = Blueprint("library", __name__)

@lib_bp.get("")
@jwt_required()
def list_exercises():
    q = Exercise.query
    for f in ["muscle_group", "equipment", "difficulty"]:
        v = request.args.get(f)
        if v: q = q.filter(getattr(Exercise, f) == v)
    s = request.args.get("q")
    if s: q = q.filter(Exercise.name.ilike(f"%{s}%"))
    return jsonify([e.to_dict() for e in q.order_by(Exercise.name).limit(200).all()])

@lib_bp.post("")
@jwt_required()
def create_exercise():
    u = User.query.get(int(get_jwt_identity()))
    if not u or not u.is_admin: return jsonify({"message": "Forbidden"}), 403
    d = request.get_json() or {}
    if not d.get("name") or not d.get("muscle_group"):
        return jsonify({"message": "name and muscle_group required"}), 400
    e = Exercise(name=d["name"], muscle_group=d["muscle_group"],
                 equipment=d.get("equipment", "bodyweight"),
                 difficulty=d.get("difficulty", "beginner"),
                 description=d.get("description"), instructions=d.get("instructions"),
                 image_url=d.get("image_url"), video_url=d.get("video_url"))
    db.session.add(e); db.session.commit()
    return jsonify(e.to_dict()), 201

@lib_bp.put("/<int:eid>")
@jwt_required()
def update_exercise(eid):
    u = User.query.get(int(get_jwt_identity()))
    if not u or not u.is_admin: return jsonify({"message": "Forbidden"}), 403
    e = Exercise.query.get(eid)
    if not e: return jsonify({"message": "Not found"}), 404
    d = request.get_json() or {}
    for f in ["name", "muscle_group", "equipment", "difficulty", "description", "instructions", "image_url", "video_url"]:
        if f in d: setattr(e, f, d[f])
    db.session.commit()
    return jsonify(e.to_dict())

@lib_bp.delete("/<int:eid>")
@jwt_required()
def delete_exercise(eid):
    u = User.query.get(int(get_jwt_identity()))
    if not u or not u.is_admin: return jsonify({"message": "Forbidden"}), 403
    e = Exercise.query.get(eid)
    if not e: return jsonify({"message": "Not found"}), 404
    db.session.delete(e); db.session.commit()
    return jsonify({"message": "Deleted"})
