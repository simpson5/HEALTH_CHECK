from fastapi import FastAPI, UploadFile, File, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
import json
import os
from datetime import datetime
from database import get_db, db_to_json, init_db

BASE_DIR = os.path.dirname(__file__)
PHOTOS_DIR = os.path.join(BASE_DIR, "photos")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# DB 초기화
init_db()

app = FastAPI()

# === API ===

@app.get("/api/data")
def get_data():
    """기존 프론트엔드 호환: DB에서 JSON 형태로 반환"""
    return db_to_json()

@app.post("/api/photo")
async def upload_photo(file: UploadFile = File(...)):
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{timestamp}.{ext}"
    is_image = ext.lower() in ("jpg", "jpeg", "png", "webp", "heic", "gif")
    save_dir = PHOTOS_DIR if is_image else UPLOADS_DIR
    folder = "photos" if is_image else "uploads"
    filepath = os.path.join(save_dir, filename)
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)
    return JSONResponse({"ok": True, "filename": filename, "path": f"{folder}/{filename}", "type": "image" if is_image else "file"})

@app.post("/api/exercise")
async def save_exercise(request: Request):
    body = await request.json()
    conn = get_db()
    # 같은 날짜+시작시간 → 덮어쓰기
    existing = conn.execute("SELECT id FROM exercise_sessions WHERE date=? AND start_time=?",
        (body.get("date"), body.get("start_time"))).fetchone()
    if existing:
        conn.execute("""UPDATE exercise_sessions SET end_time=?, total_duration_min=?, total_volume_kg=?,
            total_calories_burned=?, exercises_json=?, memo=? WHERE id=?""",
            (body.get("end_time"), body.get("total_duration_min"), body.get("total_volume_kg"),
             body.get("total_calories_burned"), json.dumps(body.get("exercises", []), ensure_ascii=False),
             body.get("memo", ""), existing["id"]))
    else:
        conn.execute("""INSERT INTO exercise_sessions (date, start_time, end_time, total_duration_min,
            total_volume_kg, total_calories_burned, exercises_json, memo) VALUES (?,?,?,?,?,?,?,?)""",
            (body.get("date"), body.get("start_time"), body.get("end_time"), body.get("total_duration_min"),
             body.get("total_volume_kg"), body.get("total_calories_burned"),
             json.dumps(body.get("exercises", []), ensure_ascii=False), body.get("memo", "")))
    conn.commit()
    conn.close()
    return JSONResponse({"ok": True})

@app.delete("/api/exercise")
async def delete_exercise(request: Request):
    body = await request.json()
    conn = get_db()
    conn.execute("DELETE FROM exercise_sessions WHERE date=? AND start_time=?",
        (body.get("date"), body.get("start_time")))
    conn.commit()
    conn.close()
    return JSONResponse({"ok": True})

@app.get("/api/foods")
def get_foods():
    conn = get_db()
    rows = conn.execute("SELECT * FROM frequent_foods").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/foods")
async def add_food(request: Request):
    body = await request.json()
    conn = get_db()
    conn.execute("""INSERT OR REPLACE INTO frequent_foods (id, name, description, calories_kcal, protein_g, carbs_g, fat_g, category, meal_type)
        VALUES (?,?,?,?,?,?,?,?,?)""",
        (body.get("id"), body.get("name"), body.get("description"),
         body.get("calories_kcal", 0), body.get("protein_g", 0), body.get("carbs_g", 0),
         body.get("fat_g", 0), body.get("category"), body.get("meal_type")))
    conn.commit()
    conn.close()
    return JSONResponse({"ok": True})

@app.delete("/api/foods/{food_id}")
async def delete_food(food_id: str):
    conn = get_db()
    conn.execute("DELETE FROM frequent_foods WHERE id=?", (food_id,))
    conn.commit()
    conn.close()
    return JSONResponse({"ok": True})

