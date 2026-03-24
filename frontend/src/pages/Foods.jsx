import { useState, useEffect } from 'react';
import { getFoods, saveFood, deleteFood, uploadPhoto } from '../lib/api';
import { Card, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, Plus, Pencil, Trash2, Camera } from 'lucide-react';

export function Foods() {
  const [foods, setFoods] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ id: '', name: '', description: '', calories_kcal: '', protein_g: '', carbs_g: '', fat_g: '', category: 'meal', meal_type: '간식' });
  const [photoStatus, setPhotoStatus] = useState('');

  const refresh = async () => { const f = await getFoods(); setFoods(f); };
  useEffect(() => { refresh(); }, []);

  const openForm = (food) => {
    if (food) {
      setEditId(food.id);
      setForm({ ...food, calories_kcal: String(food.calories_kcal), protein_g: String(food.protein_g), carbs_g: String(food.carbs_g), fat_g: String(food.fat_g) });
    } else {
      setEditId(null);
      setForm({ id: '', name: '', description: '', calories_kcal: '', protein_g: '', carbs_g: '', fat_g: '', category: 'meal', meal_type: '간식' });
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.id || !form.name) { alert('ID와 음식명은 필수'); return; }
    await saveFood({ ...form, calories_kcal: parseInt(form.calories_kcal) || 0, protein_g: parseFloat(form.protein_g) || 0, carbs_g: parseFloat(form.carbs_g) || 0, fat_g: parseFloat(form.fat_g) || 0 });
    setShowForm(false);
    refresh();
  };

  const handleDelete = async (id) => {
    if (!confirm('삭제할까요?')) return;
    await deleteFood(id);
    refresh();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = await uploadPhoto(file);
    if (res.ok) { setPhotoStatus('✅ ' + res.filename + ' 업로드 완료'); setTimeout(() => setPhotoStatus(''), 3000); }
    e.target.value = '';
  };

  const Field = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
    <div>
      <div className="text-[11px] text-muted mb-1">{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-bg-elevated border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-text focus:border-accent outline-none" />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg pb-10">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
        <a href="/" className="text-accent"><ArrowLeft size={20} /></a>
        <div className="flex-1 text-base font-bold">음식 데이터 관리</div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* 사진 업로드 */}
        <div className="text-[11px] tracking-[2px] text-muted uppercase mb-2">영양정보 사진 업로드</div>
        <label className="flex items-center justify-center gap-2 w-full py-3.5 bg-bg-card border border-dashed border-white/[0.06] rounded-2xl text-muted text-sm cursor-pointer active:bg-bg-elevated">
          <Camera size={16} /> 영양성분표 사진 올리기
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </label>
        {photoStatus && <div className="text-xs text-success">{photoStatus}</div>}

        {/* 음식 목록 */}
        <div className="text-[11px] tracking-[2px] text-muted uppercase mt-4 mb-2">등록된 음식 ({foods.length}개)</div>
        <button onClick={() => openForm(null)} className="w-full py-3.5 bg-bg-card border border-dashed border-accent/20 rounded-2xl text-accent text-sm font-bold flex items-center justify-center gap-1.5">
          <Plus size={16} /> 새 음식 등록
        </button>

        {foods.map(f => (
          <Card key={f.id}>
            <div className="text-sm font-bold">{f.name}</div>
            {f.description && <div className="text-[11px] text-muted mt-0.5">{f.description}</div>}
            <div className="flex gap-1.5 flex-wrap mt-2">
              <Badge color="warning">🔥{f.calories_kcal}kcal</Badge>
              <Badge color="accent">P{f.protein_g}g</Badge>
              <Badge color="warning">C{f.carbs_g}g</Badge>
              <Badge color="info">F{f.fat_g}g</Badge>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => openForm(f)} className="text-xs text-accent flex items-center gap-1"><Pencil size={12} /> 수정</button>
              <button onClick={() => handleDelete(f.id)} className="text-xs text-danger flex items-center gap-1"><Trash2 size={12} /> 삭제</button>
            </div>
          </Card>
        ))}
      </div>

      {/* 폼 오버레이 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 z-[200] overflow-y-auto">
          <div className="bg-bg-card rounded-2xl m-5 p-5 space-y-3">
            <div className="text-base font-bold">{editId ? '음식 수정' : '새 음식 등록'}</div>
            <Field label="ID (영문)" value={form.id} onChange={v => setForm(f => ({ ...f, id: v }))} placeholder="dryu_shake" />
            <Field label="음식명" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="닥터유 프로틴 쉐이크" />
            <Field label="설명" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="350ml" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="칼로리 (kcal)" value={form.calories_kcal} onChange={v => setForm(f => ({ ...f, calories_kcal: v }))} type="number" />
              <Field label="단백질 (g)" value={form.protein_g} onChange={v => setForm(f => ({ ...f, protein_g: v }))} type="number" />
              <Field label="탄수화물 (g)" value={form.carbs_g} onChange={v => setForm(f => ({ ...f, carbs_g: v }))} type="number" />
              <Field label="지방 (g)" value={form.fat_g} onChange={v => setForm(f => ({ ...f, fat_g: v }))} type="number" />
            </div>
            <div className="flex gap-2.5 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-bg-elevated border border-white/[0.1] rounded-xl text-sm font-bold">취소</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-accent text-black rounded-xl text-sm font-bold">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
