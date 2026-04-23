#!/usr/bin/env python3
"""
Simpson Health — 모바일 뷰포트 스크린샷 일괄 캡처 (재현성 보장)

사용법:
    python3 docs/scripts/capture_screens.py [--out <dir>] [--base <url>]

필수 선행:
    pip install playwright
    playwright install chromium

출력 기본값: docs/screenshots_v2/
베이스 URL 기본값: http://localhost:18000 (FastAPI + dist 번들)

리디자인 전후 비교:
    리디자인 전 화면: docs/screenshots/
    리디자인 후 화면: docs/screenshots_v2/
"""
import argparse
import os
import sys
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.stderr.write("playwright 미설치: pip install playwright && playwright install chromium\n")
    sys.exit(1)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUT = PROJECT_ROOT / "docs" / "screenshots_v2"
DEFAULT_BASE = "http://localhost:18000"

# (파일명, 경로 suffix) — 리디자인 후 라우트에 맞춰 업데이트 예정
SCREENS = [
    ("01_home",             "/"),
    ("02_meal",             "/?tab=diet"),
    ("03_weight",           "/?tab=weight"),
    ("04_workout",          "/?tab=exercise"),
    ("05_record",           "/?tab=record"),
    ("06_calendar",         "/calendar"),
    ("07_guide",            "/guide"),
    ("08_settings",         "/settings"),
    ("09_session",          "/session"),
]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(DEFAULT_OUT))
    ap.add_argument("--base", default=DEFAULT_BASE)
    args = ap.parse_args()

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(
            viewport={"width": 430, "height": 932},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
        )
        page = ctx.new_page()
        for name, suffix in SCREENS:
            url = args.base.rstrip("/") + suffix
            print(f"-> {name}: {url}")
            try:
                page.goto(url, wait_until="networkidle", timeout=15000)
            except Exception as e:
                print(f"   !! goto 실패: {e}")
                continue
            page.wait_for_timeout(800)
            target = out_dir / f"{name}.png"
            page.screenshot(path=str(target), full_page=True)
            print(f"   saved {target} ({target.stat().st_size} bytes)")
        browser.close()
    print("done")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
