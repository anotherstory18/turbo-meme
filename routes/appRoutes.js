const express = require('express');
const c = require('../controllers/appController');

module.exports = (io) => {
  const router = express.Router();
  router.get('/', c.landing);
  router.get('/login', c.login);
  router.post('/login', c.loginPost);

  router.get('/admin', c.admin);
  router.get('/receptionist', c.receptionist);
  router.get('/doctor', c.doctor);

  router.get('/patients/register', c.patientForm);
  router.post('/patients/register', c.registerPatient(io));
  router.get('/patients', c.patientList);
  router.get('/queue', c.queuePage);
  router.post('/queue/next', c.queueNext(io));
  router.post('/queue/status', c.updateQueueStatus(io));
  router.get('/live', c.live);

  router.get('/doctors', c.doctors);
  router.get('/beds', c.beds);
  router.post('/beds', c.updateBeds(io));

  router.get('/billing', c.billing);
  router.post('/billing', c.createBill);
  router.get('/receipts', c.receiptPage);
  router.post('/receipts', c.createReceipt);

  router.get('/reports', c.reports);
  router.get('/settings', c.settings);
  router.post('/settings/seed', c.seed);

  return router;
};
