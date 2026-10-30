/* Module 2 - Training Requests & Approval (Yasmeena)
   Runs on: trainer/my-trainings.html, trainer/new-request.html, manager/requests.html.
   Needs data.js, scheduling.js (for the room clash check). */
const OWN_TRAINER = 'TechBridge Institute'; // the demo trainer who is logged in
const page = document.body.dataset.page;

/* ---------- trainer/my-trainings.html ---------- */
if (page === 'my-trainings' && document.body.dataset.role === 'trainer') {
  const rows = document.getElementById('my-rows'), tabs = document.getElementById('status-tabs');
  let filter = 'all';
  const mine = () => DATA.trainings.filter(t => t.trainer === OWN_TRAINER);
  const GROUPS = { all: () => true, pending: t => ['pending', 'changes'].includes(t.status), published: t => ['approved', 'open', 'ongoing'].includes(t.status), done: t => ['completed', 'rejected', 'cancelled'].includes(t.status) };

  function render() {
    const list = mine();
    document.getElementById('c-pending').textContent = list.filter(GROUPS.pending).length;
    document.getElementById('c-published').textContent = list.filter(GROUPS.published).length;
    document.getElementById('c-done').textContent = list.filter(GROUPS.done).length;
    document.getElementById('c-all').textContent = list.length;
    const shown = list.filter(GROUPS[filter]);
    rows.innerHTML = shown.length ? shown.map(t => {
      const confirmed = (DATA.participants[t.id] || []).length;
      const canEdit = ['pending', 'changes'].includes(t.status);
      const canCancel = ['pending', 'changes', 'approved', 'open'].includes(t.status);
      return `<tr>
        <td><strong>${esc(t.title)}</strong><br><span class="muted small">${esc(t.type)} · ${esc(t.category)}</span>
          ${t.comment && t.status === 'changes' ? `<div class="notice small">Manager: ${esc(t.comment)}</div>` : ''}</td>
        <td>${fmtDate(t.start, { day: 'numeric', month: 'short' })}${t.end !== t.start ? ' – ' + fmtDate(t.end, { day: 'numeric', month: 'short' }) : ''}</td>
        <td class="num">${confirmed}/${t.capacity}</td>
        <td>${t.fee ? t.fee + ' LYD' : 'Free'}</td>
        <td>${statusTag(t.status)}</td>
        <td><div class="cols" style="gap:.4rem;flex-wrap:nowrap">
          ${canEdit ? `<a class="btn btn-soft btn-sm" href="new-request.html?edit=${t.id}">Edit</a>` : ''}
          ${canCancel ? `<button class="btn btn-soft btn-sm" data-cancel="${t.id}">Cancel</button>` : ''}
          ${['open', 'ongoing', 'completed'].includes(t.status) ? `<a class="btn btn-soft btn-sm" href="attendance.html?t=${t.id}">Attendance</a>` : ''}
        </div></td></tr>`;
    }).join('') : '<tr><td colspan="6" class="empty">No trainings here yet. <a href="new-request.html">Send a new request</a>.</td></tr>';
  }
  tabs.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    filter = b.dataset.f; tabs.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b)); render();
  });
  rows.addEventListener('click', e => {
    const id = e.target.dataset.cancel; if (!id) return;
    const t = getTraining(id);
    if (['open', 'approved'].includes(t.status)) {
      if (confirm('This training is published. The manager has to confirm the cancellation. Send the cancellation request?')) toast('Cancellation sent to the manager for confirmation');
    } else if (confirm(`Cancel "${t.title}"?`)) { t.status = 'cancelled'; toast('Request cancelled'); render(); }
  });
  render();
}

