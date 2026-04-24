#!/usr/bin/env python3
"""Simpson Health — 동적 상태 3종 캡처 (Session + AI 응답)

29_session_active          : /session (sessionStorage 시드 후)
30_coach_pending           : /coach 질문 전송 직후 (3-dot loader)
31_coach_answered          : /coach AI 답변 수신 완료
32_weekly_report_pending   : /weekly-report 생성 버튼 직후
33_weekly_report_answered  : /weekly-report 생성 완료

AI 응답은 실제 Claude 호출이므로 Coach 최대 2분, WeeklyReport 최대 3분 대기.
실패 시 pending 상태만 저장하고 계속 진행.
"""
from __future__ import annotations
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

PROJECT = Path(__file__).resolve().parents[2]
OUT = PROJECT / "docs" / "screenshots_v3"
BASE = "http://localhost:18000"
VIEWPORT = {"width": 430, "height": 932}


def make_page(p):
    b = p.chromium.launch()
    ctx = b.new_context(viewport=VIEWPORT, device_scale_factor=2, is_mobile=True, has_touch=True)
    return b, ctx, ctx.new_page()


def shot(page, name):
    t = OUT / f"{name}.png"
    page.screenshot(path=str(t), full_page=True)
    print(f"   saved {name}.png ({t.stat().st_size // 1024} KB)")


def capture_session(p):
    """29_session_active — sessionStorage에 plan 시드 후 /session 진입"""
    print("\n[Session]")
    b, _, page = make_page(p)
    try:
        # addInitScript로 페이지 로드 전 시드 주입
        plan = [
            {"id": "chest_press", "name": "머신 체스트 프레스",
             "weight": 30, "reps": 12, "done": [True, False, False], "target": "30kg × 12"},
            {"id": "lat_pulldown", "name": "랫 풀다운",
             "weight": 35, "reps": 12, "done": [True, True, False], "target": "35kg × 12"},
            {"id": "shoulder_press", "name": "머신 숄더 프레스",
             "weight": 25, "reps": 12, "done": [False, False, False], "target": "25kg × 12"},
        ]
        import json, time
        start_at = int(time.time() * 1000) - 8 * 60 * 1000  # 8분 전 시작
        start_time = time.strftime("%H:%M")
        script = (
            f"sessionStorage.setItem('session:plan', {json.dumps(json.dumps(plan, ensure_ascii=False))});"
            f"sessionStorage.setItem('session:startAt', '{start_at}');"
            f"sessionStorage.setItem('session:startTime', '{start_time}');"
        )
        page.add_init_script(script)
        page.goto(BASE + "/session", wait_until="networkidle", timeout=10000)
        page.wait_for_timeout(1200)
        shot(page, "29_session_active")
    except Exception as e:
        print(f"   !! session 실패: {type(e).__name__}: {e}")
    finally:
        try: b.close()
        except: pass


def capture_coach(p):
    """30_coach_pending + 31_coach_answered — 실 AI 호출"""
    print("\n[Coach]")
    b, _, page = make_page(p)
    try:
        page.goto(BASE + "/coach", wait_until="networkidle", timeout=10000)
        page.wait_for_timeout(800)
        # 질문 입력
        textarea = page.locator("textarea[placeholder='질문을 입력...']")
        textarea.fill("오늘 단백질이 부족한데 저녁에 뭘 먹으면 좋을까요?", timeout=2000)
        page.wait_for_timeout(300)
        # 전송 버튼 (accent variant TapBtn)
        page.locator("button[disabled='false'], button:not([disabled])").filter(
            has=page.locator("svg")
        ).last.click(timeout=2000)
        page.wait_for_timeout(1500)
        shot(page, "30_coach_pending")

        # 답변 대기: .animate-pulse 점 3개가 사라질 때까지 (최대 2분)
        print("   AI 답변 대기 (최대 120초)...")
        try:
            page.wait_for_function(
                "() => document.querySelectorAll('.animate-pulse').length === 0",
                timeout=120_000,
            )
            page.wait_for_timeout(800)
            shot(page, "31_coach_answered")
        except PWTimeout:
            print("   !! 답변 타임아웃 — pending 상태만 저장됨")
    except Exception as e:
        print(f"   !! coach 실패: {type(e).__name__}: {e}")
    finally:
        try: b.close()
        except: pass


def capture_weekly(p):
    """32_weekly_report_pending + 33_weekly_report_answered"""
    print("\n[WeeklyReport]")
    b, _, page = make_page(p)
    try:
        page.goto(BASE + "/weekly-report", wait_until="networkidle", timeout=10000)
        page.wait_for_timeout(800)
        # "AI 리포트 생성" 버튼
        page.locator("button:has-text('AI 리포트 생성')").first.click(timeout=3000)
        page.wait_for_timeout(1500)
        shot(page, "32_weekly_report_pending")

        # 응답 = "다시 생성" 버튼 등장 or 한줄 요약 Card 렌더
        print("   주간 리포트 대기 (최대 180초)...")
        try:
            page.wait_for_selector("button:has-text('다시 생성')", timeout=180_000)
            page.wait_for_timeout(800)
            shot(page, "33_weekly_report_answered")
        except PWTimeout:
            print("   !! 리포트 타임아웃 — pending 상태만 저장됨")
    except Exception as e:
        print(f"   !! weekly 실패: {type(e).__name__}: {e}")
    finally:
        try: b.close()
        except: pass


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        capture_session(p)
        capture_coach(p)
        capture_weekly(p)
    total = len(list(OUT.glob("*.png")))
    print(f"\n최종: {total}장 (docs/screenshots_v3)")


if __name__ == "__main__":
    sys.exit(main() or 0)
