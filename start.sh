#!/bin/bash
# Simpson Health Check — 한 줄 실행 스크립트
# 사용법: ./start.sh

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "🏥 Simpson Health Check 시작..."

# 1. 의존성 확인
command -v python3 >/dev/null 2>&1 || { echo "❌ python3 미설치"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ node 미설치"; exit 1; }

# 2. Python 패키지 확인
python3 -c "import fastapi, uvicorn" 2>/dev/null || {
    echo "📦 Python 패키지 설치 중..."
    pip3 install fastapi uvicorn -q
}

# 3. 프론트엔드 빌드 (dist 없으면)
if [ ! -d "frontend/dist" ]; then
    echo "🔨 프론트엔드 빌드 중..."
    cd frontend
    [ -d "node_modules" ] || npm install --silent
    npx vite build
    cd ..
fi

# 4. DB 초기화 (없으면)
if [ ! -f "data/health.db" ]; then
    echo "🗄️ DB 초기화 중..."
    python3 -c "from database import init_db; init_db()"
fi

# 5. 기존 프로세스 종료
pkill -f "uvicorn server:app" 2>/dev/null || true
pkill -f "cloudflared tunnel run health" 2>/dev/null || true
sleep 1

# 6. 서버 시작
echo "🚀 서버 시작 (포트 18000)..."
python3 -m uvicorn server:app --host 0.0.0.0 --port 18000 > /tmp/health-server.log 2>&1 &
SERVER_PID=$!
sleep 2

# 서버 확인
if curl -s -o /dev/null -w "%{http_code}" http://localhost:18000/ | grep -q "200"; then
    echo "✅ 서버 OK — http://localhost:18000"
else
    echo "❌ 서버 시작 실패. 로그: /tmp/health-server.log"
    exit 1
fi

# 7. Cloudflare Tunnel (설정 있으면)
if command -v cloudflared >/dev/null 2>&1 && [ -f "$HOME/.cloudflared/config.yml" ]; then
    echo "🌐 Cloudflare Tunnel 시작..."
    cloudflared tunnel run health > /tmp/health-tunnel.log 2>&1 &
    TUNNEL_PID=$!
    sleep 4
    echo "✅ 터널 OK — https://health.simpson-space.com"
else
    echo "⚠️ cloudflared 미설치 또는 미설정. 로컬에서만 접속 가능."
    TUNNEL_PID=""
fi

# 8. 완료
echo ""
echo "═══════════════════════════════════════"
echo "  🏥 Simpson Health Check 실행 중"
echo "  로컬: http://localhost:18000"
if [ -n "$TUNNEL_PID" ]; then
echo "  외부: https://health.simpson-space.com"
fi
echo "  서버 PID: $SERVER_PID"
echo "  종료: ./stop.sh"
echo "═══════════════════════════════════════"
