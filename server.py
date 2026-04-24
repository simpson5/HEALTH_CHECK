from fastapi import FastAPI, UploadFile, File, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
import json
import os
from datetime import datetime
from database import get_db, db_to_json, init_db
from pathlib import Path
import asyncio

BASE_DIR = os.path.dirname(__file__)
CONFIG_PATH = os.path.join(BASE_DIR, "data", "config.json")
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

# === 즐겨찾기 토글 ===
@app.put("/api/exercise-library/{ex_id}/favorite")
async def toggle_favorite(ex_id: str):
    conn = get_db()
    row = conn.execute("SELECT is_favorite FROM exercise_library WHERE id=?", (ex_id,)).fetchone()
    if row:
        new_val = 0 if row["is_favorite"] else 1
        conn.execute("UPDATE exercise_library SET is_favorite=? WHERE id=?", (new_val, ex_id))
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

# === 프로필 API ===
def _validate_profile_patch(fields):
    """21번 계획 L9 7종 검증. 실패 시 error string, OK면 None."""
    def num_in(k, lo, hi, label):
        if k in fields:
            try: v = float(fields[k])
            except (TypeError, ValueError): return f"{label}는 숫자여야 함"
            if not (lo <= v <= hi): return f"{label} 범위는 {lo}~{hi}"
        return None
    def int_in(k, lo, hi, label):
        if k in fields:
            try: v = int(fields[k])
            except (TypeError, ValueError): return f"{label}는 정수여야 함"
            if not (lo <= v <= hi): return f"{label} 범위는 {lo}~{hi}"
        return None

    if "name" in fields:
        v = fields["name"]
        if not isinstance(v, str) or not v.strip():
            return "name은 비울 수 없음"
    for k, label in [("goal_weight_kg", "목표 체중"), ("start_weight_kg", "시작 체중")]:
        err = num_in(k, 30, 300, label)
        if err: return err
    for k, label in [
        ("daily_protein_target", "단백질"),
        ("daily_carb_target", "탄수"),
        ("daily_fat_target", "지방"),
    ]:
        err = int_in(k, 1, 500, label)
        if err: return err
    err = int_in("daily_calorie_target", 100, 10000, "칼로리")
    if err: return err
    err = int_in("weekly_exercise_target", 0, 21, "주간 운동")
    if err: return err
    if "meal_plan" in fields:
        mp = fields["meal_plan"]
        if not isinstance(mp, list): return "meal_plan은 배열이어야 함"
        if len(mp) > 10: return "meal_plan 최대 10행"
        for i, row in enumerate(mp):
            if not isinstance(row, dict): return f"meal_plan[{i}]는 객체여야 함"
            for key in ("meal", "food", "protein"):
                v = row.get(key)
                if not isinstance(v, str) or not (1 <= len(v) <= 60):
                    return f"meal_plan[{i}].{key}는 1~60자 문자열"
    return None


@app.patch("/api/profile")
async def update_profile(request: Request):
    """프로필 필드 부분 업데이트 (profiles.id=1 단일 행)"""
    body = await request.json()
    allowed = {
        "goal_weight_kg", "daily_protein_target", "daily_calorie_target", "weekly_exercise_target",
        "name", "start_weight_kg", "daily_carb_target", "daily_fat_target", "meal_plan",
    }
    fields = {k: v for k, v in body.items() if k in allowed}
    if not fields:
        return JSONResponse({"ok": False, "error": "변경할 필드 없음"}, status_code=400)
    err = _validate_profile_patch(fields)
    if err:
        return JSONResponse({"ok": False, "error": err}, status_code=400)

    conn = get_db()
    set_parts, values = [], []
    for k, v in fields.items():
        if k == "meal_plan":
            set_parts.append("meal_plan_json=?")
            values.append(json.dumps(v, ensure_ascii=False))
        else:
            set_parts.append(f"{k}=?")
            values.append(v)
    values.append(1)
    conn.execute(f"UPDATE profiles SET {', '.join(set_parts)} WHERE id=?", values)
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

# === AI API ===

@app.post("/api/ai/diet-draft")
async def ai_diet_draft(request: Request):
    """식단 초안 생성 (저장 안 함)"""
    from ai_engine import create_job, process_queue, is_configured
    if not is_configured():
        return JSONResponse({"ok": False, "error": "AI 미설정. 설정에서 토큰을 입력하세요."}, status_code=400)
    body = await request.json()
    job_id = create_job("diet_draft", body)
    asyncio.create_task(process_queue())
    return JSONResponse({"ok": True, "job_id": job_id})

@app.post("/api/ai/daily-report")
async def ai_daily_report(request: Request):
    """일일 리포트 자동 생성 (저장 안 함)"""
    from ai_engine import create_job, process_queue, is_configured
    if not is_configured():
        return JSONResponse({"ok": False, "error": "AI 미설정"}, status_code=400)
    body = await request.json()
    job_id = create_job("daily_report", body)
    asyncio.create_task(process_queue())
    return JSONResponse({"ok": True, "job_id": job_id})

