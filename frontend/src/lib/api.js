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

export async function updateProfile(patch) {
  const res = await fetch(`${BASE}/api/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return res.json();
}

export async function fetchAiJobs(limit = 10) {
  const res = await fetch(`${BASE}/api/ai/jobs?limit=${limit}`);
  return res.json();
}

export async function saveInbody(payload) {
  const res = await fetch(`${BASE}/api/inbody`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function parseInbodyCsv(path) {
  const res = await fetch(`${BASE}/api/csv/inbody`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  return res.json();
}

export async function requestInbodyAiParse(photo) {
  const res = await fetch(`${BASE}/api/ai/inbody-parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photo }),
  });
  return res.json();
}

export async function requestWeeklyReport(startDate, endDate) {
  const res = await fetch(`${BASE}/api/ai/weekly-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start_date: startDate, end_date: endDate }),
  });
  return res.json();
}

export async function requestCoach(question) {
  const res = await fetch(`${BASE}/api/ai/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  return res.json();
}

/** AI job polling. Record/Coach/Inbody/Weekly 공통.
 *  반환: { ok: boolean, job?: object, error?: string } */
export async function pollJob(jobId, { intervalMs = 2000, maxMs = 120_000, onStatus } = {}) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await new Promise(r => setTimeout(r, intervalMs));
    const res = await fetch(`${BASE}/api/ai/jobs/${jobId}`);
    if (!res.ok) {
      return { ok: false, error: `상태 조회 실패 (${res.status})` };
    }
    const job = await res.json();
    if (onStatus) onStatus(job.status);
    if (job.status === 'done')   return { ok: true, job };
    if (job.status === 'failed') return { ok: false, job, error: job.error || '실패' };
  }
  return { ok: false, error: '응답 지연 (타임아웃)' };
}
