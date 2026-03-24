# SQLite 데이터베이스 마이그레이션 계획서

> 작성일: 2026-03-24
> 목적: simpson_data.json → SQLite DB 전환
> 전제: React 마이그레이션(09)과 동시 또는 직후 진행

---

## 1. 현재 문제점 (JSON)

| 문제 | 상세 |
|------|------|
| 파일 크기 증가 | 1년 후 수천 건 기록 → 수 MB, 매 요청마다 전체 로드 |
| 동시 쓰기 위험 | 두 요청이 동시에 JSON 수정하면 데이터 손실 |
| 쿼리 불가 | "3월 평균 단백질" 같은 집계를 JS로 계산해야 함 |
| 백업 어려움 | 파일 하나라 부분 복구 불가 |
| 관계 없음 | 식단-운동-체중 간 날짜 연결이 코드 의존 |

---

## 2. SQLite 선택 이유

| 대안 | 판단 |
|------|------|
| PostgreSQL/MySQL | 서버 별도 설치 필요, 개인 앱에 과함 |
| MongoDB | NoSQL, 설치 필요 |
| **SQLite** | **파일 1개, 설치 없음, Python 내장, 백업 = 파일 복사** |

---

## 3. 테이블 설계

### 3-1. profiles

```sql
CREATE TABLE profiles (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL,
  goal_weight_kg REAL,
  start_weight_kg REAL,
  medication TEXT,
  medication_start DATE,
  daily_protein_target INTEGER DEFAULT 110,
  daily_calorie_target INTEGER DEFAULT 1500,
  weekly_exercise_target INTEGER DEFAULT 4,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3-2. weight_records

```sql
CREATE TABLE weight_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL UNIQUE,
  weight_kg REAL NOT NULL,
  photo TEXT,
  memo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3-3. inbody_records

```sql
CREATE TABLE inbody_records (
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
```

### 3-4. diet_records

```sql
CREATE TABLE diet_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  time TEXT,
  category TEXT CHECK(category IN ('meal','snack','drink','supplement')),
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

CREATE INDEX idx_diet_date ON diet_records(date);
```

### 3-5. exercise_sessions

```sql
CREATE TABLE exercise_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  total_duration_min INTEGER,
  total_volume_kg INTEGER,
  total_calories_burned INTEGER,
  memo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercise_date ON exercise_sessions(date);
```

### 3-6. exercise_sets

```sql
CREATE TABLE exercise_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  type TEXT CHECK(type IN ('strength','cardio')),
  -- 근력
  set_number INTEGER,
  kg REAL,
  reps INTEGER,
  completed BOOLEAN DEFAULT 0,
  -- 유산소
  duration_min INTEGER,
  incline_pct REAL,
  speed_kmh REAL,
  level INTEGER,
  calories_burned INTEGER,
  FOREIGN KEY (session_id) REFERENCES exercise_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_sets_session ON exercise_sets(session_id);
```

### 3-7. exercise_library

```sql
CREATE TABLE exercise_library (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('strength','cardio')),
  target TEXT,  -- JSON array
  input_type TEXT CHECK(input_type IN ('weight_reps','reps_only','cardio')),
  exercise_group TEXT CHECK(exercise_group IN ('machine','bodyweight','cardio')),
  sort_order INTEGER DEFAULT 0
);
```

### 3-8. frequent_foods

```sql
CREATE TABLE frequent_foods (
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
```

### 3-9. medication_records

```sql
CREATE TABLE medication_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  dose TEXT NOT NULL,
  change_reason TEXT,
  side_effects TEXT,
  memo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3-10. daily_reports

```sql
CREATE TABLE daily_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL UNIQUE,
  day_since_start INTEGER,
  weight_kg REAL,
  weight_change TEXT,
  total_calories INTEGER,
  total_protein REAL,
  total_carbs REAL,
  total_fat REAL,
  meals_json TEXT,  -- JSON array
  protein_achievement TEXT,
  exercise_summary TEXT,
  medication TEXT,
  analysis TEXT,
  score TEXT,
  highlights_json TEXT,  -- JSON array
  tomorrow_advice TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3-11. weekly_analysis

