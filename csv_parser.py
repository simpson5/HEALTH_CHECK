"""인바디 CSV 파서 — AI 불필요, 코드로 직접 처리"""

import csv
from datetime import datetime


def parse_inbody_csv(filepath):
    """인바디 CSV → dict 변환"""
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        row = next(reader)

    date_raw = row.get("날짜", "")
    # 날짜 형식: 20260401072140 → 2026-04-01
    if len(date_raw) >= 8:
        date_str = f"{date_raw[:4]}-{date_raw[4:6]}-{date_raw[6:8]}"
    else:
        date_str = datetime.now().strftime("%Y-%m-%d")

    def safe_float(key, default=None):
        val = row.get(key, "")
        if val and val != "-":
            try:
                return float(val)
            except:
                pass
        return default

    def safe_int(key, default=None):
        val = row.get(key, "")
        if val and val != "-":
            try:
                return int(float(val))
            except:
                pass
        return default

    return {
        "date": date_str,
        "weight_kg": safe_float("체중(kg)"),
        "muscle_kg": safe_float("골격근량(kg)"),
        "fat_kg": safe_float("체지방량(kg)"),
        "fat_pct": safe_float("체지방률(%)"),
        "bmi": safe_float("BMI(kg/m²)"),
        "bmr_kcal": safe_int("기초대사량(kcal)"),
        "visceral_fat_level": safe_int("내장지방레벨(Level)"),
        "inbody_score": safe_float("인바디점수"),
    }
