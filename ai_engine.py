"""AI 엔진 — claude -p CLI 래퍼 + DB 기반 작업 큐"""

import asyncio
import json
import os
import subprocess
from datetime import datetime
from pathlib import Path
from database import get_db

PROJECT_ROOT = Path(__file__).parent
CONFIG_PATH = PROJECT_ROOT / "data" / "config.json"


def get_token():
    """환경변수 우선, 없으면 config.json에서 토큰 읽기"""
    token = os.environ.get("CLAUDE_CODE_OAUTH_TOKEN")
    if token:
        return token
    if CONFIG_PATH.exists():
        config = json.loads(CONFIG_PATH.read_text())
        return config.get("claude_oauth_token")
    return None


def is_configured():
    """AI 엔진 사용 가능 여부"""
    return bool(get_token())


def create_job(job_type, input_data):
    """작업 생성 → job_id 반환"""
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO ai_jobs (type, status, input_json) VALUES (?, 'queued', ?)",
        (job_type, json.dumps(input_data, ensure_ascii=False))
    )
    job_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return job_id


def get_job(job_id):
    """작업 조회"""
    conn = get_db()
    row = conn.execute("SELECT * FROM ai_jobs WHERE id=?", (job_id,)).fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "type": row["type"],
        "status": row["status"],
        "input": json.loads(row["input_json"] or "{}"),
        "output": json.loads(row["output_json"] or "null"),
        "error": row["error"],
        "started_at": row["started_at"],
        "finished_at": row["finished_at"],
        "created_at": row["created_at"],
    }


def get_recent_jobs(limit=10):
    """최근 작업 목록"""
    conn = get_db()
    rows = conn.execute(
        "SELECT id, type, status, created_at, finished_at FROM ai_jobs ORDER BY id DESC LIMIT ?",
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_job(job_id, status, output=None, error=None):
    """작업 상태 업데이트"""
    conn = get_db()
    now = datetime.now().isoformat()
    if status == "running":
        conn.execute("UPDATE ai_jobs SET status=?, started_at=? WHERE id=?", (status, now, job_id))
    elif status in ("done", "failed"):
        conn.execute(
            "UPDATE ai_jobs SET status=?, output_json=?, error=?, finished_at=? WHERE id=?",
            (status, json.dumps(output, ensure_ascii=False) if output else None, error, now, job_id)
        )
    conn.commit()
    conn.close()


async def run_claude(prompt, timeout=120):
    """claude -p 비대화형 실행"""
    token = get_token()
    if not token:
        return {"ok": False, "error": "토큰 미설정"}

    env = os.environ.copy()
    env["CLAUDE_CODE_OAUTH_TOKEN"] = token

    try:
        proc = await asyncio.create_subprocess_exec(
            "claude", "-p", prompt,
            cwd=str(PROJECT_ROOT),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)

        return {
            "ok": proc.returncode == 0,
            "output": stdout.decode().strip(),
            "error": stderr.decode().strip() if proc.returncode != 0 else None,
        }
    except asyncio.TimeoutError:
        proc.kill()
        return {"ok": False, "error": f"타임아웃 ({timeout}초)"}
    except FileNotFoundError:
        return {"ok": False, "error": "claude CLI 미설치"}


async def process_job(job_id):
    """단일 작업 처리"""
    job = get_job(job_id)
    if not job or job["status"] != "queued":
        return

    update_job(job_id, "running")
    input_data = job["input"]
    job_type = job["type"]

    # 프롬프트 구성
    prompt = build_prompt(job_type, input_data)

    # claude 실행
    result = await run_claude(prompt)

    if result["ok"]:
        # 응답 파싱 시도
        parsed = try_parse_json(result["output"])
        update_job(job_id, "done", output=parsed or {"raw": result["output"]})
    else:
        update_job(job_id, "failed", error=result["error"])


def build_prompt(job_type, input_data):
    """작업 유형별 프롬프트 생성"""

    if job_type == "diet_draft":
        photo = input_data.get("photo", "")
        memo = input_data.get("memo", "")
        return f"""아래 정보로 식단 초안을 JSON으로 만들어줘. DB에 저장하지 마.
사진: {photo}
메모: {memo}
반드시 아래 JSON 형식으로만 응답해:
{{"mode":"diet_draft","message":"설명","payload":{{"date":"YYYY-MM-DD","meal_type":"끼니","food_name":"음식명","quantity":"분량","calories_kcal":0,"protein_g":0,"carbs_g":0,"fat_g":0}}}}"""

    elif job_type == "daily_report":
        date = input_data.get("date", datetime.now().strftime("%Y-%m-%d"))
        return f"""오늘({date}) 일일 리포트를 JSON으로 만들어줘. DB에 저장하지 마.
DB에서 {date} 식단/운동/체중 데이터를 확인하고 분석해줘.
반드시 아래 JSON 형식으로만 응답해:
{{"mode":"daily_report","message":"요약","payload":{{"date":"{date}","score":"A~D","analysis":"분석","highlights":["항목들"],"tomorrow_advice":"조언","diet_summary":{{"total_calories":0,"total_protein":0}}}}}}"""

    elif job_type == "coach":
        question = input_data.get("question", "")
        return f"""건강관리자로서 아래 질문에 답변해줘.
질문: {question}
반드시 아래 JSON 형식으로만 응답해:
{{"mode":"coach","message":"답변 내용"}}"""

    return input_data.get("prompt", "")


def try_parse_json(text):
    """텍스트에서 JSON 추출 시도"""
    text = text.strip()

    # 직접 JSON인 경우
    try:
        return json.loads(text)
    except:
        pass

    # ```json ... ``` 블록 추출
    import re
    match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except:
            pass

    # { ... } 추출
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except:
            pass

    return None


# 큐 처리 워커
_processing = False


async def process_queue():
    """큐에서 대기 중인 작업 순차 처리"""
    global _processing
    if _processing:
        return
    _processing = True

    try:
        while True:
            conn = get_db()
            row = conn.execute(
                "SELECT id FROM ai_jobs WHERE status='queued' ORDER BY id LIMIT 1"
            ).fetchone()
            conn.close()

            if not row:
                break

            await process_job(row["id"])
    finally:
        _processing = False
