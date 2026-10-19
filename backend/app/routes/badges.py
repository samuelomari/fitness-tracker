from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Badge, UserBadge
from ..badges import award_for_user, ensure_badges

badge_bp = Blueprint("badges", __name__)

@badge_bp.get("")
@jwt_required()
def my_badges():
    uid = int(get_jwt_identity())
    ensure_badges()
    earned = UserBadge.query.filter_by(user_id=uid).all()
    have = {ub.badge_id for ub in earned}
    locked = [b.to_dict() for b in Badge.query.all() if b.id not in have]
    return jsonify({"earned": [e.to_dict() for e in earned], "locked": locked})

@badge_bp.post("/check")
@jwt_required()
def check():
    newly = award_for_user(int(get_jwt_identity()))
    return jsonify({"newly_awarded": newly})
