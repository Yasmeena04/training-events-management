/* Module 7 - Attendance & Certificates (Yasmeena)
   Runs on: trainer/attendance.html and participant/certificate.html. Needs data.js. */
const Attendance = {
  /* Sessions attended / total sessions of the training. */
  rate(trainingId, pid) {
    const t = getTraining(trainingId), a = DATA.attendance[trainingId] || {};
    const attended = Object.values(a).filter(s => s[pid] === true).length;
    return { attended, total: t.sessionsCount, pct: Math.round(attended / t.sessionsCount * 100) };
  },
  meetsMinimum(trainingId, pid) { return Attendance.rate(trainingId, pid).pct >= getTraining(trainingId).minAttendance; },
  nextCertNumber() { return 'CERT-2026-' + String(DATA.certificates.length + 1).padStart(4, '0'); },
  /* Called when the trainer completes the training: certificates go only to people who meet the minimum. */
  complete(trainingId) {
    const t = getTraining(trainingId); t.status = 'completed'; let issued = 0;
    (DATA.participants[trainingId] || []).forEach(p => {
      if (Attendance.meetsMinimum(trainingId, p.id) && !DATA.certificates.find(c => c.trainingId === trainingId && c.participantId === p.id)) {
        DATA.certificates.push({ number: Attendance.nextCertNumber(), trainingId, participantId: p.id, issued: new Date().toISOString().slice(0, 10) }); issued++;
      }
    });
    return issued;
  }
};

/* ---------- trainer/attendance.html ---------- */
if (document.body.dataset.page === 'attendance') {
  const tSel = document.getElementById('att-training'), sSel = document.getElementById('att-session'), rows = document.getElementById('att-rows');
  const summary = document.getElementById('summary-rows'), done = document.getElementById('complete-btn'), info = document.getElementById('att-info');
  const eligible = () => DATA.trainings.filter(t => t.trainer === 'TechBridge Institute' && DATA.participants[t.id]);
  const cur = () => getTraining(tSel.value);
  let draft = {};

  function fillTrainings() {
    tSel.innerHTML = eligible().map(t => `<option value="${t.id}">${esc(t.title)}</option>`).join('');
    const want = new URLSearchParams(location.search).get('t'); if (want && eligible().find(t => t.id === want)) tSel.value = want;
    fillSessions();
  }
  function fillSessions() {
    const t = cur(); sSel.innerHTML = Array.from({ length: t.sessionsCount }, (_, i) => `<option value="${i + 1}">Session ${i + 1}</option>`).join('');
    const marked = Object.keys(DATA.attendance[t.id] || {}).length; sSel.value = Math.min(marked + 1, t.sessionsCount);
    loadSheet();
  }
  function loadSheet() {
    const t = cur(), n = sSel.value; draft = { ...((DATA.attendance[t.id] || {})[n] || {}) };
    info.textContent = `${t.sessionsCount} sessions · certificate needs ${t.minAttendance}% attendance · status: ${STATUS_LABEL[t.status]}`;
    renderSheet(); renderSummary();
  }
  function renderSheet() {
    rows.innerHTML = DATA.participants[cur().id].map(p => `<tr><td>${esc(p.name)}</td><td>
      <div class="toggle" role="group" aria-label="Attendance for ${esc(p.name)}"><button data-p="${p.id}" data-v="1" class="${draft[p.id] === true ? 'on' : ''}" aria-pressed="${draft[p.id] === true}">Present</button>
      <button data-p="${p.id}" data-v="0" class="${draft[p.id] === false ? 'on' : ''}" aria-pressed="${draft[p.id] === false}">Absent</button></div></td></tr>`).join('');
  }
  function renderSummary() {
    const t = cur();
    summary.innerHTML = DATA.participants[t.id].map(p => {
      const r = Attendance.rate(t.id, p.id), ok = r.pct >= t.minAttendance;
      return `<tr><td>${esc(p.name)}</td><td class="num">${r.attended}/${r.total}</td><td style="min-width:120px"><div class="bar"><span style="width:${r.pct}%"></span></div></td><td class="num">${r.pct}%</td>
        <td>${t.status === 'completed' ? (ok ? '<span class="tag ok">Certificate issued</span>' : '<span class="tag bad">Not completed</span>') : (ok ? '<span class="tag">On track</span>' : '<span class="tag dashed">Below minimum</span>')}</td></tr>`;
    }).join('');
    done.disabled = t.status === 'completed';
  }
  rows.addEventListener('click', e => { const b = e.target.closest('button[data-p]'); if (!b) return; draft[b.dataset.p] = b.dataset.v === '1'; renderSheet(); });
  document.getElementById('mark-all').addEventListener('click', () => { DATA.participants[cur().id].forEach(p => draft[p.id] = true); renderSheet(); });
  document.getElementById('save-att').addEventListener('click', () => {
    const t = cur(), list = DATA.participants[t.id];
    if (list.some(p => draft[p.id] === undefined)) { toast('Mark every participant as present or absent first'); return; }
    (DATA.attendance[t.id] = DATA.attendance[t.id] || {})[sSel.value] = { ...draft };
    if (t.status === 'open') t.status = 'ongoing';
    toast(`Session ${sSel.value} saved`); loadSheet();
  });
  done.addEventListener('click', () => {
    const t = cur(), marked = Object.keys(DATA.attendance[t.id] || {}).length;
    if (marked < t.sessionsCount && !confirm(`Only ${marked} of ${t.sessionsCount} sessions have attendance. Complete the training anyway?`)) return;
    const n = Attendance.complete(t.id); toast(`Training completed. ${n} certificate${n === 1 ? '' : 's'} issued.`); loadSheet();
  });
  tSel.addEventListener('change', fillSessions); sSel.addEventListener('change', loadSheet);
  fillTrainings();
}

/* ---------- participant/certificate.html ---------- */
if (document.body.dataset.page === 'certificate') {
  const q = new URLSearchParams(location.search);
  const tid = q.get('t'), pid = q.get('p');
  const t = getTraining(tid), person = (DATA.participants[tid] || []).find(p => p.id === pid);
  const cert = DATA.certificates.find(c => c.trainingId === tid && c.participantId === pid);
  const box = document.getElementById('cert-area');
  if (!tid || !pid) { /* template mode */ }
    else if (!t || !person || !cert) {
    document.getElementById('print-btn').hidden = true;
  } 
    else {
    const r = Attendance.rate(tid, pid);
    document.getElementById('c-name').textContent = person.name; document.getElementById('c-title').textContent = t.title;
    document.getElementById('c-detail').textContent = `${t.type} by ${t.trainer} · ${fmtDate(t.start)}${t.end !== t.start ? ' – ' + fmtDate(t.end) : ''}`;
    document.getElementById('c-att').textContent = `Attendance: ${r.attended} of ${r.total} sessions (${r.pct}%)`;
    document.getElementById('c-no').textContent = cert.number; document.getElementById('c-date').textContent = fmtDate(cert.issued);
    document.title = `Certificate ${cert.number}`;
  }
  document.getElementById('print-btn').addEventListener('click', () => window.print());
}
