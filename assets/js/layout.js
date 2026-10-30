/* Shared header, nav, role switcher and footer (SkillSpace look).
   Each page has <body data-role="trainer" data-page="my-trainings"> plus
   <div id="site-header"></div> and <div id="site-footer"></div>. */
(function () {
  const NAV = {
    participant: [['Discover', 'participant/trainings.html'], ['My trainings', 'participant/my-trainings.html'], ['Certificates', 'participant/certificate.html']],
    trainer: [['My trainings', 'trainer/my-trainings.html'], ['New request', 'trainer/new-request.html'], ['Attendance', 'trainer/attendance.html'], ['Applications', 'trainer/applications.html']],
    manager: [['Requests', 'manager/requests.html'], ['Schedule', 'manager/schedule.html'], ['Payments', 'manager/payments.html'], ['Reports', 'manager/reports.html']],
    admin: [['Dashboard', 'admin/dashboard.html'], ['Users', 'admin/users.html'], ['Categories', 'admin/categories.html'], ['Rooms', 'admin/rooms.html']]
  };
  const HOME = { participant: 'participant/trainings.html', trainer: 'trainer/my-trainings.html', manager: 'manager/requests.html', admin: 'admin/dashboard.html' };
  const USER = { participant: ['SA', 'Sara Ahmed'], trainer: ['TB', 'TechBridge Institute'], manager: ['TM', 'Training Manager'], admin: ['AD', 'Admin'] };
  const body = document.body, page = body.dataset.page || '';
  const role = body.dataset.role || 'participant';
  const root = /\/(participant|trainer|manager|admin)\//.test(location.pathname) ? '../' : '';
  const nav = (NAV[role] || []).map(([l, h]) =>
    `<a href="${root}${h}" class="${h.endsWith('/' + page + '.html') ? 'active' : ''}">${l}</a>`).join('');
  const opts = Object.keys(NAV).map(r =>
    `<option value="${r}" ${r === role ? 'selected' : ''}>${r[0].toUpperCase() + r.slice(1)}</option>`).join('');
  const header = document.getElementById('site-header');
  if (header) header.outerHTML =
    `<header class="site-header"><a class="brand" href="${root}index.html"><span class="brand-mark">&#10022;</span><span><b>SkillSpace</b><small>TRAINING HUB</small></span></a>
     <nav class="main-nav" aria-label="Main">${nav}</nav>
     <div class="header-tools"><label for="role-switch" class="visually-hidden">Role</label>
     <select id="role-switch" class="form-select role-select">${opts}</select>
     <a class="bell" href="${root}alerts.html" aria-label="Alerts">&#128276;<i></i></a>
     <a class="user-chip" href="${root}profile.html"><span class="avatar">${USER[role][0]}</span>${USER[role][1]}</a></div></header>`;
  const footer = document.getElementById('site-footer');
  if (footer) footer.outerHTML =
    `<footer class="site-footer"><div class="brand"><span class="brand-mark">&#10022;</span><span><b>SkillSpace</b><small>Training Events Management System</small></span></div>
     <span>A single place to discover, manage and complete training.</span></footer>`;
  document.getElementById('role-switch')?.addEventListener('change', e => { location.href = root + HOME[e.target.value]; });
})();
