// 매월 1일 체중 목표 (5/1=104 시작, 12/1=80 최종, 7개월 24kg 감량)
// 마운자로 활발기 초중반 빠른 페이스, 후반 둔화 반영.
// 변경 시 이 배열만 수정하면 Calendar 마일스톤 + Guide 로드맵 둘 다 갱신됨.
export const ROADMAP = [
  { date: '2026-05-01', target: 104.0 },
  { date: '2026-06-01', target: 99.5  },
  { date: '2026-07-01', target: 95.5  },
  { date: '2026-08-01', target: 92.0  },
  { date: '2026-09-01', target: 88.5  },
  { date: '2026-10-01', target: 85.5  },
  { date: '2026-11-01', target: 82.5  },
  { date: '2026-12-01', target: 80.0  },
];

const DOW_KR = ['일', '월', '화', '수', '목', '금', '토'];

/** Calendar/Guide 공통 마일스톤 변환.
 *  반환 형식: [{date:'5/01', dow:'금', label:'5월 목표', kg:'103.0kg',
 *               delta:'-0.4kg', days:3, reached:bool}] */
export function computeMilestones(data) {
  const profile = data?.profile || {};
  const weightRecs = data?.weight_records || [];
  const cur = weightRecs.length > 0
    ? weightRecs[weightRecs.length - 1].weight_kg
    : null;
  if (cur == null) return [];

  const todayStr = new Date().toISOString().slice(0, 10);
  const today = new Date(todayStr);

  let prevTarget = cur;
  return ROADMAP
    .filter(m => new Date(m.date) >= today)   // 지난 마일스톤 자동 제외
    .map(m => {
      const d = new Date(m.date);
      const days = Math.max(0, Math.round((d - today) / 86400000));
      const delta = +(m.target - prevTarget).toFixed(1);
      const item = {
        date: `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`,
        dow: DOW_KR[d.getDay()],
        label: `${d.getMonth() + 1}월 목표`,
        kg: `${m.target.toFixed(1)}kg`,
        delta: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}kg`,
        days,
        reached: cur <= m.target,
      };
      prevTarget = m.target;
      return item;
    });
}