@app.post("/api/ai/coach")
async def ai_coach(request: Request):
    """건강 상담"""
    from ai_engine import create_job, process_queue, is_configured
    if not is_configured():
        return JSONResponse({"ok": False, "error": "AI 미설정"}, status_code=400)
    body = await request.json()
    job_id = create_job("coach", body)
    asyncio.create_task(process_queue())
    return JSONResponse({"ok": True, "job_id": job_id})

@app.post("/api/ai/inbody-parse")
async def ai_inbody_parse(request: Request):
    """인바디 사진 AI 파싱 (저장 안 함, 결과를 프론트에 돌려줌)"""
    from ai_engine import create_job, process_queue, is_configured
    if not is_configured():
        return JSONResponse({"ok": False, "error": "AI 미설정"}, status_code=400)
    body = await request.json()
    job_id = create_job("inbody_parse", body)
    asyncio.create_task(process_queue())
    return JSONResponse({"ok": True, "job_id": job_id})

@app.post("/api/ai/weekly-report")
async def ai_weekly_report(request: Request):
    """주간 종합 분석 리포트 생성"""
    from ai_engine import create_job, process_queue, is_configured
    if not is_configured():
        return JSONResponse({"ok": False, "error": "AI 미설정"}, status_code=400)
    body = await request.json()
    job_id = create_job("weekly_report", body)
    asyncio.create_task(process_queue())
    return JSONResponse({"ok": True, "job_id": job_id})

@app.post("/api/ai/quick-diet")
async def ai_quick_diet(request: Request):
    """frequent_foods 즉시 매칭 → 자동 저장"""
    body = await request.json()
    text = body.get("text", "").strip().lower()
    conn = get_db()
    foods = conn.execute("SELECT * FROM frequent_foods").fetchall()
    matched = None
    for f in foods:
        if text in f["name"].lower() or f["name"].lower() in text:
            matched = dict(f)
            break
    if not matched:
        conn.close()
        return JSONResponse({"ok": False, "matched": False, "message": "매칭되는 음식이 없습니다."})

    from datetime import datetime
    now = datetime.now()
    conn.execute("""INSERT INTO diet_records (date, time, category, meal_type, food_name, quantity,
        calories_kcal, protein_g, carbs_g, fat_g, memo) VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
        (now.strftime("%Y-%m-%d"), now.strftime("%H:%M"), matched.get("category", "meal"),
         matched.get("meal_type", "간식"), matched["name"], matched.get("description", ""),
         matched["calories_kcal"], matched["protein_g"], matched["carbs_g"], matched["fat_g"], "빠른 등록"))
    conn.commit()
    conn.close()
    return JSONResponse({"ok": True, "matched": True, "auto_saved": True,
        "message": f"{matched['name']} 등록 완료 (P{matched['protein_g']}g)"})

@app.get("/api/ai/jobs/{job_id}")
def get_ai_job(job_id: int):
    """작업 상태 조회"""
    from ai_engine import get_job
    job = get_job(job_id)
    if not job:
        return JSONResponse({"error": "작업 없음"}, status_code=404)
    return JSONResponse(job)

@app.get("/api/ai/jobs")
def list_ai_jobs(limit: int = 10):
    """최근 작업 목록 (limit 파라미터 지원)"""
    from ai_engine import get_recent_jobs
    return get_recent_jobs(limit)

# === CSV 파싱 ===

@app.post("/api/csv/inbody")
async def parse_inbody(request: Request):
    """인바디 CSV 파싱 (코드 기반, AI 아님)"""
    from csv_parser import parse_inbody_csv
    body = await request.json()
    filepath = os.path.join(BASE_DIR, body["path"])
    try:
        result = parse_inbody_csv(filepath)
        return JSONResponse({"ok": True, "data": result})
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=400)

# === 설정 API ===

@app.get("/api/settings")
def get_settings():
    """설정 조회"""
    from ai_engine import is_configured, get_recent_jobs
    config = json.loads(Path(CONFIG_PATH).read_text()) if Path(CONFIG_PATH).exists() else {}
    token = config.get("claude_oauth_token", "")
    conn = get_db()
    db_count = conn.execute("SELECT COUNT(*) FROM diet_records").fetchone()[0]
    photo_count = len([f for f in os.listdir(PHOTOS_DIR) if not f.startswith(".")])
    conn.close()
    return {
        "has_token": bool(token),
        "token_preview": token[:8] + "..." if len(token) > 8 else "",
        "ai_configured": is_configured(),
        "db_records": db_count,
        "photo_count": photo_count,
        "recent_jobs": get_recent_jobs(5),
    }

@app.post("/api/settings/token")
async def set_token(request: Request):
    """OAuth 토큰 저장"""
    body = await request.json()
    os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
    config = json.loads(Path(CONFIG_PATH).read_text()) if Path(CONFIG_PATH).exists() else {}
    config["claude_oauth_token"] = body["token"]
    Path(CONFIG_PATH).write_text(json.dumps(config, indent=2))
    return JSONResponse({"ok": True})

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