```sql
CREATE TABLE weekly_analysis (
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
  recommendations_json TEXT,  -- JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3-12. schedule

```sql
CREATE TABLE schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  completed BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedule_date ON schedule(date);
```

---

## 4. API 변경

### 현재 (JSON)
```
GET /api/data → JSON 파일 전체 반환 (매번 전체 로드)
```

### 변경 (SQLite)
```
GET  /api/weight?from=2026-03-01&to=2026-03-31    → 체중 기간 조회
GET  /api/weight/latest                             → 최신 체중
POST /api/weight                                    → 체중 기록

GET  /api/diet?date=2026-03-24                      → 특정 날짜 식단
GET  /api/diet/summary?date=2026-03-24              → 일일 영양소 합계
POST /api/diet                                      → 식단 추가
PUT  /api/diet/:id                                  → 식단 수정
DELETE /api/diet/:id                                → 식단 삭제

GET  /api/exercise?date=2026-03-24                  → 특정 날짜 운동
GET  /api/exercise/weekly?week=2026-03-18           → 주간 운동 현황
POST /api/exercise                                  → 운동 저장
PUT  /api/exercise/:id                              → 운동 수정
DELETE /api/exercise/:id                            → 운동 삭제

GET  /api/inbody                                    → 전체 인바디
GET  /api/inbody/latest                             → 최신 인바디
POST /api/inbody                                    → 인바디 추가

GET  /api/report/daily?date=2026-03-24              → 일일 리포트
GET  /api/report/weekly?week=2026-03-18             → 주간 리포트

GET  /api/schedule?month=2026-03                    → 월별 스케줄
GET  /api/achievement?date=2026-03-24               → 달성률

GET  /api/dashboard                                 → 홈 탭 요약 (집계 쿼리)
```

### 장점

| 현재 | DB 전환 후 |
|------|-----------|
| 매번 전체 JSON 로드 | **필요한 데이터만 조회** |
| JS에서 필터링 | **SQL WHERE절로 서버에서 필터** |
| JS에서 합계 계산 | **SQL SUM/AVG로 서버에서 집계** |
| 동시 쓰기 충돌 | **SQLite 트랜잭션으로 안전** |

---

## 5. 마이그레이션 스크립트

```python
# migrate_json_to_sqlite.py
# simpson_data.json → health.db 자동 변환

1. JSON 읽기
2. 테이블 생성 (CREATE TABLE)
3. 데이터 삽입:
   - profiles ← profile
   - weight_records ← weight_records
   - inbody_records ← inbody_records
   - diet_records ← diet_records
   - exercise_sessions + exercise_sets ← exercise_records
   - exercise_library ← exercise_library
   - frequent_foods ← frequent_foods
   - medication_records ← medication_records
   - daily_reports ← daily_reports
   - weekly_analysis ← weekly_analysis
   - schedule ← schedule
4. 검증 (건수 비교)
5. 원본 JSON 백업
```

---

## 6. 구현 순서

| # | 작업 | 시점 |
|---|------|------|
| 1 | DB 스키마 작성 (database.py) | React 전환 후 |
| 2 | 마이그레이션 스크립트 | 1 직후 |
| 3 | server.py API를 SQLite로 교체 | 2 직후 |
| 4 | 프론트엔드 API 호출 수정 | 3 직후 |
| 5 | JSON 파일 archive 처리 | 검증 후 |
| 6 | 자동 백업 설정 (daily) | 안정화 후 |

---

## 7. 백업 전략

```
data/
├── health.db              ← 현재 DB
├── backup/
│   ├── health_20260324.db  ← 일일 백업
│   ├── health_20260323.db
│   └── ...
└── simpson_data.json       ← 원본 JSON (보존)
```

- 매일 자동 백업 (launchd 또는 cron)
- DB 파일 복사 한 줄: `cp health.db backup/health_$(date +%Y%m%d).db`
- 30일 이상 백업 자동 삭제

---

## 8. /health 스킬 변경

현재: JSON 직접 편집 (Edit 도구)
변경: **API 호출** 또는 **SQL 직접 실행**

```
식단 기록 시:
  현재: simpson_data.json Edit → diet_records에 append
  변경: POST /api/diet 호출 또는 sqlite3 INSERT
```

스킬 파일(.claude/commands/health.md)도 DB 방식에 맞춰 수정 필요.
