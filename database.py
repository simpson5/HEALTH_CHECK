import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "health.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.executescript("""
    CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY DEFAULT 1,
        name TEXT NOT NULL,
        goal_weight_kg REAL,
        start_weight_kg REAL,
        medication TEXT,
        medication_start DATE,
        daily_protein_target INTEGER DEFAULT 110,
        daily_calorie_target INTEGER DEFAULT 1500,
        weekly_exercise_target INTEGER DEFAULT 4,
        exercise_config_json TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weight_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL UNIQUE,
        weight_kg REAL NOT NULL,
        photo TEXT,
        memo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inbody_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL UNIQUE,
        day_since_start INTEGER,
        weight_kg REAL,
        muscle_kg REAL,
        fat_kg REAL,
        fat_pct REAL,
        bmi REAL,
        bmr_kcal INTEGER,
        visceral_fat_level INTEGER,
        inbody_score INTEGER,
        weight_change_kg REAL,
        muscle_change_kg REAL,
        fat_change_kg REAL,
        photo TEXT,
        memo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS diet_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        time TEXT,
        category TEXT,
        meal_type TEXT,
        food_name TEXT NOT NULL,
        quantity TEXT,
        calories_kcal INTEGER DEFAULT 0,
        protein_g REAL DEFAULT 0,
        carbs_g REAL DEFAULT 0,
        fat_g REAL DEFAULT 0,
        photo TEXT,
        memo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_diet_date ON diet_records(date);

    CREATE TABLE IF NOT EXISTS exercise_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        start_time TEXT,
        end_time TEXT,
        total_duration_min INTEGER,
        total_volume_kg INTEGER,
        total_calories_burned INTEGER,
        exercises_json TEXT,
        memo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_exercise_date ON exercise_sessions(date);

    CREATE TABLE IF NOT EXISTS exercise_library (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT,
        target_json TEXT,
        input_type TEXT,
        exercise_group TEXT,
        sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS frequent_foods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        calories_kcal INTEGER DEFAULT 0,
        protein_g REAL DEFAULT 0,
        carbs_g REAL DEFAULT 0,
        fat_g REAL DEFAULT 0,
        category TEXT,
        meal_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS medication_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        dose TEXT NOT NULL,
        change_reason TEXT,
        side_effects TEXT,
        memo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL UNIQUE,
        day_since_start INTEGER,
        weight_kg REAL,
        weight_change TEXT,
        diet_summary_json TEXT,
        protein_achievement TEXT,
        exercise_summary TEXT,
        medication TEXT,
        analysis TEXT,
        score TEXT,
        highlights_json TEXT,
        tomorrow_advice TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weekly_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_start DATE NOT NULL,
        week_end DATE NOT NULL,
        weight_change_kg REAL,
        muscle_change_kg REAL,
        fat_change_kg REAL,
        avg_protein_g REAL,
        avg_calories_kcal REAL,
        exercise_count INTEGER,
        analysis TEXT,
        recommendations_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        type TEXT NOT NULL,
        label TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule(date);
    """)

    conn.commit()
    conn.close()
    print(f"DB initialized at {DB_PATH}")


def migrate_json_to_db():
    """simpson_data.json → SQLite 마이그레이션"""
    json_path = os.path.join(os.path.dirname(__file__), "simpson_data.json")
    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    init_db()
    conn = get_db()
    c = conn.cursor()

    # 프로필
    p = data.get("profile", {})
    c.execute("""INSERT OR REPLACE INTO profiles (id, name, goal_weight_kg, start_weight_kg, medication, medication_start,
        daily_protein_target, daily_calorie_target, weekly_exercise_target, exercise_config_json)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (p.get("name"), p.get("goal_weight_kg"), p.get("start_weight_kg"), p.get("medication"),
         p.get("medication_start"), (p.get("daily_targets") or {}).get("protein_g", 110),
         (p.get("daily_targets") or {}).get("calories_kcal", 1500),
         (p.get("weekly_targets") or {}).get("exercise_count", 4),
         json.dumps(p.get("exercise", {}), ensure_ascii=False)))

    # 체중
    for r in data.get("weight_records", []):
        c.execute("INSERT OR IGNORE INTO weight_records (date, weight_kg, photo, memo) VALUES (?,?,?,?)",
            (r["date"], r["weight_kg"], r.get("photo"), r.get("memo", "")))

    # 인바디
    for r in data.get("inbody_records", []):
        c.execute("""INSERT OR IGNORE INTO inbody_records (date, day_since_start, weight_kg, muscle_kg, fat_kg, fat_pct,
            bmi, bmr_kcal, visceral_fat_level, inbody_score, weight_change_kg, muscle_change_kg, fat_change_kg, photo, memo)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (r["date"], r.get("day_since_start"), r.get("weight_kg"), r.get("muscle_kg"), r.get("fat_kg"),
             r.get("fat_pct"), r.get("bmi"), r.get("bmr_kcal"), r.get("visceral_fat_level"),
             r.get("inbody_score"), r.get("weight_change_kg"), r.get("muscle_change_kg"),
             r.get("fat_change_kg"), r.get("photo"), r.get("memo", "")))

    # 식단
    for r in data.get("diet_records", []):
        c.execute("""INSERT INTO diet_records (date, time, category, meal_type, food_name, quantity,
            calories_kcal, protein_g, carbs_g, fat_g, photo, memo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
            (r["date"], r.get("time"), r.get("category"), r.get("meal_type"), r["food_name"],
             r.get("quantity"), r.get("calories_kcal", 0), r.get("protein_g", 0), r.get("carbs_g", 0),
             r.get("fat_g", 0), r.get("photo"), r.get("memo", "")))

    # 운동
    for r in data.get("exercise_records", []):
        c.execute("""INSERT INTO exercise_sessions (date, start_time, end_time, total_duration_min,
            total_volume_kg, total_calories_burned, exercises_json, memo) VALUES (?,?,?,?,?,?,?,?)""",
            (r["date"], r.get("start_time"), r.get("end_time"), r.get("total_duration_min"),
             r.get("total_volume_kg"), r.get("total_calories_burned"),
             json.dumps(r.get("exercises", []), ensure_ascii=False), r.get("memo", "")))

    # 운동 라이브러리
    for r in data.get("exercise_library", []):
        c.execute("""INSERT OR REPLACE INTO exercise_library (id, name, type, target_json, input_type, exercise_group)
            VALUES (?,?,?,?,?,?)""",
            (r["id"], r["name"], r.get("type"), json.dumps(r.get("target", []), ensure_ascii=False),
             r.get("input_type"), r.get("group")))

    # 자주 먹는 음식
    for r in data.get("frequent_foods", []):
        c.execute("""INSERT OR REPLACE INTO frequent_foods (id, name, description, calories_kcal, protein_g, carbs_g, fat_g, category, meal_type)
            VALUES (?,?,?,?,?,?,?,?,?)""",
            (r["id"], r["name"], r.get("description"), r.get("calories_kcal", 0),
             r.get("protein_g", 0), r.get("carbs_g", 0), r.get("fat_g", 0),
             r.get("category"), r.get("meal_type")))

    # 투약
    for r in data.get("medication_records", []):
        c.execute("INSERT INTO medication_records (date, dose, change_reason, side_effects, memo) VALUES (?,?,?,?,?)",
            (r["date"], r["dose"], r.get("change_reason"), r.get("side_effects"), r.get("memo", "")))

    # 일일 리포트
    for r in data.get("daily_reports", []):
        c.execute("""INSERT OR IGNORE INTO daily_reports (date, day_since_start, weight_kg, weight_change,
            diet_summary_json, protein_achievement, exercise_summary, medication, analysis, score, highlights_json, tomorrow_advice)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
            (r["date"], r.get("day_since_start"), r.get("weight_kg"), r.get("weight_change"),
             json.dumps(r.get("diet_summary", {}), ensure_ascii=False), r.get("protein_achievement"),
             r.get("exercise_summary"), r.get("medication"), r.get("analysis"), r.get("score"),
             json.dumps(r.get("highlights", []), ensure_ascii=False), r.get("tomorrow_advice")))

    # 주간 분석
    for r in data.get("weekly_analysis", []):
        c.execute("""INSERT INTO weekly_analysis (week_start, week_end, weight_change_kg, muscle_change_kg, fat_change_kg,
            avg_protein_g, avg_calories_kcal, exercise_count, analysis, recommendations_json) VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (r["week_start"], r["week_end"], r.get("weight_change_kg"), r.get("muscle_change_kg"),
             r.get("fat_change_kg"), r.get("avg_protein_g"), r.get("avg_calories_kcal"),
             r.get("exercise_count"), r.get("analysis"),
             json.dumps(r.get("recommendations", []), ensure_ascii=False)))

    # 스케줄
    for r in data.get("schedule", []):
        c.execute("INSERT INTO schedule (date, type, label) VALUES (?,?,?)",
            (r["date"], r["type"], r["label"]))

    conn.commit()

    # 검증
    tables = ["weight_records", "inbody_records", "diet_records", "exercise_sessions",
              "exercise_library", "frequent_foods", "medication_records", "daily_reports",
              "weekly_analysis", "schedule"]
    print("\n=== 마이그레이션 결과 ===")
    for t in tables:
        count = c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        print(f"  {t}: {count}건")

    conn.close()
    print(f"\n완료! DB: {DB_PATH}")


def db_to_json():
    """SQLite → JSON 변환 (기존 API 호환용)"""
    conn = get_db()
    c = conn.cursor()

    # 프로필
    profile_row = c.execute("SELECT * FROM profiles WHERE id=1").fetchone()
    exercise_config = json.loads(profile_row["exercise_config_json"] or "{}")
    profile = {
        "name": profile_row["name"],
        "goal_weight_kg": profile_row["goal_weight_kg"],
        "start_weight_kg": profile_row["start_weight_kg"],
        "medication": profile_row["medication"],
        "medication_start": profile_row["medication_start"],
        "exercise": exercise_config,
        "daily_targets": {
            "protein_g": profile_row["daily_protein_target"],
            "calories_kcal": profile_row["daily_calorie_target"],
        },
        "weekly_targets": {
            "exercise_count": profile_row["weekly_exercise_target"],
        },
    }

    # 운동 라이브러리
    exercise_library = []
    for r in c.execute("SELECT * FROM exercise_library ORDER BY sort_order").fetchall():
        exercise_library.append({
            "id": r["id"], "name": r["name"], "type": r["type"],
            "target": json.loads(r["target_json"] or "[]"),
            "input_type": r["input_type"], "group": r["exercise_group"],
        })

    # 자주 먹는 음식
    frequent_foods = []
    for r in c.execute("SELECT * FROM frequent_foods").fetchall():
        frequent_foods.append({
            "id": r["id"], "name": r["name"], "description": r["description"],
            "calories_kcal": r["calories_kcal"], "protein_g": r["protein_g"],
            "carbs_g": r["carbs_g"], "fat_g": r["fat_g"],
            "category": r["category"], "meal_type": r["meal_type"],
        })

    # 스케줄
    schedule = [{"date": r["date"], "type": r["type"], "label": r["label"]}
                for r in c.execute("SELECT * FROM schedule ORDER BY date").fetchall()]

    # 투약
    medication_records = [{"date": r["date"], "dose": r["dose"], "change_reason": r["change_reason"],
                           "side_effects": r["side_effects"], "memo": r["memo"]}
                          for r in c.execute("SELECT * FROM medication_records ORDER BY date").fetchall()]

    # 체중
    weight_records = [{"date": r["date"], "weight_kg": r["weight_kg"], "photo": r["photo"], "memo": r["memo"]}
                      for r in c.execute("SELECT * FROM weight_records ORDER BY date").fetchall()]

    # 인바디
    inbody_records = []
    for r in c.execute("SELECT * FROM inbody_records ORDER BY date").fetchall():
        inbody_records.append({k: r[k] for k in ["date", "day_since_start", "weight_kg", "muscle_kg", "fat_kg",
            "fat_pct", "bmi", "bmr_kcal", "visceral_fat_level", "inbody_score",
            "weight_change_kg", "muscle_change_kg", "fat_change_kg", "photo", "memo"]})

    # 식단
    diet_records = []
    for r in c.execute("SELECT * FROM diet_records ORDER BY date, time").fetchall():
        diet_records.append({k: r[k] for k in ["date", "time", "category", "meal_type", "food_name",
            "quantity", "calories_kcal", "protein_g", "carbs_g", "fat_g", "photo", "memo"]})

    # 운동
    exercise_records = []
    for r in c.execute("SELECT * FROM exercise_sessions ORDER BY date, start_time").fetchall():
        exercise_records.append({
            "date": r["date"], "start_time": r["start_time"], "end_time": r["end_time"],
            "exercises": json.loads(r["exercises_json"] or "[]"),
            "total_duration_min": r["total_duration_min"], "total_volume_kg": r["total_volume_kg"],
            "total_calories_burned": r["total_calories_burned"], "memo": r["memo"],
        })

    # 일일 리포트
    daily_reports = []
    for r in c.execute("SELECT * FROM daily_reports ORDER BY date").fetchall():
        daily_reports.append({
            "date": r["date"], "day_since_start": r["day_since_start"], "weight_kg": r["weight_kg"],
            "weight_change": r["weight_change"],
            "diet_summary": json.loads(r["diet_summary_json"] or "{}"),
            "protein_achievement": r["protein_achievement"], "exercise_summary": r["exercise_summary"],
            "medication": r["medication"], "analysis": r["analysis"], "score": r["score"],
            "highlights": json.loads(r["highlights_json"] or "[]"), "tomorrow_advice": r["tomorrow_advice"],
        })

    # 주간 분석
    weekly_analysis = []
    for r in c.execute("SELECT * FROM weekly_analysis ORDER BY week_start").fetchall():
        weekly_analysis.append({
            "week_start": r["week_start"], "week_end": r["week_end"],
            "weight_change_kg": r["weight_change_kg"], "muscle_change_kg": r["muscle_change_kg"],
            "fat_change_kg": r["fat_change_kg"], "avg_protein_g": r["avg_protein_g"],
            "avg_calories_kcal": r["avg_calories_kcal"], "exercise_count": r["exercise_count"],
            "analysis": r["analysis"], "recommendations": json.loads(r["recommendations_json"] or "[]"),
        })

    conn.close()

    return {
        "profile": profile,
        "exercise_library": exercise_library,
        "frequent_foods": frequent_foods,
        "schedule": schedule,
        "medication_records": medication_records,
        "weight_records": weight_records,
        "inbody_records": inbody_records,
        "diet_records": diet_records,
        "exercise_records": exercise_records,
        "daily_reports": daily_reports,
        "weekly_analysis": weekly_analysis,
    }


if __name__ == "__main__":
    migrate_json_to_db()