# === 식단 API ===
@app.post("/api/diet")
async def add_diet(request: Request):
    body = await request.json()
    conn = get_db()
    conn.execute("""INSERT INTO diet_records (date, time, category, meal_type, food_name, quantity,
        calories_kcal, protein_g, carbs_g, fat_g, photo, memo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
        (body.get("date"), body.get("time"), body.get("category"), body.get("meal_type"),
         body.get("food_name"), body.get("quantity"), body.get("calories_kcal", 0),
         body.get("protein_g", 0), body.get("carbs_g", 0), body.get("fat_g", 0),
         body.get("photo"), body.get("memo", "")))
    conn.commit()
    conn.close()
    return JSONResponse({"ok": True})

# === 체중 API ===
@app.post("/api/weight")
async def add_weight(request: Request):
    body = await request.json()
    conn = get_db()
    conn.execute("INSERT OR REPLACE INTO weight_records (date, weight_kg, photo, memo) VALUES (?,?,?,?)",
        (body.get("date"), body.get("weight_kg"), body.get("photo"), body.get("memo", "")))
    conn.commit()
    conn.close()
    return JSONResponse({"ok": True})

# === 투약 API ===
@app.post("/api/medication")
async def add_medication(request: Request):
    body = await request.json()
    conn = get_db()
    conn.execute("INSERT INTO medication_records (date, dose, change_reason, side_effects, memo) VALUES (?,?,?,?,?)",
        (body.get("date"), body.get("dose"), body.get("change_reason"), body.get("side_effects"), body.get("memo", "")))
    conn.commit()
    conn.close()
    return JSONResponse({"ok": True})

# === 인바디 API ===
@app.post("/api/inbody")
async def add_inbody(request: Request):
    body = await request.json()
    conn = get_db()
    conn.execute("""INSERT OR REPLACE INTO inbody_records (date, day_since_start, weight_kg, muscle_kg, fat_kg, fat_pct,
        bmi, bmr_kcal, visceral_fat_level, inbody_score, weight_change_kg, muscle_change_kg, fat_change_kg, photo, memo)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (body.get("date"), body.get("day_since_start"), body.get("weight_kg"), body.get("muscle_kg"),
         body.get("fat_kg"), body.get("fat_pct"), body.get("bmi"), body.get("bmr_kcal"),
         body.get("visceral_fat_level"), body.get("inbody_score"), body.get("weight_change_kg"),
         body.get("muscle_change_kg"), body.get("fat_change_kg"), body.get("photo"), body.get("memo", "")))
    conn.commit()
    conn.close()
    return JSONResponse({"ok": True})

# === 리포트 API ===
@app.post("/api/report/daily")
async def add_daily_report(request: Request):
    body = await request.json()
    conn = get_db()
    conn.execute("""INSERT OR REPLACE INTO daily_reports (date, day_since_start, weight_kg, weight_change,
        diet_summary_json, protein_achievement, exercise_summary, medication, analysis, score, highlights_json, tomorrow_advice)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
        (body.get("date"), body.get("day_since_start"), body.get("weight_kg"), body.get("weight_change"),
         json.dumps(body.get("diet_summary", {}), ensure_ascii=False), body.get("protein_achievement"),
         body.get("exercise_summary"), body.get("medication"), body.get("analysis"), body.get("score"),
         json.dumps(body.get("highlights", []), ensure_ascii=False), body.get("tomorrow_advice")))
    conn.commit()
    conn.close()
    return JSONResponse({"ok": True})

@app.get("/api/photos")
def list_photos():
    files = sorted(os.listdir(PHOTOS_DIR), reverse=True)
    files = [f for f in files if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".heic"))]
    return [{"filename": f, "path": f"photos/{f}"} for f in files]

# === 파일 서빙 ===

app.mount("/photos", StaticFiles(directory=PHOTOS_DIR), name="photos")
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# React SPA 서빙
DIST_DIR = os.path.join(BASE_DIR, "frontend", "dist")
STATIC_DIR = os.path.join(BASE_DIR, "static")
SERVE_DIR = DIST_DIR if os.path.exists(DIST_DIR) else STATIC_DIR

app.mount("/assets", StaticFiles(directory=os.path.join(SERVE_DIR, "assets")), name="assets")

@app.get("/{path:path}")
async def spa_fallback(path: str):
    file_path = os.path.join(SERVE_DIR, path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(SERVE_DIR, "index.html"))
