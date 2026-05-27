// Simpson Health 디자인 개선 — main canvas app
// Sections:
//   1. 진단 (Audit) — 8 specific issues with notes
//   2. 디자인 시스템 — color/type/principles
//   3. Before / After — 4 key screens side by side

function App() {
  return (
    <DesignCanvas>

      {/* ─── 인트로 카드 ─────────────────────────── */}
      <DCSection id="intro" title="Simpson Health · 디자인 개선 제안" subtitle="2026.05.27 · 기능 좋음, 비주얼 폴리시 필요">
        <DCArtboard id="brief" label="요약" width={520} height={420}>
          <BriefCard/>
        </DCArtboard>
        <DCArtboard id="principles" label="개선 원칙 6" width={460} height={420}>
          <PrinciplesCard/>
        </DCArtboard>
      </DCSection>

      {/* ─── 진단 ─────────────────────────────── */}
      <DCSection id="audit" title="진단" subtitle="현재 디자인의 8가지 아쉬운 점">
        <DCArtboard id="a1" label="1. 앰버 과다 사용" width={340} height={420}><AuditCard n={1}/></DCArtboard>
        <DCArtboard id="a2" label="2. 가혹한 카피" width={340} height={420}><AuditCard n={2}/></DCArtboard>
        <DCArtboard id="a3" label="3. 인바디 9개 0" width={340} height={420}><AuditCard n={3}/></DCArtboard>
        <DCArtboard id="a4" label="4. 이중 네비" width={340} height={420}><AuditCard n={4}/></DCArtboard>
        <DCArtboard id="a5" label="5. 빈 화면" width={340} height={420}><AuditCard n={5}/></DCArtboard>
        <DCArtboard id="a6" label="6. 시각 위계" width={340} height={420}><AuditCard n={6}/></DCArtboard>
        <DCArtboard id="a7" label="7. 인사이트 부재" width={340} height={420}><AuditCard n={7}/></DCArtboard>
        <DCArtboard id="a8" label="8. 폰트" width={340} height={420}><AuditCard n={8}/></DCArtboard>
      </DCSection>

      {/* ─── 디자인 시스템 ────────────────────── */}
      <DCSection id="system" title="디자인 시스템 제안" subtitle="현재 톤은 유지, 위계와 따뜻함을 추가">
        <DCArtboard id="palette" label="컬러 — 현재 vs 제안" width={520} height={500}>
          <PaletteCard/>
        </DCArtboard>
        <DCArtboard id="type" label="타이포 — Pretendard" width={420} height={500}>
          <TypeCard/>
        </DCArtboard>
        <DCArtboard id="comp" label="컴포넌트 토큰" width={420} height={500}>
          <ComponentTokenCard/>
        </DCArtboard>
      </DCSection>

      {/* ─── BEFORE / AFTER ────────────────────── */}
      <DCSection id="home" title="홈 화면" subtitle="Before — 현재 / After — 제안">
        <DCArtboard id="home-before" label="Before · 현재" width={400} height={800}>
          <BeforeWrap src="uploads/01_home.png"/>
        </DCArtboard>
        <DCArtboard id="home-after" label="After · 제안" width={400} height={800}>
          <PhoneShell w={360} h={760}><HomeScreen/></PhoneShell>
        </DCArtboard>
        <DCArtboard id="home-notes" label="변경점" width={360} height={800}>
          <NotesCard which="home"/>
        </DCArtboard>
      </DCSection>

      <DCSection id="weight" title="체중 화면" subtitle="가장 데이터-헤비한 화면. 인사이트 추가">
        <DCArtboard id="w-before" label="Before · 현재" width={400} height={800}>
          <BeforeWrap src="uploads/03_weight.png"/>
        </DCArtboard>
        <DCArtboard id="w-after" label="After · 제안" width={400} height={800}>
          <PhoneShell w={360} h={760}><WeightScreen/></PhoneShell>
        </DCArtboard>
        <DCArtboard id="w-notes" label="변경점" width={360} height={800}>
          <NotesCard which="weight"/>
        </DCArtboard>
      </DCSection>

      <DCSection id="workout" title="운동 화면" subtitle="가장 톤 문제가 큰 화면. 격려로 전환">
        <DCArtboard id="wo-before" label="Before · 현재" width={400} height={800}>
          <BeforeWrap src="uploads/04_workout.png"/>
        </DCArtboard>
        <DCArtboard id="wo-after" label="After · 제안" width={400} height={800}>
          <PhoneShell w={360} h={760}><WorkoutScreen/></PhoneShell>
        </DCArtboard>
        <DCArtboard id="wo-notes" label="변경점" width={360} height={800}>
          <NotesCard which="workout"/>
        </DCArtboard>
      </DCSection>

      <DCSection id="inbody" title="인바디 입력" subtitle="9개의 '0'을 점진적 입력으로">
        <DCArtboard id="ib-before" label="Before · 현재" width={400} height={800}>
          <BeforeWrap src="uploads/14_inbody_tab_manual.png"/>
        </DCArtboard>
        <DCArtboard id="ib-after" label="After · 제안" width={400} height={800}>
          <PhoneShell w={360} h={760}><InBodyScreen/></PhoneShell>
        </DCArtboard>
        <DCArtboard id="ib-notes" label="변경점" width={360} height={800}>
          <NotesCard which="inbody"/>
        </DCArtboard>
      </DCSection>

      <DCSection id="record" title="기록 화면" subtitle="허브 화면. 그룹핑 정리">
        <DCArtboard id="r-before" label="Before · 현재" width={400} height={800}>
          <BeforeWrap src="uploads/05_record.png"/>
        </DCArtboard>
        <DCArtboard id="r-after" label="After · 제안" width={400} height={800}>
          <PhoneShell w={360} h={760}><RecordScreen/></PhoneShell>
        </DCArtboard>
        <DCArtboard id="r-notes" label="변경점" width={360} height={800}>
          <NotesCard which="record"/>
        </DCArtboard>
      </DCSection>

      {/* ─── 다음 단계 ────────────────────── */}
      <DCSection id="next" title="다음 단계" subtitle="여기서 어떻게 진행할지">
        <DCArtboard id="next-card" label="제안" width={520} height={380}>
          <NextStepsCard/>
        </DCArtboard>
      </DCSection>

    </DesignCanvas>
  );
}