/* ---------- trainer/new-request.html ---------- */
if (page === 'new-request') {
  const f = document.getElementById('request-form');
  const editId = new URLSearchParams(location.search).get('edit');
  const editing = editId ? getTraining(editId) : null;
  const cat = f.category; DATA.categories.forEach(c => cat.add(new Option(c, c)));
  const feeBox = document.getElementById('fee-box');
  const reviewBox = f.review, eligField = document.getElementById('elig-field');

  const toggleFee = () => { feeBox.hidden = f.feeType.value !== 'paid'; };
  const toggleElig = () => { eligField.hidden = !reviewBox.checked; };
  f.querySelectorAll('input[name=feeType]').forEach(r => r.addEventListener('change', toggleFee));
  reviewBox.addEventListener('change', toggleElig);

  if (editing) { // fill the form with the existing request
    document.getElementById('form-title').textContent = 'Edit training request';
    f.ttitle.value = editing.title; f.type.value = editing.type; f.category.value = editing.category; f.description.value = editing.description;
    f.start.value = editing.start; f.end.value = editing.end; f.sessions.value = editing.sessionsCount; f.time.value = editing.time; f.capacity.value = editing.capacity;
    f.feeType.value = editing.fee ? 'paid' : 'free'; f.price.value = editing.fee || ''; reviewBox.checked = editing.review; f.eligibility.value = editing.eligibility;
    f.minAttendance.value = editing.minAttendance;
    f.querySelectorAll('input[name=res]').forEach(c => { c.checked = editing.resources.includes(c.value); });
  }
  toggleFee(); toggleElig();

  const rules = {
    ttitle: v => v.trim().length >= 4 || 'Enter a title of at least 4 characters.',
    description: v => v.trim().length >= 10 || 'Describe what participants will learn (10+ characters).',
    start: v => !!v || 'Choose a start date.',
    end: v => !v ? 'Choose an end date.' : (f.start.value && v < f.start.value ? 'The end date must be after the start date.' : true),
    sessions: v => (+v >= 1 && +v <= 60) || 'Enter 1 to 60 sessions.',
    capacity: v => (+v >= 1 && +v <= 500) || 'Enter a capacity between 1 and 500.',
    minAttendance: v => (+v >= 1 && +v <= 100) || 'Enter a percentage from 1 to 100.',
    price: v => f.feeType.value !== 'paid' || +v > 0 || 'Enter the price in LYD.'
  };
  function validate() {
    let ok = true;
    Object.entries(rules).forEach(([name, rule]) => {
      const field = f[name].closest('.field'); const res = rule(f[name].value);
      field.classList.toggle('invalid', res !== true);
      field.querySelector('.error').textContent = res === true ? '' : res;
      if (res !== true) ok = false;
    });
    return ok;
  }
  function collect(status) {
    const days = new Set(); // weekdays used by the sessions, taken from the start date
    const s = new Date(f.start.value + 'T00:00:00'); days.add(s.getDay());
    if (+f.sessions.value > 1) { const e = new Date(s); e.setDate(e.getDate() + 3); days.add(e.getDay()); }
    return { title: f.ttitle.value.trim(), trainer: OWN_TRAINER, type: f.type.value, category: f.category.value, description: f.description.value.trim(),
      start: f.start.value, end: f.end.value, sessionsCount: +f.sessions.value, days: [...days], time: f.time.value.replace(/\s/g, '').replace('–', '-'),
      capacity: +f.capacity.value, fee: f.feeType.value === 'paid' ? +f.price.value : 0, review: reviewBox.checked,
      eligibility: reviewBox.checked ? f.eligibility.value.trim() : '', minAttendance: +f.minAttendance.value,
      resources: [...f.querySelectorAll('input[name=res]:checked')].map(c => c.value), status, room: '', comment: '', sent: new Date().toISOString().slice(0, 10) };
  }
  function save(status) {
    if (editing) Object.assign(editing, collect(status)); else DATA.trainings.push({ id: 't' + (DATA.trainings.length + 1), ...collect(status) });
  }
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) { toast('Please fix the highlighted fields'); f.querySelector('.invalid input, .invalid textarea')?.focus(); return; }
    save('pending');
    document.getElementById('done-box').hidden = false; f.hidden = true; window.scrollTo(0, 0);
  });
  document.getElementById('save-draft').addEventListener('click', () => {
    if (!f.ttitle.value.trim()) { toast('Add a title before saving the draft'); return; }
    toast('Draft saved on this page only (demo data)');
  });
}

