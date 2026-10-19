"""Award badges based on workout/goal activity. Idempotent."""
from datetime import date, timedelta
from .models import Badge, UserBadge, Workout, Goal
from .extensions import db

DEFAULT_BADGES = [
    ("first_workout", "First Workout", "Log your first workout", "🎯"),
    ("streak_7", "7-Day Streak", "Work out 7 days in a row", "🔥"),
    ("streak_30", "30-Day Streak", "Work out 30 days in a row", "⚡"),
    ("workouts_10", "10 Workouts", "Complete 10 workouts", "💪"),
    ("workouts_50", "50 Workouts", "Complete 50 workouts", "🏋️"),
    ("workouts_100", "100 Workouts", "Complete 100 workouts", "🏆"),
    ("goal_crusher", "Goal Crusher", "Complete any goal", "🎖️"),
]


def ensure_badges():
    for key, name, desc, icon in DEFAULT_BADGES:
        if not Badge.query.filter_by(key=key).first():
            db.session.add(Badge(key=key, name=name, description=desc, icon=icon))
    db.session.commit()


def _streak(uid: int) -> int:
    dates = {w.date for w in Workout.query.filter_by(user_id=uid).all()}
    s, d = 0, date.today()
    while d in dates:
        s += 1
        d -= timedelta(days=1)
    return s


def award_for_user(uid: int) -> list:
    ensure_badges()
    total = Workout.query.filter_by(user_id=uid).count()
    streak = _streak(uid)
    done_goals = Goal.query.filter_by(user_id=uid, status="completed").count()
    earned = []
    rules = {
        "first_workout": total >= 1,
        "workouts_10": total >= 10,
        "workouts_50": total >= 50,
        "workouts_100": total >= 100,
        "streak_7": streak >= 7,
        "streak_30": streak >= 30,
        "goal_crusher": done_goals >= 1,
    }
    have = {Badge.query.get(ub.badge_id).key for ub in UserBadge.query.filter_by(user_id=uid).all() if Badge.query.get(ub.badge_id)}
    for key, ok in rules.items():
        if ok and key not in have:
            b = Badge.query.filter_by(key=key).first()
            if b:
                db.session.add(UserBadge(user_id=uid, badge_id=b.id))
                earned.append(b.to_dict())
    if earned:
        db.session.commit()
    return earned