// ──────────────────────────────────────────────────────
// Reusable styles
// ──────────────────────────────────────────────────────
const CardBase = {
  width: '100%', height: '100%', boxSizing: 'border-box',
  fontFamily: Tfont.family, color: T.text,
  background: T.bg, padding: 24, overflow: 'hidden',
  display: 'flex', flexDirection: 'column',
};

// ──────────────────────────────────────────────────────
// Brief
// ──────────────────────────────────────────────────────
function BriefCard() {
  return (
    <div style={CardBase}>
      <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '1px', fontWeight: 600 }}>
        BRIEF
      </div>
      <h1 style={{
        fontSize: 32, fontWeight: 700, letterSpacing: '-0.8px',
        margin: '8px 0 16px', textWrap: 'balance', lineHeight: 1.15,
      }}>
        기능은 이미 훌륭해요.<br/>
        남은 건 <span style={{ color: T.amber }}>위계와 따뜻함</span>.
      </h1>
      <p style={{
        fontSize: 13, color: T.textMid, lineHeight: 1.7, margin: 0,
        maxWidth: 440,
      }}>
        Simpson Health는 GLP-1 투약, 인바디, 식단, 운동을 한 곳에 묶은 굉장히 야심찬 개인용 앱입니다.
        AI 통합도 이미 동작 중이고, 데이터 모델도 탄탄해요. 다만 시각적으로는
        <b style={{ color: T.text }}> "모든 게 똑같이 강조"</b>되어 정보를 빠르게 읽기 어렵고,
        톤이 가끔 사용자를 위축시킵니다.
      </p>
      <div style={{ flex: 1 }}/>
      <div style={{ display: 'flex', gap: 24, fontSize: 11, color: T.textDim }}>
        <Stat label="현재 화면 분석" value="35"/>
        <Stat label="제안된 진단" value="8"/>
        <Stat label="재디자인 화면" value="5"/>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, color: T.text, fontFamily: Tfont.mono }}>{value}</div>
      <div style={{ marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// Principles
// ──────────────────────────────────────────────────────
function PrinciplesCard() {
  const items = [
    ['앰버는 액션과 핵심 수치에만', '진행/긍정은 sage green, 보조 데이터는 slate blue'],
    ['카피는 격려, 아니면 중립', '"51일째 쉬는 중" 같은 표현은 죄책감 유발'],
    ['빈 상태를 친절하게', '"0"보다 "—" 또는 placeholder, 다음 행동을 안내'],
    ['단일 네비게이션', '상단 탭 + 하단 탭 중 하나만'],
    ['AI 한 줄을 어디서나', '단순 수치 옆에 AI 인사이트 한 줄'],
    ['따뜻한 다크', '순흑(#000)이 아닌 따뜻한 톤(#0E0B07)으로'],
  ];
  return (
    <div style={CardBase}>
      <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '1px', fontWeight: 600 }}>PRINCIPLES</div>
      <div style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 18px', letterSpacing: '-0.4px' }}>
        개선 원칙 6
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(([h, s], i) => (
          <div key={i} style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              background: T.amberSoft, color: T.amber, fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: Tfont.mono,
            }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{h}</div>
              <div style={{ fontSize: 11, color: T.textMid, marginTop: 2, lineHeight: 1.5 }}>{s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// Audit cards
// ──────────────────────────────────────────────────────
const AUDITS = {
  1: {
    title: '앰버 한 가지 색에 모든 강조 집중',
    severity: '높음',
    problem: '버튼 · 차트 · 즐겨찾기 · 강조 텍스트 · 진행률 · 마일스톤이 모두 같은 앰버. 어떤 게 진짜 액션인지 시각적으로 구분이 안 됩니다.',
    fix: '앰버 = 1차 액션 + 현재 값. 진행/긍정 = sage green. 보조 데이터 = slate blue.',
    where: '01 홈, 03 체중, 06 캘린더, 07 가이드 — 거의 전체',
  },
  2: {
    title: '"51일째 쉬는 중" 같은 죄책감 카피',
    severity: '높음',
    problem: '운동 탭에서 빨간색으로 표시되는 "51일째 쉬는 중 · 오늘 해봐요". 의도는 격려지만, 사용자 입장에서는 매번 들어올 때마다 실패를 떠올리게 됩니다.',
    fix: '"마지막 운동 51일 전 · 가볍게 시작해볼까요?" 처럼 사실 + 부드러운 제안으로. 색도 빨강이 아니라 중립톤.',
    where: '04 운동',
  },
  3: {
    title: '인바디 입력의 9개 "0"',
    severity: '높음',
    problem: '모든 필드가 "0"으로 채워져 있어 (a) 실제 입력값이 0인지 placeholder인지 헷갈리고, (b) 한 번에 9개 칸을 채워야 한다는 압박이 큽니다.',
    fix: 'placeholder는 "—"로. 체중 1개만 필수, 나머지는 접힘. "전체 입력 ▾"으로 펼치게.',
    where: '14 인바디 수동 · 15 CSV · 16 사진 AI',
  },
  4: {
    title: '상단 탭 + 하단 nav 동시 존재',
    severity: '중간',
    problem: '상단: 홈/식단/체중/운동/기록 (5개), 하단: 대시보드/달력/가이드/설정 (4개). "기록 탭"과 "달력"의 차이, "홈"과 "대시보드"의 차이가 명확하지 않습니다.',
    fix: '상단 탭은 대시보드 내부의 sub-tab으로만. 하단 nav가 1차 IA.',
    where: '01, 02, 03, 04, 05 — 모든 메인 탭',
  },
  5: {
    title: '빈 화면이 그냥 검은 공백',
    severity: '중간',
    problem: '주간 리포트는 "AI 리포트 생성" 버튼 1개와 600px의 검은 공간. AI 작업 이력에서 필터 결과 적으면 80%가 빈 공간.',
    fix: '"리포트 생성 시 이런 내용을 볼 수 있어요" 미리보기 카드, 또는 지난 리포트 요약.',
    where: '12 주간 리포트, 10 · 22 AI 작업 이력, 09 코치 빈 상태',
  },
  6: {
    title: '모든 카드가 비슷해서 위계가 사라짐',
    severity: '중간',
    problem: '둥근 모서리 + 약간 밝은 회색 배경 + 같은 패딩. 메인 데이터(103.0kg)와 부가 메타(자주 먹는 음식 chip)가 비슷한 무게로 느껴짐.',
    fix: 'Hero(큰 데이터) · Section(그룹) · Inline(리스트 항목) 3단계로. 강조는 색이 아니라 크기와 여백으로.',
    where: '01, 03, 05, 07',
  },
  7: {
    title: 'AI가 있는데 단순 수치만 노출',
    severity: '낮음',
    problem: '체지방률 44.2% · 골격근 32.9kg · BMI 35.5 — 그래서 좋은지 나쁜지, 뭘 해야 하는지가 안 보임. AI 해석은 별도 페이지에 숨어 있음.',
    fix: '각 카드 옆에 변화량(▼0.8kg) + 일주일 1줄 AI 코멘트를 항상 보이게.',
    where: '03 체중, 11 인바디',
  },
  8: {
    title: '한글 자간 · 폰트 선택',
    severity: '낮음',
    problem: '시스템 폰트는 안드로이드/iOS 간 일관성이 깨지고, 영문 숫자(103.0)와 한글의 baseline alignment가 어색.',
    fix: 'Pretendard Variable (한글 + 영문 통일, 가변 폰트). 숫자는 JetBrains Mono로 차별화.',
    where: '전체',
  },
};

function AuditCard({ n }) {
  const a = AUDITS[n];
  return (
    <div style={CardBase}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: T.amberSoft, color: T.amber, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: Tfont.mono, fontSize: 14,
        }}>{n.toString().padStart(2,'0')}</div>
        <SeverityChip s={a.severity}/>
      </div>
      <div style={{
        fontSize: 18, fontWeight: 700, margin: '14px 0 14px',
        letterSpacing: '-0.3px', lineHeight: 1.3, textWrap: 'balance',
      }}>
        {a.title}
      </div>

      <div style={{ fontSize: 10, color: T.coral, fontWeight: 700, letterSpacing: '0.5px' }}>문제</div>
      <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.6, marginTop: 6 }}>{a.problem}</div>

      <div style={{ fontSize: 10, color: T.sage, fontWeight: 700, letterSpacing: '0.5px', marginTop: 14 }}>해결</div>
      <div style={{ fontSize: 12, color: T.text, lineHeight: 1.6, marginTop: 6 }}>{a.fix}</div>

      <div style={{ flex: 1 }}/>
      <div style={{
        fontSize: 10, color: T.textDim, paddingTop: 12,
        borderTop: `1px solid ${T.border}`,
      }}>
        영향 화면 · {a.where}
      </div>
    </div>
  );
}

