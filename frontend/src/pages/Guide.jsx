import { useState } from 'react';
import { Card, CardTitle } from '../components/ui/Card';
import { TabBar } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft } from 'lucide-react';

const guideTabs = [
  { id: 'schedule', label: '하루일과' },
  { id: 'diet', label: '식단' },
  { id: 'workout', label: '운동' },
  { id: 'food', label: '식품도감' },
  { id: 'roadmap', label: '로드맵' },
];

export function Guide() {
  const [tab, setTab] = useState('schedule');

  return (
    <div className="pb-10 animate-in">
      <div className="mb-4">
        <div className="text-[11px] tracking-[3px] text-accent uppercase">Simpson Health Guide</div>
        <div className="font-display text-2xl tracking-wider mt-1">운동 & 식단 가이드</div>
        <div className="text-xs text-muted mt-1.5">108.7kg · 근손실 방지 최우선 · 마운자로 복용 중</div>
        <Badge color="accent" className="mt-2">목표 80kg · 단백질 110g/일</Badge>
      </div>

      <TabBar tabs={guideTabs} active={tab} onChange={setTab} />
      <div className="space-y-3">
        {tab === 'schedule' && <ScheduleTab />}
        {tab === 'diet' && <DietGuideTab />}
        {tab === 'workout' && <WorkoutGuideTab />}
        {tab === 'food' && <FoodGuideTab />}
        {tab === 'roadmap' && <RoadmapTab />}
      </div>
    </div>
  );
}

function ScheduleTab() {
  const items = [
    { time: '오전', icon: '🏋️', name: '머신 6종', detail: '2세트 × 12~15회 · 30분' },
    { time: '오전', icon: '🏃', name: '경사 트레드밀', detail: '경사 12% · 속도 5.5km/h · 30분+' },
    { time: '저녁', icon: '🔔', name: '케틀벨 스윙 인터벌', detail: '16kg · 30초 스윙/30초 휴식 × 10라운드' },
  ];
  return (
    <>
      <div className="text-[11px] tracking-[2px] text-muted uppercase mb-2">하루 스케줄</div>
      <Card>{items.map((it, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0 border-white/[0.03]">
          <div className="text-[11px] text-muted min-w-[35px]">{it.time}</div>
          <div className="text-lg">{it.icon}</div>
          <div className="flex-1"><div className="text-sm font-bold">{it.name}</div><div className="text-[11px] text-muted mt-0.5">{it.detail}</div></div>
        </div>
      ))}</Card>
      <div className="text-[11px] tracking-[2px] text-muted uppercase mt-4 mb-2">하루 식단</div>
      <Card>
        <table className="w-full text-xs">
          <thead><tr className="text-[10px] text-muted"><th className="text-left pb-2">식사</th><th className="text-left pb-2">메뉴</th><th className="text-right pb-2">단백질</th></tr></thead>
          <tbody>
            <tr className="border-t border-white/[0.03]"><td className="py-2">아침</td><td>닥터유PRO 드링크 40g + 고구마</td><td className="text-right text-accent">41g</td></tr>
            <tr className="border-t border-white/[0.03]"><td className="py-2">점심</td><td>일반식 (고기 위주)</td><td className="text-right text-accent">20~30g</td></tr>
            <tr className="border-t border-white/[0.03]"><td className="py-2">저녁</td><td>훈제닭가슴살 2개 + 야채</td><td className="text-right text-accent">44~54g</td></tr>
            <tr className="border-t border-white/[0.03] font-bold"><td className="py-2 text-success">합계</td><td></td><td className="text-right text-success">105~125g</td></tr>
          </tbody>
        </table>
      </Card>
    </>
  );
}

function DietGuideTab() {
  return (
    <>
      <Card>
        <CardTitle>단백질 110g 채우기</CardTitle>
        <div className="text-xs space-y-1.5 text-muted">
          <div>· 아침 쉐이크 → <span className="text-accent">36~41g</span></div>
          <div>· 점심 고기 반찬 → <span className="text-accent">20~30g</span></div>
          <div>· 편의점 보충 (두유/계란) → <span className="text-accent">12~20g</span></div>
          <div>· 저녁 닭가슴살 → <span className="text-accent">44~54g</span></div>
        </div>
      </Card>
      <Card>
        <CardTitle>간편 채소</CardTitle>
        <div className="text-xs space-y-1 text-muted">
          <div>· 상추 — 씻기만, 냉장 7~10일</div>
          <div>· 냉동 브로콜리 — 전자레인지 3분</div>
          <div>· 방울토마토 — 씻기만, 냉장 1~2주</div>
        </div>
      </Card>
      <div className="bg-warning/[0.06] border border-warning/15 rounded-2xl p-3.5 text-xs text-muted leading-relaxed">
        <strong className="text-warning">마운자로 복용 중 주의:</strong> 식욕 억제로 못 먹더라도 쉐이크라도 마시기.
      </div>
    </>
  );
}

