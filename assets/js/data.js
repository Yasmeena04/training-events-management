/* Sample data shared by all pages. Nothing is saved to a server.
   NOTE: this is a working starter version so Yasmeena's pages run. The team can add more arrays
   (applications, payments, notifications, users) below without breaking these ones. */
const DATA = {
  categories: ['Programming', 'Data', 'Design', 'Soft skills', 'Security'],
  resources: ['Computer lab', 'Projector', 'Whiteboard', 'Microphone'],
  rooms: [
    { id: 'r1', name: 'Lab 1', seats: 30, features: ['Computer lab', 'Projector', 'Whiteboard'] },
    { id: 'r2', name: 'Lab 2', seats: 20, features: ['Computer lab', 'Projector'] },
    { id: 'r3', name: 'Hall A', seats: 60, features: ['Projector', 'Microphone', 'Whiteboard'] },
    { id: 'r4', name: 'Room 204', seats: 25, features: ['Whiteboard', 'Projector'] }
  ],
  // status: pending | changes | approved | open | ongoing | completed | rejected | cancelled
  // days: weekdays used by the sessions (0 = Sunday ... 6 = Saturday)
  trainings: [
    { id: 't1', title: 'Web Development Fundamentals', trainer: 'TechBridge Institute', type: 'Course', category: 'Programming',
      description: 'A four-week course on building websites with HTML, CSS and JavaScript.',
      start: '2026-11-17', end: '2026-12-10', sessionsCount: 8, days: [2, 4], time: '09:00-12:00', capacity: 25, fee: 150,
      review: true, eligibility: 'University students or recent graduates with basic computer skills.',
      minAttendance: 80, resources: ['Computer lab', 'Projector'], status: 'open', room: 'r1', sent: '2026-10-20', comment: '' },
    { id: 't2', title: 'Mobile App Development', trainer: 'TechBridge Institute', type: 'Course', category: 'Programming',
      description: 'Build and publish a simple mobile app.',
      start: '2027-01-05', end: '2027-01-28', sessionsCount: 8, days: [2, 4], time: '09:00-12:00', capacity: 20, fee: 120,
      review: true, eligibility: 'Basic programming knowledge.', minAttendance: 80,
      resources: ['Computer lab', 'Projector'], status: 'pending', room: '', sent: '2026-11-02', comment: '' },
    { id: 't3', title: 'Cybersecurity Awareness', trainer: 'Huda A.', type: 'Workshop', category: 'Security',
      description: 'A one-day workshop on safe habits online.',
      start: '2026-12-14', end: '2026-12-14', sessionsCount: 1, days: [1], time: '10:00-14:00', capacity: 40, fee: 0,
      review: false, eligibility: '', minAttendance: 100, resources: ['Projector', 'Microphone'],
      status: 'pending', room: '', sent: '2026-11-01', comment: '' },
    { id: 't4', title: 'Research Writing Skills', trainer: 'Salem R.', type: 'Workshop', category: 'Soft skills',
      description: 'Structure, cite and edit academic papers.',
      start: '2026-12-20', end: '2026-12-21', sessionsCount: 2, days: [0, 1], time: '09:00-13:00', capacity: 30, fee: 50,
      review: false, eligibility: '', minAttendance: 100, resources: ['Whiteboard'],
      status: 'changes', room: '', sent: '2026-10-30', comment: 'Please shorten the description and confirm the fee.' },
    { id: 't5', title: 'Summer Internship: Data Science', trainer: 'TechWorks Co.', type: 'Internship', category: 'Data',
      description: 'Six weeks working on real data projects.',
      start: '2027-06-01', end: '2027-07-10', sessionsCount: 20, days: [1, 2, 3, 4], time: '09:00-15:00', capacity: 10, fee: 0,
      review: true, eligibility: 'Third or fourth year students.', minAttendance: 80, resources: ['Computer lab'],
      status: 'pending', room: '', sent: '2026-10-29', comment: '' },
    { id: 't6', title: 'Intro to Data Analysis', trainer: 'TechBridge Institute', type: 'Workshop', category: 'Data',
      description: 'A hands-on first look at spreadsheets and charts.',
      start: '2026-10-12', end: '2026-10-12', sessionsCount: 1, days: [1], time: '09:00-13:00', capacity: 30, fee: 0,
      review: false, eligibility: '', minAttendance: 100, resources: ['Computer lab'],
      status: 'completed', room: 'r2', sent: '2026-09-20', comment: '' }
  ],
  // Sessions already booked in rooms (used by the clash check)
  sessions: [
    { trainingId: 'x1', date: '2027-01-05', time: '09:00-12:00', room: 'r1' },
    { trainingId: 'x1', date: '2027-01-07', time: '09:00-12:00', room: 'r1' },
    { trainingId: 'x2', date: '2026-12-14', time: '09:00-12:00', room: 'r3' }
  ],
  // Confirmed participants per training
  participants: {
    t1: [{ id: 'p1', name: 'Sara Ali' }, { id: 'p2', name: 'Omar Khaled' }, { id: 'p3', name: 'Huda Salem' }, { id: 'p4', name: 'Ahmed Nasser' }, { id: 'p5', name: 'Mona Fathi' }],
    t6: [{ id: 'p1', name: 'Sara Ali' }, { id: 'p2', name: 'Omar Khaled' }, { id: 'p3', name: 'Huda Salem' }]
  },
  // attendance[trainingId][sessionNumber][participantId] = true (present) / false (absent)
  attendance: {
    t1: { 1: { p1: true, p2: true, p3: false, p4: true, p5: true }, 2: { p1: true, p2: false, p3: false, p4: true, p5: true } },
    t6: { 1: { p1: true, p2: true, p3: false } }
  },
  certificates: [
    { number: 'CERT-2026-0001', trainingId: 't6', participantId: 'p1', issued: '2026-10-13' },
    { number: 'CERT-2026-0002', trainingId: 't6', participantId: 'p2', issued: '2026-10-13' }
  ]
};

/* Helpers used by every page */
const fmtDate = (iso, opts) => new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', opts || { day: 'numeric', month: 'short', year: 'numeric' });
const getTraining = id => DATA.trainings.find(t => t.id === id);
const getRoom = id => DATA.rooms.find(r => r.id === id);
const STATUS_LABEL = { pending: 'Pending', changes: 'Changes requested', approved: 'Approved', open: 'Open for registration', ongoing: 'Ongoing', completed: 'Completed', rejected: 'Rejected', cancelled: 'Cancelled' };
const STATUS_CLASS = { pending: '', changes: 'dashed', approved: 'ok', open: 'ok', ongoing: 'ok', completed: 'ok', rejected: 'bad', cancelled: 'bad' };
const statusTag = s => `<span class="tag ${STATUS_CLASS[s] || ''}">${STATUS_LABEL[s] || s}</span>`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function toast(msg) {
  let t = document.querySelector('.app-toast');
  if (!t) { t = document.createElement('div'); t.className = 'app-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2600);
}