/* ---------- manager/requests.html ---------- */
if (page === 'requests') {
  const body = document.getElementById('req-rows'), panel = document.getElementById('review-panel');
  const reviewable = t => ['pending', 'changes'].includes(t.status);
  let selected = null;

  function stats() {
    const n = fn => DATA.trainings.filter(fn).length;
    document.getElementById('s-pending').textContent = n(t => t.status === 'pending');
    document.getElementById('s-changes').textContent = n(t => t.status === 'changes');
    document.getElementById('s-published').textContent = n(t => ['open', 'ongoing', 'approved'].includes(t.status));
    document.getElementById('s-week').textContent = n(t => ['open', 'approved'].includes(t.status) && new Date(t.start) - new Date() < 7 * 864e5 && new Date(t.start) >= new Date());
  }
  function renderList() {
    const list = DATA.trainings.filter(reviewable).sort((a, b) => b.sent.localeCompare(a.sent));
    if (!selected || !list.find(t => t.id === selected)) selected = list[0]?.id || null;
    body.innerHTML = list.length ? list.map(t => `<tr class="selectable ${t.id === selected ? 'selected' : ''}" data-id="${t.id}" tabindex="0">
      <td><a href="#">${esc(t.title)}</a></td><td>${esc(t.trainer)}</td><td>${esc(t.type)}</td><td>${fmtDate(t.sent, { day: 'numeric', month: 'short' })}</td><td>${statusTag(t.status)}</td></tr>`).join('')
      : '<tr><td colspan="5" class="empty">All requests are reviewed.</td></tr>';
    stats(); renderPanel();
  }
  function renderPanel() {
    const t = getTraining(selected);
    if (!t) { panel.innerHTML = '<p class="empty">Select a request to review it.</p>'; return; }
    const sessions = Scheduling.buildSessions(t).length;
    const suitable = Scheduling.suitableRooms(t).map(r => r.id);
    const rooms = [...DATA.rooms].sort((a, b) => suitable.includes(b.id) - suitable.includes(a.id));
    panel.innerHTML = `<h2>${esc(t.title)}</h2><p class="muted">Requested by ${esc(t.trainer)} on ${fmtDate(t.sent, { day: 'numeric', month: 'short' })}</p>
      <dl class="kv"><dt>Type</dt><dd>${esc(t.type)} · ${esc(t.category)}</dd>
        <dt>Dates</dt><dd>${fmtDate(t.start, { day: 'numeric', month: 'short' })} – ${fmtDate(t.end)}</dd>
        <dt>Sessions</dt><dd>${t.sessionsCount} · ${t.time.replace('-', ' – ')}</dd>
        <dt>Capacity</dt><dd>${t.capacity} seats</dd><dt>Fee</dt><dd>${t.fee ? t.fee + ' LYD' : 'Free'}</dd>
        <dt>Review</dt><dd>${t.review ? 'Trainer reviews applicants' : 'Automatic acceptance'}</dd>
        <dt>Certificate</dt><dd>${t.minAttendance}% attendance</dd><dt>Resources</dt><dd>${esc(t.resources.join(', ') || 'None')}</dd></dl>
      <div class="field"><label class="lbl" for="room">Assign room</label>
        <select id="room" class="form-select">${rooms.map(r => `<option value="${r.id}">${esc(r.name)} · ${r.seats} seats · ${esc(r.features.join(', ').toLowerCase())}</option>`).join('')}</select></div>
      <div id="clash" class="notice"></div>
      <div class="field"><label class="lbl" for="comment">Comment to trainer</label>
        <textarea id="comment" class="form-control" placeholder="Required when you reject or ask for changes"></textarea><div class="error" id="comment-err">Write a comment so the trainer knows what to do.</div></div>
      <button class="btn btn-primary w-100" id="approve">Approve and publish</button>
      <div class="btn-row"><button class="btn btn-soft" id="changes">Request changes</button><button class="btn btn-soft" id="reject">Reject</button></div>`;
    const room = document.getElementById('room'), clash = document.getElementById('clash'), approve = document.getElementById('approve');
    room.value = suitable.find(id => !Scheduling.clashes(t, id).length) || suitable[0] || DATA.rooms[0].id;
    const check = () => { const r = Scheduling.clashNotice(t, room.value); clash.className = 'notice ' + (r.ok ? 'ok' : 'bad'); clash.innerHTML = r.html; approve.disabled = !r.ok; };
    room.addEventListener('change', check); check();
    const comment = document.getElementById('comment');
    const need = () => { const bad = !comment.value.trim(); comment.closest('.field').classList.toggle('invalid', bad); if (bad) comment.focus(); return !bad; };
    approve.addEventListener('click', () => { Scheduling.book(t, room.value); t.status = 'open'; t.comment = comment.value.trim(); toast(`Approved and published: ${t.title}`); renderList(); });
    document.getElementById('changes').addEventListener('click', () => { if (!need()) return; t.status = 'changes'; t.comment = comment.value.trim(); toast('Sent back to the trainer for changes'); renderList(); });
    document.getElementById('reject').addEventListener('click', () => { if (!need()) return; t.status = 'rejected'; t.comment = comment.value.trim(); toast('Request rejected, the trainer sees your reason'); renderList(); });
  }
  body.addEventListener('click', e => { const tr = e.target.closest('tr[data-id]'); if (!tr) return; e.preventDefault(); selected = tr.dataset.id; renderList(); });
  body.addEventListener('keydown', e => { if (e.key === 'Enter') e.target.closest('tr[data-id]')?.click(); });
  renderList();
}