function WorkoutGuideTab() {
  const exercises = [
    { name: '체스트 프레스', kg: '20~25', sets: '2×12~15', part: '가슴' },
    { name: '숄더 프레스', kg: '15~20', sets: '2×12~15', part: '어깨' },
    { name: '랫 풀다운', kg: '25~30', sets: '2×12~15', part: '등' },
    { name: '시티드 로우', kg: '25~30', sets: '2×12~15', part: '등' },
    { name: '레그 컬', kg: '20~25', sets: '2×12~15', part: '하체' },
    { name: '레그 익스텐션', kg: '25~30', sets: '2×12~15', part: '하체' },
  ];
  return (
    <>
      <Card>
        <table className="w-full text-xs">
          <thead><tr className="text-[10px] text-muted"><th className="text-left pb-2">운동</th><th className="pb-2">무게</th><th className="pb-2">세트×회</th><th className="text-right pb-2">부위</th></tr></thead>
          <tbody>{exercises.map((e, i) => (
            <tr key={i} className="border-t border-white/[0.03]">
              <td className="py-2 font-bold">{e.name}</td><td className="text-center">{e.kg}kg</td><td className="text-center">{e.sets}</td>
              <td className="text-right"><Badge color="accent">{e.part}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
      <div className="bg-accent/[0.06] border border-accent/15 rounded-2xl p-3.5 text-xs text-muted leading-relaxed">
        <strong className="text-accent">무게 기준:</strong> 마지막 2~3개가 힘들어야 적절. 12회 쉬우면 5kg 올리기.
      </div>
      <Card>
        <CardTitle>케틀벨 스윙 인터벌</CardTitle>
        <div className="text-xs space-y-1 text-muted">
          <div>· 무게: <span className="text-accent">16kg</span></div>
          <div>· 30초 스윙 → 30초 휴식 × 10라운드</div>
          <div>· 소요: ~15분</div>
        </div>
      </Card>
    </>
  );
}

function FoodGuideTab() {
  return (
    <>
      <Card>
        <CardTitle>닥터유PRO 드링크 40g 초코 (350ml)</CardTitle>
        <div className="flex gap-1.5 mt-1"><Badge color="warning">258kcal</Badge><Badge color="accent">P40g</Badge><Badge color="warning">C9.8g</Badge><Badge color="info">F6.5g</Badge></div>
      </Card>
      <Card>
        <CardTitle>돼지고기 부위별 (100g)</CardTitle>
        <table className="w-full text-xs mt-2">
          <thead><tr className="text-[10px] text-muted"><th className="text-left pb-1">부위</th><th>kcal</th><th>단백질</th><th>지방</th><th className="text-right">추천</th></tr></thead>
          <tbody>
            {[['안심', 115, 22, 2, '⭐⭐⭐'], ['뒷다리', 130, 21, 5, '⭐⭐⭐'], ['앞다리', 145, 19, 7, '⭐⭐'], ['등심', 160, 20, 9, '⭐⭐'], ['목살', 200, 17, 14, '⭐'], ['삼겹살', 330, 13, 28, '❌']].map(([part, cal, pro, fat, rec], i) => (
              <tr key={i} className="border-t border-white/[0.03]">
                <td className="py-1.5 font-bold">{part}</td><td className="text-center">{cal}</td><td className="text-center text-accent">{pro}g</td><td className="text-center">{fat}g</td><td className="text-right">{rec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function RoadmapTab() {
  return (
    <>
      <Card>
        <CardTitle>운동 로드맵</CardTitle>
        {[['1~2주', '자세 익히기', '추천 무게 -5kg · 2세트'], ['3~4주', '무게 정상화', '추천 무게로 2~3세트'], ['2~3개월', '무게 증가', '마지막 2개 힘들면 5kg 증량'], ['3~6개월', '루틴 다양화', '상하체 분리 고려']].map(([period, goal, action], i) => (
          <div key={i} className="flex gap-3 py-2.5 border-b last:border-0 border-white/[0.03]">
            <div className="text-xs font-bold text-accent min-w-[65px]">{period}</div>
            <div><div className="text-sm font-bold">{goal}</div><div className="text-[11px] text-muted mt-0.5">{action}</div></div>
          </div>
        ))}
      </Card>
      <Card>
        <CardTitle>체지방 감량 로드맵</CardTitle>
        {[['4~6월', '109→97kg', '월 3~4kg'], ['7~9월', '97→88kg', '월 2~3kg'], ['10~12월', '88→80kg', '월 2~2.5kg']].map(([period, goal, rate], i) => (
          <div key={i} className="flex gap-3 py-2.5 border-b last:border-0 border-white/[0.03]">
            <div className="text-xs font-bold text-accent min-w-[65px]">{period}</div>
            <div><div className="text-sm font-bold">{goal}</div><div className="text-[11px] text-muted mt-0.5">{rate}</div></div>
          </div>
        ))}
      </Card>
    </>
  );
}
