/* Module 3 - Scheduling & Resources (Yasmeena)
   Shared logic: build session dates, find suitable rooms, detect room/time clashes.
   Page code at the bottom runs on manager/schedule.html. */
const Scheduling = {
  toMin(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; },
  overlap(a, b) { const [a1, a2] = a.split('-').map(Scheduling.toMin), [b1, b2] = b.split('-').map(Scheduling.toMin); return a1 < b2 && b1 < a2; },

  /* Session dates: walk from start to end and keep the days the trainer chose, up to the number of sessions. */
  buildSessions(t) {
    const out = []; const d = new Date(t.start + 'T00:00:00'); const end = new Date(t.end + 'T00:00:00');
    while (d <= end && out.length < t.sessionsCount) {
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (t.days.includes(d.getDay())) out.push({ date: iso, time: t.time });
      d.setDate(d.getDate() + 1);
    }
    return out;
  },

  /* Rooms that fit the capacity and have every resource the trainer asked for. */
  suitableRooms(t) {
    return DATA.rooms.filter(r => r.seats >= t.capacity && t.resources.every(x => r.features.includes(x)));
  },

  /* Returns the sessions of other trainings that clash with this training in the chosen room. */
  clashes(t, roomId) {
    const mine = Scheduling.buildSessions(t);
    return DATA.sessions.filter(s => s.room === roomId && s.trainingId !== t.id &&
      mine.some(m => m.date === s.date && Scheduling.overlap(m.time, s.time)));
  },

  /* Saves the sessions of a training into the room timetable (replaces older ones). */
  book(t, roomId) {
    DATA.sessions = DATA.sessions.filter(s => s.trainingId !== t.id);
    Scheduling.buildSessions(t).forEach(s => DATA.sessions.push({ trainingId: t.id, date: s.date, time: s.time, room: roomId }));
    t.room = roomId;
  },

  /* Text for the clash notice box (used here and on the manager review page). */
  clashNotice(t, roomId) {
    const room = getRoom(roomId); if (!room) return { ok: false, html: '<strong>Choose a room.</strong> The system checks it for clashes.' };
    if (room.seats < t.capacity) return { ok: false, html: `<strong>Too small:</strong> ${esc(room.name)} has ${room.seats} seats, the training needs ${t.capacity}.` };
    const missing = t.resources.filter(x => !room.features.includes(x));
    if (missing.length) return { ok: false, html: `<strong>Missing resources:</strong> ${esc(room.name)} has no ${esc(missing.join(', '))}.` };
    const c = Scheduling.clashes(t, roomId);
    if (c.length) return { ok: false, html: `<strong>Clash:</strong> ${esc(room.name)} is already booked on ${c.map(s => fmtDate(s.date, { day: 'numeric', month: 'short' }) + ' ' + s.time).join(', ')}.` };
    return { ok: true, html: `<strong>No clash:</strong> ${esc(room.name)} is free for all ${Scheduling.buildSessions(t).length} sessions.` };
  }
};

/* ---------- manager/schedule.html ---------- */
if (document.body.dataset.page === 'schedule') {
  const pick = document.getElementById('training-pick'), roomSel = document.getElementById('room-pick');
  const notice = document.getElementById('clash-box'), body = document.getElementById('session-rows'), btn = document.getElementById('save-schedule');
  const timetable = document.getElementById('timetable-rows');
  const schedulable = () => DATA.trainings.filter(t => ['approved', 'open', 'ongoing'].includes(t.status));
  const current = () => getTraining(pick.value);

  function renderTimetable() {
    const rows = DATA.sessions.filter(s => getTraining(s.trainingId)).sort((a, b) => a.date.localeCompare(b.date));
    timetable.innerHTML = rows.length ? rows.map(s => `<tr><td>${fmtDate(s.date)}</td><td>${s.time.replace('-', ' – ')}</td><td>${esc(getRoom(s.room).name)}</td><td>${esc(getTraining(s.trainingId).title)}</td></tr>`).join('')
      : '<tr><td colspan="4" class="empty">No sessions booked yet.</td></tr>';
  }
  function renderPick() {
    const list = schedulable();
    pick.innerHTML = list.length ? list.map(t => `<option value="${t.id}">${esc(t.title)}</option>`).join('') : '<option value="">No approved trainings</option>';
    renderRooms();
  }
  function renderRooms() {
    const t = current(); if (!t) { body.innerHTML = '<tr><td colspan="4" class="empty">Approve a request first, then schedule it here.</td></tr>'; btn.disabled = true; return; }
    roomSel.innerHTML = DATA.rooms.map(r => `<option value="${r.id}" ${r.id === t.room ? 'selected' : ''}>${esc(r.name)} · ${r.seats} seats · ${esc(r.features.join(', '))}</option>`).join('');
    if (!t.room) roomSel.value = (Scheduling.suitableRooms(t).find(r => !Scheduling.clashes(t, r.id).length) || Scheduling.suitableRooms(t)[0] || DATA.rooms[0]).id;
    check();
  }
  function check() {
    const t = current(); if (!t) return;
    const res = Scheduling.clashNotice(t, roomSel.value);
    notice.className = 'notice ' + (res.ok ? 'ok' : 'bad'); notice.innerHTML = res.html; btn.disabled = !res.ok;
    const clashDates = new Set(Scheduling.clashes(t, roomSel.value).map(s => s.date));
    body.innerHTML = Scheduling.buildSessions(t).map((s, i) => `<tr><td>${i + 1}</td><td>${fmtDate(s.date, { weekday: 'short', day: 'numeric', month: 'short' })}</td><td>${s.time.replace('-', ' – ')}</td>
      <td>${clashDates.has(s.date) ? '<span class="tag bad">Clash</span>' : '<span class="tag ok">Free</span>'}</td></tr>`).join('');
    document.getElementById('train-info').textContent = `${t.type} · ${t.capacity} seats · needs ${t.resources.join(', ') || 'no special resources'}`;
  }
  pick.addEventListener('change', renderRooms);
  roomSel.addEventListener('change', check);
  btn.addEventListener('click', () => {
    const t = current(); Scheduling.book(t, roomSel.value);
    if (t.status === 'approved') t.status = 'open';
    toast(`Published: ${t.title} in ${getRoom(t.room).name}`); renderTimetable(); renderPick();
  });
  renderPick(); renderTimetable();
}
