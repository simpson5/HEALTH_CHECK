#!/usr/bin/env python3
"""Simpson Health — v3 전체 화면/상태 캡처 (resilient)

세션(섹션)별로 브라우저 재시작하여 한 섹션 크래시가 전체를 막지 않도록 분리.

사용법:
    python3 docs/scripts/capture_screens_v3.py [--out <dir>] [--base <url>]

출력: docs/screenshots_v3/
요구: playwright (+ chromium)
"""
from __future__ import annotations
import argparse
import sys
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.stderr.write("playwright 미설치\n")
    sys.exit(1)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUT = PROJECT_ROOT / "docs" / "screenshots_v3"
DEFAULT_BASE = "http://localhost:18000"

VIEWPORT = {"width": 430, "height": 932}
WAIT_NETWORK_MS = 10_000
RENDER_MS = 900


def make_page(p):
    browser = p.chromium.launch()
    ctx = browser.new_context(
        viewport=VIEWPORT,
        device_scale_factor=2,
        is_mobile=True,
        has_touch=True,
    )
    page = ctx.new_page()
    return browser, ctx, page


def close_safely(browser):
    try:
        browser.close()
    except Exception:
        pass


def run_section(p, out_dir, label, fn):
    """한 섹션 = 브라우저 새로 열고 fn(page, base_url, out_dir) 실행 후 닫음.
    fn 안에서 크래시 나도 다음 섹션에 영향 없음."""
    print(f"\n[{label}]")
    browser = ctx = page = None
    try:
        browser, ctx, page = make_page(p)
        fn(page, out_dir)
    except Exception as e:
        print(f"   !! 섹션 '{label}' 크래시: {e}")
    finally:
        if browser is not None:
            close_safely(browser)


def nav(page, base, path):
    url = base.rstrip("/") + path
    print(f"   -> {path}")
    page.goto(url, wait_until="networkidle", timeout=WAIT_NETWORK_MS)
    page.wait_for_timeout(RENDER_MS)


def shot(page, out_dir, name):
    target = out_dir / f"{name}.png"
    page.screenshot(path=str(target), full_page=True)
    print(f"   saved {name}.png ({target.stat().st_size // 1024} KB)")


def click_text(page, text, timeout=2500):
    try:
        page.get_by_text(text, exact=False).first.click(timeout=timeout)
        page.wait_for_timeout(400)
        return True
    except Exception as e:
        print(f"   !! click text '{text}' 실패: {type(e).__name__}")
        return False