function SeverityChip({ s }) {
  const map = {
    '높음': { bg: 'rgba(216,122,96,0.16)', fg: T.coral },
    '중간': { bg: T.amberSoft, fg: T.amber },
    '낮음': { bg: T.slateSoft, fg: T.slate },
  };
  const c = map[s] || map['낮음'];
  return (
    <div style={{
      padding: '4px 10px', borderRadius: 999,
      background: c.bg, color: c.fg, fontSize: 10, fontWeight: 700, letterSpacing: '0.3px',
    }}>심각도 {s}</div>
  );
}

// ──────────────────────────────────────────────────────
// Palette
// ──────────────────────────────────────────────────────
function PaletteCard() {
  return (
    <div style={CardBase}>
      <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '1px', fontWeight: 600 }}>COLOR SYSTEM</div>
      <div style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 20px', letterSpacing: '-0.3px' }}>
        현재 톤 유지 · 위계만 추가
      </div>

      {/* Surfaces */}
      <div style={{ fontSize: 11, color: T.textMid, marginBottom: 8, fontWeight: 600 }}>SURFACES</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <Swatch name="bg" hex={T.bg} note="페이지"/>
        <Swatch name="surface" hex={T.surface} note="카드"/>
        <Swatch name="surface2" hex={T.surface2} note="입력"/>
        <Swatch name="surface3" hex={T.surface3} note="hover"/>
      </div>

      {/* Brand */}
      <div style={{ fontSize: 11, color: T.textMid, marginBottom: 8, fontWeight: 600 }}>BRAND · 1차 액션 + 핵심 수치</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <Swatch name="amber" hex={T.amber} note="primary" big/>
        <Swatch name="amberHi" hex={T.amberHi} note="hover"/>
        <Swatch name="amberDim" hex={T.amberDim} note="press"/>
      </div>

      {/* Signals */}
      <div style={{ fontSize: 11, color: T.textMid, marginBottom: 8, fontWeight: 600 }}>SIGNALS · 의미 색</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <Swatch name="sage" hex={T.sage} note="진행 · 긍정"/>
        <Swatch name="slate" hex={T.slate} note="보조 데이터"/>
        <Swatch name="coral" hex={T.coral} note="주의 (적게)"/>
      </div>

      {/* Text */}
      <div style={{ fontSize: 11, color: T.textMid, marginBottom: 8, fontWeight: 600 }}>TEXT — 4단계 위계</div>
      <div style={{
        padding: 14, borderRadius: 10, background: T.surface,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>Primary · 103.0kg</div>
        <div style={{ color: T.textMid, fontSize: 12 }}>Mid · 어제보다 0.4kg 감량</div>
        <div style={{ color: T.textDim, fontSize: 11 }}>Dim · 2026-05-27</div>
        <div style={{ color: T.textFaint, fontSize: 11 }}>Faint · placeholder</div>
      </div>
    </div>
  );
}

