const BASE = '';

export async function fetchData() {
  const res = await fetch(`${BASE}/api/data`);
  return res.json();
}

export async function uploadPhoto(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${BASE}/api/photo`, { method: 'POST', body: fd });
  return res.json();
}

export async function saveExercise(data) {
  const res = await fetch(`${BASE}/api/exercise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteExercise(date, startTime) {
  const res = await fetch(`${BASE}/api/exercise`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, start_time: startTime }),
  });
  return res.json();
}

export async function getFoods() {
  const res = await fetch(`${BASE}/api/foods`);
  return res.json();
}

export async function saveFood(data) {
  const res = await fetch(`${BASE}/api/foods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteFood(id) {
  const res = await fetch(`${BASE}/api/foods/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function toggleFavoriteExercise(id) {
  const res = await fetch(`${BASE}/api/exercise-library/${id}/favorite`, { method: 'PUT' });
  return res.json();
}