# ──────────── 섹션 정의 ────────────

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(DEFAULT_OUT))
    ap.add_argument("--base", default=DEFAULT_BASE)
    args = ap.parse_args()
    base = args.base
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    # 각 섹션을 독립 함수로 정의 (closure로 base 캡처)
    def s1_main_tabs(page, out):
        for name, path in [
            ("01_home",    "/"),
            ("02_meal",    "/?tab=diet"),
            ("03_weight",  "/?tab=weight"),
            ("04_workout", "/?tab=exercise"),
            ("05_record",  "/?tab=record"),
        ]:
            nav(page, base, path); shot(page, out, name)

    def s2_sub(page, out):
        for name, path in [
            ("06_calendar",      "/calendar"),
            ("07_guide",         "/guide"),
            ("08_settings",      "/settings"),
            ("09_coach",         "/coach"),
            ("10_ai_jobs",       "/ai-jobs"),
            ("11_inbody_new",    "/inbody/new"),
            ("12_weekly_report", "/weekly-report"),
        ]:
            nav(page, base, path); shot(page, out, name)

    def s3_guide_tabs(page, out):
        nav(page, base, "/guide")
        for idx, tab in enumerate(["하루일과", "식단", "운동", "식품도감", "로드맵"], start=1):
            if click_text(page, tab):
                page.wait_for_timeout(500)
                shot(page, out, f"13_guide_tab{idx}_{tab}")

    def s4_inbody_tabs(page, out):
        nav(page, base, "/inbody/new")
        shot(page, out, "14_inbody_tab_manual")
        if click_text(page, "CSV 업로드"):
            shot(page, out, "15_inbody_tab_csv")
        if click_text(page, "사진 AI"):
            shot(page, out, "16_inbody_tab_ai")

    def s5_calendar_weekly(page, out):
        nav(page, base, "/calendar")
        if click_text(page, "주간"):
            shot(page, out, "17_calendar_weekly")

    def s6_calendar_day(page, out):
        nav(page, base, "/calendar")
        # 캘린더 그리드의 모든 셀 중 텍스트가 정확히 '24'인 span 포함 button
        btn = page.locator("button").filter(has_text="24").first
        btn.click(timeout=3000)
        page.wait_for_timeout(600)
        shot(page, out, "18_calendar_day_selected")

    def s7_weight_range(page, out):
        nav(page, base, "/?tab=weight")
        for idx, rng in enumerate(["1W", "3M", "전체"], start=1):
            try:
                page.locator(f"button:text-is('{rng}')").first.click(timeout=2500)
                page.wait_for_timeout(400)
                shot(page, out, f"19_weight_range{idx}_{rng}")
            except Exception as e:
                print(f"   !! weight range {rng}: {type(e).__name__}")

    def s8_workout_cat(page, out):
        nav(page, base, "/?tab=exercise")
        for idx, label in enumerate(["맨몸", "유산소"], start=1):
            if click_text(page, label):
                shot(page, out, f"20_workout_cat{idx}_{label}")

    def s9_weekly_last(page, out):
        nav(page, base, "/weekly-report")
        if click_text(page, "지난 주"):
            shot(page, out, "21_weekly_report_last")

    def s10_ai_filter(page, out):
        nav(page, base, "/ai-jobs")
        if click_text(page, "상담"):
            shot(page, out, "22_ai_jobs_filter_coach")

    def s11_search_modal(page, out):
        nav(page, base, "/")
        try:
            page.get_by_role("button", name="식단 검색").click(timeout=2500)
            page.wait_for_timeout(400)
            page.locator("input[placeholder='식단 검색...']").fill("닭", timeout=1500)
            page.wait_for_timeout(500)
            shot(page, out, "23_modal_search")
        except Exception as e:
            print(f"   !! search: {type(e).__name__}")

    def s12_profile_modal(page, out):
        nav(page, base, "/settings")
        page.locator("text=/^Simpson$/").first.click(timeout=3000)
        page.wait_for_timeout(500)
        shot(page, out, "24_modal_profile_edit")

    def s13_number_modal(page, out):
        nav(page, base, "/settings")
        if click_text(page, "목표 체중"):
            page.wait_for_timeout(400)
            shot(page, out, "25_modal_number_edit")

    def s14_meal_sheet(page, out):
        nav(page, base, "/settings")
        if click_text(page, "식단 플랜"):
            page.wait_for_timeout(500)
            shot(page, out, "26_sheet_meal_plan")

    def s15_export_sheet(page, out):
        nav(page, base, "/settings")
        if click_text(page, "데이터 내보내기"):
            page.wait_for_timeout(500)
            shot(page, out, "27_sheet_export")

    def s16_ex_detail(page, out):
        nav(page, base, "/?tab=exercise")
        page.wait_for_timeout(400)
        # 기본 = machine + favorite. DB 상 "머신 체스트 프레스"가 즐겨찾기.
        page.locator("text=머신 체스트 프레스").first.click(timeout=3000)
        page.wait_for_timeout(700)
        shot(page, out, "28_sheet_exercise_detail")

    sections = [
        ("메인 탭 5",       s1_main_tabs),
        ("하위 화면 7",     s2_sub),
        ("Guide 5탭",       s3_guide_tabs),
        ("Inbody 3탭",      s4_inbody_tabs),
        ("Calendar 주간",   s5_calendar_weekly),
        ("Calendar 날짜",   s6_calendar_day),
        ("Weight range",    s7_weight_range),
        ("Workout 카테고리",s8_workout_cat),
        ("WeeklyReport 지난", s9_weekly_last),
        ("AIJobsAll 필터",  s10_ai_filter),
        ("SearchModal",     s11_search_modal),
        ("ProfileEdit",     s12_profile_modal),
        ("NumberEdit",      s13_number_modal),
        ("MealPlanSheet",   s14_meal_sheet),
        ("ExportSheet",     s15_export_sheet),
        ("ExerciseDetail",  s16_ex_detail),
    ]

    with sync_playwright() as p:
        for label, fn in sections:
            run_section(p, out_dir, label, fn)

    # 최종 집계
    files = sorted(out_dir.glob("*.png"))
    print(f"\n완료: {len(files)}장 저장됨 → {out_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
