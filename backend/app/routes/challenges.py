from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from sqlalchemy import func, desc
from ..models import Challenge, ChallengeEntry, Workout, User
from ..extensions import db

chal_bp = Blueprint("challenges", __name__)
def _uid(): return int(get_jwt_identity())

def _progress(uid, ch):
    since = ch.start_date or date.today()
    if ch.challenge_type == "calories":
        v = db.session.query(func.coalesce(func.sum(Workout.calories), 0)).filter(
            Workout.user_id == uid, Workout.date >= since).scalar() or 0
        return float(v)
    if ch.challenge_type == "workouts":
        return float(Workout.query.filter(Workout.user_id == uid, Workout.date >= since).count())
    return 0.0

@chal_bp.get("")
@jwt_required()
def list_challenges():
    uid = _uid()
    out = []
    for ch in Challenge.query.filter_by(is_active=True).order_by(Challenge.id.desc()).all():
        entry = ChallengeEntry.query.filter_by(challenge_id=ch.id, user_id=uid).first()
        prog = _progress(uid, ch)
        if entry:
            entry.progress = prog
            entry.completed = prog >= ch.target
            out.append(ch.to_dict({**entry.to_dict(), "pct": round(min(100, prog / ch.target * 100), 1) if ch.target else 0}))
        else:
            out.append(ch.to_dict(None))
    db.session.commit()
    return jsonify(out)

@chal_bp.post("")
@jwt_required()
def create_challenge():
    u = User.query.get(_uid())
    if not u or not u.is_admin: return jsonify({"message": "Forbidden"}), 403
    d = request.get_json() or {}
    if not d.get("title"): return jsonify({"message": "title required"}), 400
    ch = Challenge(title=d["title"], description=d.get("description"),
                   challenge_type=d.get("challenge_type", "workouts"),
                   target=d.get("target", 30), duration_days=d.get("duration_days", 30))
    if d.get("start_date"): ch.start_date = date.fromisoformat(d["start_date"])
    db.session.add(ch); db.session.commit()
    return jsonify(ch.to_dict()), 201

@chal_bp.put("/<int:cid>")
@jwt_required()
def update_challenge(cid):
    u = User.query.get(_uid())
    if not u or not u.is_admin: return jsonify({"message": "Forbidden"}), 403
    ch = Challenge.query.get(cid)
    if not ch: return jsonify({"message": "Not found"}), 404
    d = request.get_json() or {}
    for f in ["title", "description", "challenge_type", "target", "duration_days", "is_active"]:
        if f in d: setattr(ch, f, d[f])
    if d.get("start_date"): ch.start_date = date.fromisoformat(d["start_date"])
    db.session.commit()
    return jsonify(ch.to_dict())

@chal_bp.post("/<int:cid>/join")
@jwt_required()
def join(cid):
    ch = Challenge.query.get(cid)
    if not ch: return jsonify({"message": "Not found"}), 404
    e = ChallengeEntry.query.filter_by(challenge_id=cid, user_id=_uid()).first()
    if not e:
        e = ChallengeEntry(challenge_id=cid, user_id=_uid(), progress=_progress(_uid(), ch))
        db.session.add(e); db.session.commit()
    return jsonify(e.to_dict())

@chal_bp.get("/<int:cid>/leaderboard")
@jwt_required()
def leaderboard(cid):
    ch = Challenge.query.get(cid)
    if not ch: return jsonify({"message": "Not found"}), 404
    rows = ChallengeEntry.query.filter_by(challenge_id=cid).order_by(desc(ChallengeEntry.progress)).limit(20).all()
    out = []
    for e in rows:
        u = User.query.get(e.user_id)
        out.append({"name": u.name if u else "?", "progress": e.progress, "completed": e.completed})
    return jsonify(out)
