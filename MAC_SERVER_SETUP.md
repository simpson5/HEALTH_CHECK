# Mac 서버 세팅 가이드 (직접 하기)

> Simpson 전용. 맥북을 건강관리 서버로 쓰기 위한 설정.

---

## 1. 슬립 방지 (필수)

### 터미널 열기
`Cmd + Space` → "터미널" 검색 → 실행

### 명령어 입력
```bash
sudo pmset -c sleep 0 displaysleep 10
```
- 비밀번호 입력 (타이핑해도 안 보이는 게 정상)
- Enter

### 확인
```bash
pmset -g custom
```
AC Power 쪽에서 이렇게 나오면 성공:
```
sleep        0      ← 슬립 안 함
displaysleep 10     ← 화면만 10분 후 꺼짐
```

### 되돌리기 (나중에 원래대로)
```bash
sudo pmset -c sleep 1 displaysleep 10
```

---

## 2. SSH keepalive 설정 (리모트 끊김 방지)

### 파일 열기
```bash
nano ~/.ssh/config
```

### 아래 내용 붙여넣기
```
Host *
  ServerAliveInterval 30
  ServerAliveCountMax 5
```

### 저장
- `Ctrl + O` → Enter → `Ctrl + X`

### 효과
- 30초마다 "살아있니?" 신호 전송
- 5번 연속 응답 없으면 그때 끊김 (= 2.5분 버팀)

---

## 3. tmux 설치 + 사용 (세션 보험)

### 설치
```bash
brew install tmux
```
(brew 없으면: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`)

### 사용법

```bash
# 새 세션 시작
tmux new -s claude

# 이 안에서 Claude Code 실행
claude

# 끊겼다가 다시 접속하면
tmux attach -t claude
```

### tmux 명령 요약
| 키 | 동작 |
|----|------|
| `tmux new -s claude` | 세션 시작 |
| `tmux attach -t claude` | 재접속 |
| `tmux ls` | 세션 목록 |
| `Ctrl+B` → `D` | 세션에서 빠져나오기 (세션은 유지) |

---

## 4. 전체 체크리스트

- [ ] 슬립 방지 설정 완료
- [ ] SSH keepalive 설정 완료
- [ ] tmux 설치 완료
- [ ] tmux 안에서 Claude Code 실행 확인
- [ ] 폰으로 리모트 접속 테스트 (10분 방치 후 재접속)

---

## 문제 생기면

| 증상 | 해결 |
|------|------|
| 슬립 설정 안 바뀜 | `sudo` 빼먹었는지 확인 |
| SSH 여전히 끊김 | `~/.ssh/config` 파일 내용 확인 |
| tmux 설치 안 됨 | brew 먼저 설치 |
| 맥북 배터리로 쓸 때 안 잠 | `-c` 옵션이라 전원 연결 시만 적용됨, 배터리는 원래대로 |
