#!/bin/bash
# Simpson Health Check — 종료 스크립트
echo "🛑 Simpson Health Check 종료..."
pkill -f "uvicorn server:app" 2>/dev/null && echo "  서버 종료" || echo "  서버 이미 꺼져있음"
pkill -f "cloudflared tunnel run health" 2>/dev/null && echo "  터널 종료" || echo "  터널 이미 꺼져있음"
echo "✅ 완료"
