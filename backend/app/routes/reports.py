from flask import Blueprint, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from fpdf import FPDF
from io import BytesIO
from datetime import date
from sqlalchemy import func
from ..models import Workout, Goal, User, NutritionLog
from ..extensions import db

report_bp = Blueprint("reports", __name__)

@report_bp.get("/fitness.pdf")
@jwt_required()
def fitness_pdf():
    uid = int(get_jwt_identity())
    user = User.query.get(uid)
    total = Workout.query.filter_by(user_id=uid).count()
    cals = db.session.query(func.coalesce(func.sum(Workout.calories), 0)).filter_by(user_id=uid).scalar() or 0
    goals = Goal.query.filter_by(user_id=uid).all()
    recent = Workout.query.filter_by(user_id=uid).order_by(Workout.date.desc()).limit(15).all()
    meals = NutritionLog.query.filter_by(user_id=uid).order_by(NutritionLog.date.desc()).limit(10).all()

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 12, "FitTrack Pro - Fitness Report", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 8, f"User: {user.name} ({user.email})  |  Date: {date.today()}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"BMI: {user.bmi}  |  Daily needs: {user.daily_calorie_needs()} kcal", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, f"Summary: {total} workouts, {round(float(cals))} kcal burned", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Goals", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    for g in goals or [None]:
        if g is None:
            pdf.cell(0, 7, "No goals yet.", new_x="LMARGIN", new_y="NEXT")
            break
        pdf.cell(0, 7, f"- {g.title} [{g.status}] {g.current_progress}/{g.target} ({g.progress_pct}%)", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Recent workouts", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    for w in recent:
        pdf.cell(0, 6, f"{w.date}  {w.exercise_name}  {w.sets}x{w.reps}  {w.weight_kg}kg  {w.calories}kcal", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Recent meals", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    for m in meals:
        pdf.cell(0, 6, f"{m.date}  {m.meal_type}: {m.food_name} ({m.calories} kcal)", new_x="LMARGIN", new_y="NEXT")

    buf = BytesIO(pdf.output())
    buf.seek(0)
    return send_file(buf, mimetype="application/pdf", as_attachment=True, download_name="fittrack-report.pdf")
