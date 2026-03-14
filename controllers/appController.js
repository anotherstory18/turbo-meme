const { readJson, writeJson, nextId } = require('../utils/dataStore');

const departments = ['General OPD', 'Pediatrics', 'ENT', 'Orthopedics', 'Neurology', 'Cardiology'];

function load() {
  return {
    users: readJson('users.json', []),
    patients: readJson('patients.json', []),
    doctors: readJson('doctors.json', []),
    queue: readJson('queues.json', []),
    beds: readJson('beds.json', {}),
    bills: readJson('bills.json', []),
    receipts: readJson('receipts.json', []),
    notes: readJson('notes.json', [])
  };
}

function dashboardStats(data) {
  const todayPatients = data.patients.length;
  const waiting = data.queue.filter((q) => q.status === 'waiting').length;
  const activeDoctors = data.doctors.filter((d) => d.status !== 'Off Duty').length;
  const occupancy = data.beds.totalBeds ? Math.round((data.beds.occupiedBeds / data.beds.totalBeds) * 100) : 0;
  const revenue = data.bills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
  const emergencyCases = data.patients.filter((p) => p.emergency === 'Yes').length;
  return { todayPatients, waiting, activeDoctors, occupancy, revenue, emergencyCases };
}

exports.landing = (req, res) => res.render('pages/landing', { title: 'MediFlow AI' });
exports.login = (req, res) => res.render('pages/login', { title: 'Login', users: load().users, error: null });

exports.loginPost = (req, res) => {
  const { username, password, role } = req.body;
  const user = load().users.find((u) => u.username === username && u.password === password && u.role === role);
  if (!user) return res.render('pages/login', { title: 'Login', users: load().users, error: 'Invalid credentials' });
  const map = { Admin: '/admin', Receptionist: '/receptionist', Doctor: '/doctor' };
  res.redirect(map[role]);
};

exports.admin = (req, res) => {
  const data = load();
  res.render('pages/admin', { title: 'Admin Dashboard', stats: dashboardStats(data), data, departments });
};
exports.receptionist = (req, res) => res.render('pages/receptionist', { title: 'Receptionist Dashboard', stats: dashboardStats(load()) });
exports.doctor = (req, res) => {
  const data = load();
  res.render('pages/doctor', { title: 'Doctor Dashboard', queue: data.queue, notes: data.notes });
};

exports.patientForm = (req, res) => res.render('pages/patient-registration', { title: 'Register Patient', departments });
exports.patientList = (req, res) => {
  const data = load();
  res.render('pages/patient-list', { title: 'Patients', patients: data.patients });
};

exports.registerPatient = (io) => (req, res) => {
  const data = load();
  const patientId = nextId('PAT');
  const departmentToken = req.body.department.slice(0, 3).toUpperCase();
  const token = `${departmentToken}-${String(data.queue.filter((q) => q.department === req.body.department).length + 1).padStart(3, '0')}`;
  const patient = { id: patientId, ...req.body, token, createdAt: new Date().toISOString() };
  data.patients.unshift(patient);
  data.queue.push({ id: nextId('Q'), patientId, name: req.body.fullName, department: req.body.department, token, emergency: req.body.emergency, status: 'waiting', eta: Math.floor(Math.random() * 40) + 10 });
  writeJson('patients.json', data.patients);
  writeJson('queues.json', data.queue);
  io.emit('queue:updated', data.queue);
  res.render('pages/slip', { title: 'OPD Slip', patient });
};

exports.queuePage = (req, res) => res.render('pages/queue', { title: 'Queue Management', queue: load().queue, departments });
exports.live = (req, res) => {
  const data = load();
  res.render('pages/live-dashboard', { title: 'Live Hospital Dashboard', data, stats: dashboardStats(data) });
};

exports.queueNext = (io) => (req, res) => {
  const data = load();
  const next = data.queue.find((q) => q.status === 'waiting');
  if (next) next.status = 'called';
  writeJson('queues.json', data.queue);
  io.emit('queue:updated', data.queue);
  res.redirect('/queue');
};

exports.updateQueueStatus = (io) => (req, res) => {
  const { id, status } = req.body;
  const data = load();
  const item = data.queue.find((q) => q.id === id);
  if (item) item.status = status;
  writeJson('queues.json', data.queue);
  io.emit('queue:updated', data.queue);
  res.json({ ok: true });
};

exports.doctors = (req, res) => res.render('pages/doctors', { title: 'Doctor Availability', doctors: load().doctors });
exports.beds = (req, res) => res.render('pages/beds', { title: 'Bed Availability', beds: load().beds });
exports.updateBeds = (io) => (req, res) => {
  writeJson('beds.json', req.body);
  io.emit('beds:updated', req.body);
  res.redirect('/beds');
};

exports.billing = (req, res) => res.render('pages/billing', { title: 'Billing', patients: load().patients, bills: load().bills });
exports.createBill = (req, res) => {
  const data = load();
  const row = {
    id: nextId('BILL'),
    patientId: req.body.patientId,
    consultation: Number(req.body.consultation || 0),
    medicine: Number(req.body.medicine || 0),
    lab: Number(req.body.lab || 0),
    bed: Number(req.body.bed || 0),
    emergency: Number(req.body.emergency || 0),
    other: Number(req.body.other || 0),
    tax: Number(req.body.tax || 0)
  };
  row.subtotal = row.consultation + row.medicine + row.lab + row.bed + row.emergency + row.other;
  row.grandTotal = row.subtotal + row.tax;
  row.createdAt = new Date().toISOString();
  data.bills.unshift(row);
  writeJson('bills.json', data.bills);
  res.redirect('/billing');
};

exports.receiptPage = (req, res) => res.render('pages/receipt', { title: 'Receipts', receipts: load().receipts, patients: load().patients, bills: load().bills });
exports.createReceipt = (req, res) => {
  const data = load();
  const receipt = { id: nextId('RCPT'), receiptNo: `MFA-${Math.floor(Math.random() * 90000 + 10000)}`, ...req.body, createdAt: new Date().toISOString() };
  data.receipts.unshift(receipt);
  writeJson('receipts.json', data.receipts);
  res.redirect('/receipts');
};

exports.reports = (req, res) => res.render('pages/reports', { title: 'Reports & Analytics', data: load(), departments });
exports.settings = (req, res) => res.render('pages/settings', { title: 'Settings & Demo Data', data: load() });

exports.seed = (req, res) => {
  res.redirect('/settings');
};
