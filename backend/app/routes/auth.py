from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from email_validator import validate_email, EmailNotValidError
from ..models import User
from ..extensions import db

auth_bp = Blueprint("auth", __name__)


def _validate_register(data):
    errors = {}
    if not data.get("name"):
        errors["name"] = "Name is required"
    try:
        validate_email(data.get("email", ""))
    except EmailNotValidError:
        errors["email"] = "Invalid email"
    if len(data.get("password", "")) < 6:
        errors["password"] = "Password must be at least 6 characters"
    return errors


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    errors = _validate_register(data)
    if errors:
        return jsonify({"errors": errors}), 400
    if User.query.filter_by(email=data["email"].lower()).first():
        return jsonify({"message": "Email already registered"}), 409
    user = User(name=data["name"], email=data["email"].lower())
    user.set_password(data["password"])
    for f in ["age", "height_cm", "weight_kg", "gender", "fitness_level"]:
        if f in data:
            setattr(user, f, data[f])
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password"}), 401
    if not user.is_active:
        return jsonify({"message": "Account suspended"}), 403
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()})


@auth_bp.get("/me")
@jwt_required()
def me():
    uid = get_jwt_identity()
    user = db.session.get(User, int(uid)) if uid else None
    if not user:
        return jsonify({"message": "Not found"}), 404
    return jsonify(user.to_dict())


@auth_bp.put("/profile")
@jwt_required()
def update_profile():
    uid = get_jwt_identity()
    user = db.session.get(User, int(uid)) if uid else None
    if not user:
        return jsonify({"message": "Not found"}), 404
    data = request.get_json() or {}
    for f in ["name", "age", "height_cm", "weight_kg", "gender", "fitness_level"]:
        if f in data:
            setattr(user, f, data[f])
    db.session.commit()
    return jsonify(user.to_dict())


@auth_bp.post("/reset-request")
def reset_request():
    # MVP: stateless stub — in production send email with token
    data = request.get_json() or {}
    user = User.query.filter_by(email=(data.get("email") or "").lower()).first()
    if not user:
        return jsonify({"message": "If that email exists, a reset link was sent"}), 200
    reset_token = create_access_token(identity=f"reset-{user.id}")
    return jsonify({"message": "Reset token generated (MVP stub)", "reset_token": reset_token})
