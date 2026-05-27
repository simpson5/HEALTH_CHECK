// Redesigned screens for Simpson Health
// Each function returns the *inside* of a phone — caller wraps with PhoneShell.
//
// Conventions:
// - 360 × 760 logical viewport
// - status bar height 28, bottom nav 64
// - Pretendard everywhere

const { useState } = React;

// ──────────────────────────────────────────────────────
// Phone shell
// ──────────────────────────────────────────────────────
function PhoneShell({ children, w = 360, h = 760 }) {
  return (
    <div style={{
      width: w, height: h, background: T.bg,
      borderRadius: 36, overflow: 'hidden', position: 'relative',
      fontFamily: Tfont.family, color: T.text,
      border: '1px solid rgba(0,0,0,0.6)',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column',
    }}>
      <PhoneStatusBar/>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

function PhoneStatusBar() {
  return (
    <div style={{
      height: 36, padding: '12px 24px 0', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center',
      color: T.text, fontSize: 13, fontWeight: 600,
      flexShrink: 0,
    }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 5, alignItems: 'center', opacity: 0.85 }}>
        <span style={{ fontSize: 10 }}>●●●●</span>
        <span style={{ fontSize: 10 }}>📶</span>
        <span style={{
          width: 22, height: 11, border: `1.2px solid ${T.text}`,
          borderRadius: 3, position: 'relative', opacity: 0.85,
        }}>
          <span style={{
            position: 'absolute', inset: 1.5, width: 14, background: T.text, borderRadius: 1.5,
          }}/>
        </span>
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// App chrome
// ──────────────────────────────────────────────────────
function AppHeader({ title = 'Simpson Health', sub }) {
  return (
    <div style={{ padding: '14px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: T.amber,
          color: T.bg, fontWeight: 800, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>S</div>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.2px' }}>{title}</div>
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.textMid,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

function BottomNav({ active = 'home' }) {
  const items = [
    { id: 'home', label: '대시보드', icon: '⌂' },
    { id: 'cal',  label: '달력',     icon: '▦' },
    { id: 'guide',label: '가이드',   icon: '☰' },
    { id: 'set',  label: '설정',     icon: '⚙' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      height: 72, padding: '10px 12px 18px',
      background: 'linear-gradient(180deg, rgba(14,11,7,0.6), rgba(14,11,7,0.98))',
      borderTop: `1px solid ${T.border}`,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      backdropFilter: 'blur(14px)',
    }}>
      {items.map(i => {
        const on = i.id === active;
        return (
          <div key={i.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: on ? T.amber : T.textDim, fontSize: 11, fontWeight: on ? 600 : 500,
          }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{i.icon}</span>
            <span>{i.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function SectionTabs({ items, active }) {
  return (
    <div style={{ padding: '0 20px', display: 'flex', gap: 22, borderBottom: `1px solid ${T.border}` }}>
      {items.map(i => {
        const on = i === active;
        return (
          <div key={i} style={{
            padding: '10px 0 12px', fontSize: 14, fontWeight: on ? 600 : 500,
            color: on ? T.text : T.textDim,
            borderBottom: on ? `2px solid ${T.amber}` : '2px solid transparent',
            marginBottom: -1,
          }}>{i}</div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────
// HOME — redesigned
// ──────────────────────────────────────────────────────
function HomeScreen() {
  return (
    <div style={{ height: '100%', overflow: 'auto', paddingBottom: 80 }}>
      <AppHeader/>

      {/* Greeting */}
      <div style={{ padding: '4px 20px 16px' }}>
        <div style={{ fontSize: 12, color: T.textDim, fontWeight: 500, letterSpacing: '0.4px' }}>
          5월 27일 · 수요일
        </div>
        <div style={{
          fontSize: 22, fontWeight: 700, marginTop: 6, letterSpacing: '-0.4px',
          textWrap: 'balance',
        }}>
          좋은 오후예요, <span style={{ color: T.amber }}>Simpson</span>님
        </div>
        <div style={{
          fontSize: 12, color: T.textMid, marginTop: 8,
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <span>Day 79</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: T.textFaint }}/>
          <span>마운자로 5mg</span>
          <span style={{ flex: 1 }}/>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            color: T.sage, fontWeight: 600,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.sage }}/>
            연속 12일
          </span>
        </div>
      </div>

      {/* Weight hero — narrative-style */}
      <div style={{
        margin: '0 20px 18px', padding: 20, borderRadius: T.r6,
        background: T.surface, border: `1px solid ${T.border}`,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        }}>
          <div style={{ fontSize: 12, color: T.textMid, fontWeight: 500 }}>현재 체중</div>
          <div style={{ fontSize: 11, color: T.textFaint, fontFamily: Tfont.mono }}>D-179</div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8,
        }}>
          <div style={{
            fontSize: 44, fontWeight: 700, letterSpacing: '-2px', lineHeight: 1,
          }}>103.0</div>
          <div style={{ fontSize: 14, color: T.textMid, fontWeight: 500 }}>kg</div>
          <div style={{ flex: 1 }}/>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 11, color: T.sage, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span>▼</span> 10.0kg 누적
            </div>
            <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>
              어제보다 0.4kg
            </div>
          </div>
        </div>

        {/* Progress bar with milestones */}
        <div style={{ marginTop: 18 }}>
          <div style={{
            position: 'relative', height: 8, borderRadius: 4,
            background: T.surface3, overflow: 'visible',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: '30%', borderRadius: 4,
              background: `linear-gradient(90deg, ${T.sage}, #B0CD8A)`,
            }}/>
            <div style={{
              position: 'absolute', left: '30%', top: -3, width: 14, height: 14,
              transform: 'translateX(-7px)', borderRadius: '50%',
              background: T.sage, border: `3px solid ${T.bg}`,
              boxShadow: `0 0 0 1px ${T.sage}`,
            }}/>
          </div>
          <div style={{
            marginTop: 8, display: 'flex', justifyContent: 'space-between',
            fontSize: 10, color: T.textDim, fontFamily: Tfont.mono,
          }}>
            <span>113.0 시작</span>
            <span style={{ color: T.sage, fontWeight: 600 }}>30% 달성 · 23.0kg 남음</span>
            <span>80.0 목표</span>
          </div>
        </div>

        {/* AI insight chip */}
        <div style={{
          marginTop: 16, padding: '10px 12px', borderRadius: T.r3,
          background: T.amberSoft, display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ color: T.amber, fontSize: 11, fontWeight: 700, marginTop: 1 }}>AI</div>
          <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5, flex: 1 }}>
            이 페이스라면 <b style={{ color: T.amber }}>11월 중순</b>에 80kg 도달 예상이에요.
          </div>
        </div>
      </div>

      {/* Today */}
      <div style={{ padding: '0 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>오늘 할 일</div>
        <div style={{ fontSize: 12, color: T.textMid, fontFamily: Tfont.mono }}>0 / 4</div>
      </div>

      <div style={{
        margin: '0 20px 18px', borderRadius: T.r5,
        background: T.surface, border: `1px solid ${T.border}`,
        overflow: 'hidden',
      }}>
        {[
          { label: '운동 · 머신 6종 + 트레드밀', meta: '60분 예정', kind: 'check' },
          { label: '케틀벨 스윙', meta: '10분', kind: 'check' },
          { label: '단백질', meta: '0 / 110g', kind: 'progress', pct: 0 },
          { label: '칼로리', meta: '0 / 1500 kcal', kind: 'progress', pct: 0 },
        ].map((r, i) => (
          <div key={i} style={{
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderTop: i === 0 ? 'none' : `1px solid ${T.border}`,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              border: `1.6px solid ${T.borderHi}`,
            }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</div>
              {r.kind === 'progress' && (
                <div style={{
                  marginTop: 6, height: 3, borderRadius: 2, background: T.surface3,
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0, width: `${r.pct}%`,
                    background: T.amber, borderRadius: 2,
                  }}/>
                </div>
              )}
            </div>
            <div style={{ fontSize: 11, color: T.textMid, fontFamily: Tfont.mono }}>{r.meta}</div>
          </div>
        ))}
      </div>

      {/* Quick log */}
      <div style={{ padding: '0 20px 12px', fontSize: 14, fontWeight: 600 }}>빠른 기록</div>
      <div style={{ padding: '0 20px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <QuickAction icon="⚖" label="체중" sub="103.0 → ?" />
        <QuickAction icon="🍳" label="식사" sub="아침 미기록" accent />
      </div>

      {/* AI shortcuts */}
      <div style={{ padding: '0 20px 12px', fontSize: 14, fontWeight: 600 }}>AI 도우미</div>
      <div style={{ padding: '0 20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <AIShortcut icon="💬" title="건강 상담" sub="무엇이든 질문" />
        <AIShortcut icon="📊" title="주간 리포트" sub="이번 주 D-2" />
      </div>

      <BottomNav active="home"/>
    </div>
  );
}

function QuickAction({ icon, label, sub, accent }) {
  return (
    <div style={{
      padding: '14px 14px', borderRadius: T.r4,
      background: accent ? T.amberSoft : T.surface,
      border: `1px solid ${accent ? 'rgba(242,169,60,0.2)' : T.border}`,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11, color: T.textMid, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ color: T.textFaint, fontSize: 14 }}>+</div>
    </div>
  );
}

function AIShortcut({ icon, title, sub }) {
  return (
    <div style={{
      padding: 14, borderRadius: T.r4,
      background: T.surface, border: `1px solid ${T.border}`,
    }}>
      <div style={{ fontSize: 18, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 11, color: T.textMid, marginTop: 3 }}>{sub}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// WEIGHT — redesigned
// ──────────────────────────────────────────────────────
function WeightScreen() {
  const ranges = ['1W', '1M', '3M', '6M', '전체'];
  const [r, setR] = useState('3M');
  return (
    <div style={{ height: '100%', overflow: 'auto', paddingBottom: 80 }}>
      <AppHeader/>
      <SectionTabs items={['홈','식단','체중','운동','기록']} active="체중"/>

      {/* Big number + trend summary */}
      <div style={{ padding: '20px 20px 6px' }}>
        <div style={{ fontSize: 12, color: T.textMid }}>현재 체중</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
          <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-2px', lineHeight: 1 }}>103.0</div>
          <div style={{ fontSize: 16, color: T.textMid, fontWeight: 500 }}>kg</div>
        </div>
        <div style={{
          marginTop: 10, display: 'flex', gap: 14, fontSize: 11, color: T.textMid,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: T.sage, fontWeight: 700 }}>▼ 10.0kg</span> 시작 대비
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: T.sage, fontWeight: 700 }}>▼ 0.13kg</span> /일 평균
          </span>
        </div>
      </div>

      {/* Range tabs */}
      <div style={{
        margin: '14px 20px 0', padding: 4, background: T.surface2, borderRadius: 999,
        display: 'flex', gap: 2,
      }}>
        {ranges.map(x => (
          <div key={x} onClick={() => setR(x)} style={{
            flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 999,
            fontSize: 12, fontWeight: x === r ? 600 : 500,
            background: x === r ? T.surface3 : 'transparent',
            color: x === r ? T.text : T.textMid, cursor: 'pointer',
          }}>{x}</div>
        ))}
      </div>

      {/* Chart card */}
      <div style={{
        margin: '14px 20px', padding: 18, borderRadius: T.r5,
        background: T.surface, border: `1px solid ${T.border}`,
      }}>
        <WeightChart/>
        <div style={{
          marginTop: 14, display: 'flex', justifyContent: 'space-between',
          fontSize: 10, color: T.textDim, fontFamily: Tfont.mono,
        }}>
          <span>113.0 시작</span>
          <span style={{ color: T.amber, fontWeight: 700 }}>103.0 현재</span>
          <span>80.0 목표</span>
        </div>
      </div>

      {/* AI Insight pill */}
      <div style={{
        margin: '0 20px 16px', padding: '12px 14px', borderRadius: T.r4,
        background: T.amberSoft, border: `1px solid rgba(242,169,60,0.18)`,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <div style={{ color: T.amber, fontWeight: 700, fontSize: 11, marginTop: 1 }}>AI</div>
        <div style={{ fontSize: 12, lineHeight: 1.55, flex: 1 }}>
          최근 4주 페이스가 안정적이에요. <b style={{ color: T.amber }}>근손실은 0.9kg</b>
          으로 약간 있으니, 단백질을 110g 이상 유지해주세요.
        </div>
      </div>

      {/* Body composition — better cards w/ mini-trend */}
      <div style={{ padding: '0 20px 12px', fontSize: 14, fontWeight: 600 }}>체성분</div>
      <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <CompCard label="체지방률" value="44.2" unit="%" delta="-0.8" deltaKind="good"/>
        <CompCard label="골격근"   value="32.9" unit="kg" delta="+0.2" deltaKind="good"/>
        <CompCard label="BMI"      value="35.5" unit="" delta="-0.6" deltaKind="good"/>
        <CompCard label="기초대사" value="1621" unit="kcal" sub="6회 측정"/>
      </div>

      {/* Muscle vs fat */}
      <div style={{ padding: '0 20px 12px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>근육 vs 지방</div>
        <div style={{ fontSize: 11, color: T.textMid }}>최근 6회</div>
      </div>
      <div style={{
        margin: '0 20px 18px', padding: 16, borderRadius: T.r5,
        background: T.surface, border: `1px solid ${T.border}`,
      }}>
        <CompositionBars/>
        <div style={{
          marginTop: 12, display: 'flex', gap: 14, fontSize: 11, color: T.textMid,
        }}>
          <Legend color={T.amber} label="골격근"/>
          <Legend color={T.slate} label="체지방"/>
        </div>
      </div>

      <BottomNav active="home"/>
    </div>
  );
}

function CompCard({ label, value, unit, delta, deltaKind, sub }) {
  const dColor = deltaKind === 'good' ? T.sage : T.coral;
  return (
    <div style={{
      padding: 14, borderRadius: T.r4,
      background: T.surface, border: `1px solid ${T.border}`,
    }}>
      <div style={{ fontSize: 11, color: T.textMid }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.6px' }}>{value}</div>
        <div style={{ fontSize: 11, color: T.textMid }}>{unit}</div>
      </div>
      {delta && (
        <div style={{ marginTop: 6, fontSize: 11, color: dColor, fontWeight: 600 }}>{delta}kg</div>
      )}
      {sub && (
        <div style={{ marginTop: 6, fontSize: 10, color: T.textDim }}>{sub}</div>
      )}
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color }}/>
      {label}
    </span>
  );
}

function WeightChart() {
  // Approximation of the curve from screenshots
  const pts = [113, 110.5, 109, 108.7, 108.3, 107.7, 106, 105.5, 104.3, 103.7, 103.0];
  const labels = ['3/11','','','3/25','','4/1','','','4/24','','5/1'];
  const min = 80, max = 115;
  const W = 280, H = 110, P = 8;
  const x = (i) => P + (i / (pts.length - 1)) * (W - P * 2);
  const y = (v) => P + ((max - v) / (max - min)) * (H - P * 2);
  const path = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${path} L${x(pts.length-1)},${H-P} L${x(0)},${H-P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H + 16}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={T.amber} stopOpacity="0.32"/>
          <stop offset="1" stopColor={T.amber} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Goal line at 80 */}
      <line x1={P} x2={W-P} y1={y(80)} y2={y(80)} stroke={T.sage} strokeWidth="1" strokeDasharray="3 3" opacity="0.6"/>
      <text x={W-P} y={y(80) - 4} fontSize="9" fill={T.sage} textAnchor="end" fontFamily={Tfont.mono}>목표 80</text>
      <path d={area} fill="url(#wfill)"/>
      <path d={path} stroke={T.amber} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === pts.length - 1 ? 3.5 : 1.5}
                fill={i === pts.length - 1 ? T.amber : T.amberDim}
                stroke={i === pts.length - 1 ? T.bg : 'none'} strokeWidth="2"/>
      ))}
      {labels.map((l, i) => l ? (
        <text key={i} x={x(i)} y={H + 12} fontSize="9" fill={T.textDim}
              textAnchor="middle" fontFamily={Tfont.mono}>{l}</text>
      ) : null)}
    </svg>
  );
}

function CompositionBars() {
  const data = [
    { d: '3/11', m: 34.5, f: 52.6 },
    { d: '3/18', m: 32.3, f: 51.9 },
    { d: '3/25', m: 33.4, f: 49.5 },
    { d: '4/01', m: 33.6, f: 48.6 },
    { d: '4/24', m: 32.7, f: 46.6 },
    { d: '5/01', m: 32.9, f: 45.8 },
  ];
  const max = 60;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 110, gap: 8 }}>
      {data.map((b, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ height: 90, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
            <div style={{ height: `${(b.m/max)*100}%`, background: T.amber, borderRadius: '3px 3px 0 0' }}/>
            <div style={{ height: `${(b.f/max)*100}%`, background: T.slate, borderRadius: 0 }}/>
          </div>
          <div style={{ fontSize: 9, color: T.textDim, fontFamily: Tfont.mono }}>{b.d}</div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────
// WORKOUT — redesigned (softer tone)
// ──────────────────────────────────────────────────────
function WorkoutScreen() {
  return (
    <div style={{ height: '100%', overflow: 'auto', paddingBottom: 80 }}>
      <AppHeader/>
      <SectionTabs items={['홈','식단','체중','운동','기록']} active="운동"/>

      {/* Status card — neutral, not shaming */}
      <div style={{
        margin: '16px 20px 12px', padding: 18, borderRadius: T.r5,
        background: T.surface, border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <RingProgress value={0} total={4}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: T.textMid, fontWeight: 500 }}>이번 주</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>4회 도전 중</div>
          <div style={{ fontSize: 11, color: T.textMid, marginTop: 6, lineHeight: 1.5 }}>
            마지막 운동 <b style={{ color: T.text }}>51일 전</b> · 가볍게 시작해볼까요?
          </div>
        </div>
      </div>

      {/* Week strip */}
      <div style={{
        margin: '0 20px 16px', padding: '12px 4px', borderRadius: T.r5,
        background: T.surface, border: `1px solid ${T.border}`,
        display: 'flex', justifyContent: 'space-around',
      }}>
        {['월','화','수','목','금','토','일'].map((d, i) => {
          const today = i === 2;
          return (
            <div key={d} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '6px 0', minWidth: 32,
            }}>
              <div style={{ fontSize: 10, color: today ? T.amber : T.textDim, fontWeight: 600 }}>{d}</div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: today ? T.amberSoft : 'transparent',
                border: today ? `1.5px dashed ${T.amber}` : `1.5px solid ${T.border}`,
                color: today ? T.amber : T.textDim,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: today ? 700 : 500,
              }}>
                {today ? '27' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary CTA — calm, not glowing */}
      <div style={{ padding: '0 20px 8px' }}>
        <button style={{
          width: '100%', padding: '16px', border: 'none', cursor: 'pointer',
          borderRadius: T.r4, background: T.amber, color: '#1a1208',
          fontFamily: 'inherit', fontWeight: 700, fontSize: 15,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>▶</span> 오늘 운동 시작
        </button>
        <div style={{
          marginTop: 8, fontSize: 11, color: T.textMid, textAlign: 'center',
          display: 'flex', justifyContent: 'center', gap: 10,
        }}>
          <span>오늘</span>
          <span style={{ color: T.textFaint }}>·</span>
          <span style={{ fontFamily: Tfont.mono }}>2026-05-27</span>
          <span style={{ color: T.textFaint }}>·</span>
          <span>예상 30분</span>
        </div>
      </div>

      {/* Guide section */}
      <div style={{ padding: '24px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>운동 가이드</div>
        <div style={{ fontSize: 11, color: T.textMid }}>편집</div>
      </div>

      <div style={{ padding: '0 20px 10px', display: 'flex', gap: 8 }}>
        {[{l:'머신',on:true},{l:'맨몸',on:false},{l:'유산소',on:false}].map(c => (
          <div key={c.l} style={{
            padding: '7px 14px', borderRadius: 999,
            background: c.on ? T.amberSoft : 'transparent',
            border: `1px solid ${c.on ? 'rgba(242,169,60,0.4)' : T.borderHi}`,
            color: c.on ? T.amber : T.textMid, fontSize: 12, fontWeight: c.on ? 600 : 500,
          }}>{c.l}</div>
        ))}
      </div>

      <div style={{ padding: '4px 20px 12px', display: 'flex', gap: 14, fontSize: 12 }}>
        {[{l:'★ 즐겨찾기',on:true},{l:'상체 밀기',on:false},{l:'상체 당기기',on:false},{l:'하체',on:false}].map(c => (
          <div key={c.l} style={{
            padding: '4px 0', color: c.on ? T.amber : T.textDim,
            fontWeight: c.on ? 600 : 500,
            borderBottom: c.on ? `2px solid ${T.amber}` : '2px solid transparent',
          }}>{c.l}</div>
        ))}
      </div>

      <div style={{ padding: '0 20px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { name: '머신 체스트 프레스', mg: '가슴, 어깨', w: '30kg', r: '12회 × 3세트' },
          { name: '랫 풀다운', mg: '등, 이두', w: '35kg', r: '10회 × 3세트' },
          { name: '머신 숄더 프레스', mg: '어깨, 삼두', w: '30kg', r: '10회 × 3세트' },
        ].map((e, i) => (
          <div key={i} style={{
            padding: 14, borderRadius: T.r4,
            background: T.surface, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: T.r3,
              background: T.surface3, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.amber, fontSize: 18,
            }}>⊟</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{e.name}</div>
                <span style={{ color: T.amber, fontSize: 11 }}>★</span>
              </div>
              <div style={{ fontSize: 11, color: T.textMid, marginTop: 2 }}>{e.mg}</div>
              <div style={{
                fontSize: 11, color: T.textMid, marginTop: 6,
                fontFamily: Tfont.mono, display: 'flex', gap: 8,
              }}>
                <span style={{ color: T.amber, fontWeight: 600 }}>{e.w}</span>
                <span style={{ color: T.textFaint }}>·</span>
                <span>{e.r}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="home"/>
    </div>
  );
}

function RingProgress({ value, total }) {
  const r = 26, c = 2 * Math.PI * r;
  const pct = value / total;
  return (
    <div style={{ position: 'relative', width: 64, height: 64 }}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} stroke={T.surface3} strokeWidth="4" fill="none"/>
        <circle cx="32" cy="32" r={r} stroke={T.sage} strokeWidth="4" fill="none"
                strokeDasharray={c} strokeDashoffset={c - c*pct}
                strokeLinecap="round" transform="rotate(-90 32 32)"/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', lineHeight: 1,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
        <div style={{ fontSize: 9, color: T.textDim, marginTop: 2 }}>/{total}</div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// INBODY input — redesigned (progressive, not 9-zeros)
// ──────────────────────────────────────────────────────
function InBodyScreen() {
  return (
    <div style={{ height: '100%', overflow: 'auto', paddingBottom: 80 }}>
      {/* Top bar */}
      <div style={{
        padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ fontSize: 20, color: T.textMid }}>‹</div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>인바디 기록</div>
        <div style={{ width: 20 }}/>
      </div>

      {/* Method picker — moved up, friendlier */}
      <div style={{ padding: '16px 20px 14px' }}>
        <div style={{ fontSize: 11, color: T.textMid, marginBottom: 10 }}>입력 방법</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <MethodCard icon="📷" title="사진 AI" sub="자동 인식" on/>
          <MethodCard icon="📄" title="CSV" sub="기기 파일"/>
          <MethodCard icon="✎"  title="수동"  sub="직접 입력"/>
        </div>
      </div>

      {/* Date */}
      <div style={{ padding: '4px 20px 14px' }}>
        <div style={{ fontSize: 11, color: T.textMid, marginBottom: 6 }}>측정일</div>
        <div style={{
          padding: '12px 14px', borderRadius: T.r4, background: T.surface,
          border: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 14, fontFamily: Tfont.mono }}>2026-05-27</div>
          <div style={{ color: T.textMid }}>📅</div>
        </div>
      </div>

      {/* Required first */}
      <div style={{
        padding: '4px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <div style={{ fontSize: 11, color: T.textMid, fontWeight: 600 }}>필수</div>
        <div style={{ fontSize: 10, color: T.textFaint }}>최소 체중만 있으면 OK</div>
      </div>
      <div style={{
        margin: '0 20px 16px', padding: 16, borderRadius: T.r4,
        background: T.surface, border: `1px solid rgba(242,169,60,0.18)`,
      }}>
        <InputRow label="체중" placeholder="—" unit="kg" required focus/>
      </div>

      {/* Optional — collapsible feel */}
      <div style={{
        padding: '4px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <div style={{ fontSize: 11, color: T.textMid, fontWeight: 600 }}>체성분 (선택)</div>
        <div style={{ fontSize: 11, color: T.amber }}>전체 입력 ▾</div>
      </div>
      <div style={{
        margin: '0 20px 14px', padding: '4px 16px', borderRadius: T.r4,
        background: T.surface, border: `1px solid ${T.border}`,
      }}>
        <InputRow label="골격근" placeholder="—" unit="kg"/>
        <InputRow label="체지방량" placeholder="—" unit="kg"/>
        <InputRow label="체지방률" placeholder="—" unit="%"/>
        <InputRow label="BMI" placeholder="—" unit="" last/>
      </div>

      <div style={{ padding: '4px 20px 6px', fontSize: 11, color: T.textMid, fontWeight: 600 }}>
        대사 (선택)
      </div>
      <div style={{
        margin: '0 20px 14px', padding: '4px 16px', borderRadius: T.r4,
        background: T.surface, border: `1px solid ${T.border}`,
      }}>
        <InputRow label="기초대사량" placeholder="—" unit="kcal"/>
        <InputRow label="내장지방" placeholder="—" unit="Lv"/>
        <InputRow label="인바디 점수" placeholder="—" unit="점" last/>
      </div>

      {/* Memo */}
      <div style={{ padding: '4px 20px 6px', fontSize: 11, color: T.textMid, fontWeight: 600 }}>메모</div>
      <div style={{
        margin: '0 20px 18px', padding: '12px 14px', borderRadius: T.r4, height: 64,
        background: T.surface, border: `1px solid ${T.border}`,
        color: T.textFaint, fontSize: 13,
      }}>예: 3주차 측정 · 운동 직후</div>

      {/* Save */}
      <div style={{ padding: '0 20px 24px' }}>
        <button style={{
          width: '100%', padding: '15px', border: 'none', cursor: 'pointer',
          borderRadius: T.r4, background: T.amber, color: '#1a1208',
          fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
        }}>저장</button>
        <div style={{ marginTop: 10, fontSize: 10, color: T.textFaint, textAlign: 'center' }}>
          입력 안 한 항목은 자동으로 비워둡니다
        </div>
      </div>
    </div>
  );
}

function MethodCard({ icon, title, sub, on }) {
  return (
    <div style={{
      padding: '12px 8px', borderRadius: T.r4,
      background: on ? T.amberSoft : T.surface,
      border: `1px solid ${on ? 'rgba(242,169,60,0.4)' : T.border}`,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: on ? T.amber : T.text }}>{title}</div>
      <div style={{ fontSize: 9, color: T.textDim, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function InputRow({ label, placeholder, unit, required, focus, last }) {
  return (
    <div style={{
      padding: '14px 0', display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: last ? 'none' : `1px solid ${T.border}`,
    }}>
      <div style={{
        flex: '0 0 78px', fontSize: 13,
        color: required ? T.text : T.textMid,
        fontWeight: required ? 600 : 500,
      }}>
        {label}{required && <span style={{ color: T.amber, marginLeft: 4 }}>*</span>}
      </div>
      <div style={{
        flex: 1, fontSize: 16, color: focus ? T.text : T.textFaint, fontWeight: 500,
        fontFamily: Tfont.mono,
        borderBottom: focus ? `1px solid ${T.amber}` : 'none',
        paddingBottom: 2,
      }}>{placeholder}</div>
      <div style={{
        flex: '0 0 32px', fontSize: 11, color: T.textDim, textAlign: 'right', fontFamily: Tfont.mono,
      }}>{unit}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// RECORD — redesigned (cleaner grouping)
// ──────────────────────────────────────────────────────
function RecordScreen() {
  return (
    <div style={{ height: '100%', overflow: 'auto', paddingBottom: 80 }}>
      <AppHeader/>
      <SectionTabs items={['홈','식단','체중','운동','기록']} active="기록"/>

      <div style={{ padding: '16px 20px 4px' }}>
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: T.textMid }}>
          <span><b style={{ color: T.text }}>P 0</b><span style={{ color: T.textDim }}> / 110g</span></span>
          <span><b style={{ color: T.text }}>0</b> kcal</span>
          <span style={{ flex: 1 }}/>
          <span style={{ fontFamily: Tfont.mono, color: T.amber, fontWeight: 600 }}>D+79</span>
        </div>
      </div>

      {/* Weight quick input */}
      <div style={{ padding: '14px 20px 6px', fontSize: 12, color: T.textMid, fontWeight: 600 }}>체중</div>
      <div style={{
        margin: '0 20px 18px', padding: '14px 16px', borderRadius: T.r4,
        background: T.surface, border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: T.surface3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.amber, fontSize: 16,
        }}>⚖</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: Tfont.mono, letterSpacing: '-1px' }}>105.0</div>
          <div style={{ fontSize: 12, color: T.textMid }}>kg</div>
        </div>
        <button style={{
          padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: T.amber, color: '#1a1208', fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
        }}>저장</button>
      </div>

      {/* InBody shortcut */}
      <div style={{ padding: '0 20px 6px', fontSize: 12, color: T.textMid, fontWeight: 600 }}>인바디</div>
      <div style={{
        margin: '0 20px 18px', padding: '14px 16px', borderRadius: T.r4,
        background: T.surface, border: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: T.surface3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.amber, fontSize: 16,
          }}>◫</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>인바디 기록하기</div>
            <div style={{ fontSize: 11, color: T.textMid, marginTop: 2 }}>마지막 측정 5/1 · 26일 전</div>
          </div>
          <div style={{ color: T.textFaint }}>›</div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
          {['📷 사진 AI','📄 CSV','✎ 수동'].map(t => (
            <div key={t} style={{
              padding: '6px 10px', borderRadius: 999, background: T.surface3,
              fontSize: 10, color: T.textMid,
            }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Medication */}
      <div style={{
        padding: '0 20px 6px', fontSize: 12, color: T.textMid, fontWeight: 600,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>투약</span>
        <span style={{ color: T.textDim, fontWeight: 500 }}>주 1회 · 금요일</span>
      </div>
      <div style={{
        margin: '0 20px 18px', padding: '14px 16px', borderRadius: T.r4,
        background: T.surface, border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: T.surface3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.sage, fontSize: 16,
        }}>💊</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>마운자로</div>
          <div style={{ fontSize: 11, color: T.textMid, marginTop: 2 }}>GLP-1 주사 · 다음 주 금요일</div>
        </div>
        <div style={{
          padding: '6px 10px', borderRadius: 999, background: T.surface3,
          fontSize: 11, fontWeight: 600, fontFamily: Tfont.mono,
        }}>5mg ▾</div>
        <button style={{
          padding: '8px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: T.amber, color: '#1a1208', fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
        }}>투약</button>
      </div>

      {/* Meal AI */}
      <div style={{
        padding: '0 20px 6px', fontSize: 12, color: T.textMid, fontWeight: 600,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>식단 기록</span>
        <span style={{ color: T.amber, fontWeight: 600 }}>AI 분석</span>
      </div>
      <div style={{
        margin: '0 20px 18px', padding: '14px 16px', borderRadius: T.r4,
        background: T.surface, border: `1px solid ${T.border}`,
      }}>
        <div style={{ fontSize: 13, color: T.textFaint, lineHeight: 1.55 }}>
          점심 김치찌개 반인분 + 공깃밥 2/3...
        </div>
        <div style={{
          marginTop: 14, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <button style={{
            padding: '8px 12px', borderRadius: T.r3, background: T.surface3,
            border: 'none', color: T.text, cursor: 'pointer', fontSize: 12,
          }}>📷 사진</button>
          <div style={{ flex: 1 }}/>
          <button style={{
            padding: '8px 16px', borderRadius: 999, background: T.amber,
            border: 'none', color: '#1a1208', cursor: 'pointer', fontWeight: 700, fontSize: 12,
            fontFamily: 'inherit',
          }}>분석 ↗</button>
        </div>
      </div>

      {/* Frequent */}
      <div style={{ padding: '0 20px 8px', fontSize: 12, color: T.textMid, fontWeight: 600 }}>자주 먹는 음식</div>
      <div style={{ padding: '0 20px 24px', display: 'flex', gap: 8, overflow: 'hidden' }}>
        {[
          { name: '닥터유 프로 단백질 쉐이크', p: '36g' },
          { name: '닥터유 프로 단백질 파우더', p: '24g' },
        ].map((f, i) => (
          <div key={i} style={{
            flex: 1, padding: 12, borderRadius: T.r4,
            background: T.surface, border: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 11, color: T.textMid, lineHeight: 1.4, height: 32, overflow: 'hidden' }}>
              {f.name}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: T.amber, fontWeight: 700, fontFamily: Tfont.mono }}>
              P {f.p}
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="home"/>
    </div>
  );
}

Object.assign(window, {
  PhoneShell, HomeScreen, WeightScreen, WorkoutScreen, InBodyScreen, RecordScreen,
});