function Swatch({ name, hex, note, big }) {
  return (
    <div style={{
      flex: big ? 2 : 1, padding: 10, borderRadius: 10,
      background: hex, color: parseInt(hex.slice(1, 3), 16) > 120 ? '#1a1208' : T.text,
      border: `1px solid ${T.border}`, minHeight: 64,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85 }}>{name}</div>
      <div>
        <div style={{ fontSize: 9, fontFamily: Tfont.mono, opacity: 0.7 }}>{hex}</div>
        <div style={{ fontSize: 9, marginTop: 2, opacity: 0.7 }}>{note}</div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// Type
// ──────────────────────────────────────────────────────
function TypeCard() {
  return (
    <div style={CardBase}>
      <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '1px', fontWeight: 600 }}>TYPE</div>
      <div style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 8px', letterSpacing: '-0.3px' }}>
        Pretendard Variable
      </div>
      <div style={{ fontSize: 11, color: T.textMid, lineHeight: 1.55, maxWidth: 360 }}>
        한글 + 영문 + 숫자가 한 폰트에 자연스럽게 어울리는 가변 폰트. Inter 대신 한국 앱이 많이 채택.
        숫자는 JetBrains Mono로 차별화.
      </div>

      <div style={{
        marginTop: 20, padding: 16, borderRadius: 10,
        background: T.surface, border: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <TypeRow size={32} weight={700} label="Display · 32 · 700" sample="103.0 kg"/>
        <TypeRow size={22} weight={700} label="Title · 22 · 700" sample="오늘 할 일"/>
        <TypeRow size={15} weight={600} label="Heading · 15 · 600" sample="Simpson Health"/>
        <TypeRow size={13} weight={500} label="Body · 13 · 500" sample="머신 체스트 프레스"/>
        <TypeRow size={11} weight={500} label="Caption · 11 · 500" sample="어제보다 0.4kg 감량"/>
        <TypeRow size={11} weight={600} label="Mono · 11" mono sample="2026-05-27"/>
      </div>

      <div style={{
        marginTop: 16, padding: 12, borderRadius: 10,
        background: T.amberSoft, fontSize: 11, color: T.amber, lineHeight: 1.55,
      }}>
        <b>적용 팁:</b> 큰 숫자(체중, 칼로리)는 letter-spacing -1~-2px, 한글 헤딩은 -0.3px.
        한글 본문은 line-height 1.55~1.7로 넉넉히.
      </div>
    </div>
  );
}

function TypeRow({ size, weight, label, sample, mono }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
      <div style={{ fontSize: 9, color: T.textDim, flex: '0 0 110px', fontFamily: Tfont.mono }}>{label}</div>
      <div style={{
        fontSize: size, fontWeight: weight, color: T.text,
        fontFamily: mono ? Tfont.mono : Tfont.family,
        letterSpacing: size > 24 ? '-1px' : size > 16 ? '-0.4px' : 0,
      }}>{sample}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// Component tokens
// ──────────────────────────────────────────────────────
function ComponentTokenCard() {
  return (
    <div style={CardBase}>
      <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '1px', fontWeight: 600 }}>COMPONENTS</div>
      <div style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 18px', letterSpacing: '-0.3px' }}>
        주요 컴포넌트
      </div>

      {/* Buttons */}
      <Label>BUTTONS</Label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button style={{
          padding: '11px 18px', border: 'none', borderRadius: T.r4, fontFamily: 'inherit',
          background: T.amber, color: '#1a1208', fontWeight: 700, fontSize: 12, cursor: 'pointer',
        }}>1차 액션</button>
        <button style={{
          padding: '11px 18px', borderRadius: T.r4, fontFamily: 'inherit',
          background: 'transparent', color: T.text, fontWeight: 600, fontSize: 12,
          border: `1px solid ${T.borderHi}`,
        }}>2차</button>
        <button style={{
          padding: '11px 18px', borderRadius: 999, fontFamily: 'inherit',
          background: T.surface3, color: T.textMid, fontWeight: 500, fontSize: 12,
          border: 'none',
        }}>Ghost</button>
      </div>

      {/* Chips */}
      <Label>CHIPS</Label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        <Chip on>★ 즐겨찾기</Chip>
        <Chip>상체 밀기</Chip>
        <Chip>하체</Chip>
      </div>

      {/* Card */}
      <Label>CARDS</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          padding: 14, borderRadius: T.r4, background: T.surface,
          border: `1px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 11, color: T.textMid }}>현재 체중</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>103.0 <span style={{ fontSize: 11, color: T.textMid, fontWeight: 500 }}>kg</span></div>
        </div>
        <div style={{
          padding: 12, borderRadius: T.r3, background: T.amberSoft,
          fontSize: 11, color: T.amber, display: 'flex', gap: 8,
        }}>
          <b>AI</b>
          <span style={{ color: T.text, fontWeight: 500 }}>이번 주 -1.6kg, 목표 페이스 유지 중</span>
        </div>
      </div>

      {/* Input */}
      <div style={{ marginTop: 14 }}>
        <Label>INPUT (수정안)</Label>
        <div style={{
          padding: '0 14px', borderRadius: T.r4, background: T.surface,
          border: `1px solid ${T.border}`,
        }}>
          <div style={{
            padding: '12px 0', display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 12, flex: '0 0 70px', fontWeight: 600 }}>체중 <span style={{ color: T.amber }}>*</span></div>
            <div style={{ flex: 1, fontSize: 15, color: T.textFaint, fontFamily: Tfont.mono, borderBottom: `1px solid ${T.amber}`, paddingBottom: 1 }}>—</div>
            <div style={{ fontSize: 10, color: T.textDim, fontFamily: Tfont.mono }}>kg</div>
          </div>
          <div style={{
            padding: '12px 0', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ fontSize: 12, flex: '0 0 70px', color: T.textMid }}>골격근</div>
            <div style={{ flex: 1, fontSize: 15, color: T.textFaint, fontFamily: Tfont.mono }}>—</div>
            <div style={{ fontSize: 10, color: T.textDim, fontFamily: Tfont.mono }}>kg</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{
      fontSize: 10, color: T.textDim, fontWeight: 700, letterSpacing: '0.6px',
      marginBottom: 6,
    }}>{children}</div>
  );
}

function Chip({ children, on }) {
  return (
    <div style={{
      padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: on ? 600 : 500,
      background: on ? T.amberSoft : 'transparent',
      color: on ? T.amber : T.textMid,
      border: `1px solid ${on ? 'rgba(242,169,60,0.4)' : T.borderHi}`,
    }}>{children}</div>
  );
}

// ──────────────────────────────────────────────────────
// Before image wrap
// ──────────────────────────────────────────────────────
function BeforeWrap({ src }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: '#000',
      borderRadius: 36, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid rgba(0,0,0,0.6)',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.4)',
    }}>
      <img src={src} style={{
        width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center',
        display: 'block',
      }}/>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// Per-screen notes
// ──────────────────────────────────────────────────────
const NOTES = {
  home: [
    ['Greeting', '연속 0일 → "연속 12일" 같은 streak 강조 (긍정 신호)'],
    ['Hero 카드', '큰 숫자(103.0) + 진행 30% 막대 + 23kg 남음 + AI 1줄 예측'],
    ['진행 바 색', '앰버 → sage green (진행은 긍정)'],
    ['오늘 할 일', '4개 항목 통합 (운동 + 영양). 단백질/칼로리 진행 막대'],
    ['빠른 기록', '체중 · 식사 큰 액션 카드 신설 → 1탭 입력 유도'],
    ['AI 도우미', '버튼이 아닌 "발견할 거리" 같은 카드로'],
    ['빈 상태 카피', '"기록이 없습니다" → "첫 기록을 남겨보세요"'],
  ],
  weight: [
    ['숫자 크기', '대시보드 hero에서 약간 줄임 (40→32 정도). 차트가 주인공'],
    ['차트', '목표 80kg 점선 추가, 마지막 포인트 강조, 시작/현재/목표 한 줄 메타'],
    ['AI 인사이트', '차트 바로 아래 1줄 코멘트 (현재는 별도 페이지에 숨겨짐)'],
    ['체성분 카드', '4개 → 변화량(▼0.8kg) 함께 표시. 좋아진 건 sage, 나빠진 건 coral'],
    ['근육 vs 지방', '같은 앰버 톤이 아니라 골격근 amber + 체지방 slate로 구분'],
    ['삭제', '인바디 이력 6회 테이블은 별도 페이지로 (스크롤 길어짐 해소)'],
  ],
  workout: [
    ['핵심', '"51일째 쉬는 중" → "마지막 운동 51일 전 · 가볍게 시작해볼까요?"'],
    ['상단 카드', '진행 ring + 부드러운 카피. 빨강 제거'],
    ['주간 strip', '월~일 동그라미. 오늘만 점선 amber 링으로'],
    ['CTA', '큰 amber glow 제거. 깔끔한 amber pill 버튼'],
    ['카테고리', 'pills 위계 정리 (머신/맨몸/유산소 + 즐겨찾기/근육군)'],
    ['운동 카드', '아이콘 + 부위 + 무게×반복×세트 → mono 폰트로 정렬'],
  ],
  inbody: [
    ['핵심', '"0" 9개 → "—" placeholder, 1개만 필수'],
    ['방법 선택', '맨 위로 (사진 AI 가장 빠른 길로 강조)'],
    ['그룹핑', '필수 → 체성분(선택) → 대사(선택)로 3그룹'],
    ['필수만 작게', '체중 1개만 보이고, 나머지는 "전체 입력 ▾" 토글'],
    ['단위', 'kg/% mono 폰트로 살짝 디밍 (값에 시선이 가게)'],
    ['하단 안내', '"입력 안 한 항목은 자동으로 비워둡니다" 명시'],
  ],
  record: [
    ['상단 요약', '단백질/칼로리/D+79를 한 줄 요약 띠로'],
    ['그룹핑', '체중 · 인바디 · 투약 · 식단 · 자주 먹는 음식 — 명확히 분리'],
    ['투약 카드', '"5mg ▾" 드롭다운 + "투약" 버튼. 다음 투약일도 표시'],
    ['인바디 카드', '마지막 측정일 + 경과 일수 + 입력 방법 3가지 chips'],
    ['식단 textarea', '높이 줄이고, "분석 ↗" 버튼만 amber'],
    ['아이콘', '각 그룹별 색 구분 (체중 amber, 식단 amber, 투약 sage 등)'],
  ],
};

function NotesCard({ which }) {
  const list = NOTES[which];
  return (
    <div style={CardBase}>
      <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '1px', fontWeight: 600 }}>CHANGES</div>
      <div style={{ fontSize: 18, fontWeight: 700, margin: '8px 0 16px', letterSpacing: '-0.3px' }}>
        {list.length}가지 변경점
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {list.map(([h, s], i) => (
          <div key={i}>
            <div style={{
              fontSize: 10, color: T.amber, fontWeight: 700, letterSpacing: '0.6px',
              marginBottom: 4,
            }}>{(i+1).toString().padStart(2,'0')} · {h}</div>
            <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.55 }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// Next steps
// ──────────────────────────────────────────────────────
function NextStepsCard() {
  return (
    <div style={CardBase}>
      <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '1px', fontWeight: 600 }}>NEXT</div>
      <div style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 16px', letterSpacing: '-0.3px' }}>
        여기서 어디로 갈까요?
      </div>
      <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.7, maxWidth: 460, marginBottom: 16 }}>
        지금 보고 계신 건 <b style={{ color: T.text }}>방향 제안</b>이에요. 마음에 드는 변경점만
        골라서 단계적으로 가도 됩니다. 추천 순서:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          ['1', '컬러 시스템 적용 (1일)', '앰버 외에 sage/slate 추가하고 의미 매핑'],
          ['2', '인바디 입력 개편 (반나절)', '가장 만족도 높을 변경. UX 임팩트 큼'],
          ['3', '운동 탭 카피 톤 변경 (1시간)', '빠른 win. 사용자가 매일 보는 화면'],
          ['4', '홈 hero 카드 개편 (1일)', 'sage 진행 바 + AI 한 줄'],
          ['5', '체중 차트에 인사이트 추가 (1일)', 'AI 코멘트 + 목표 점선'],
          ['6', 'Pretendard 폰트 (10분)', 'CDN 한 줄. 즉시 변화 체감'],
        ].map(([n, h, s]) => (
          <div key={n} style={{
            padding: 12, borderRadius: T.r3, background: T.surface,
            border: `1px solid ${T.border}`,
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: T.amberSoft, color: T.amber, fontSize: 11, fontWeight: 700,
              fontFamily: Tfont.mono,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{n}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{h}</div>
              <div style={{ fontSize: 11, color: T.textMid, marginTop: 2 }}>{s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
