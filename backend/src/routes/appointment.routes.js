const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    acceptAppointment,
    cancelAppointment,
    updateAppointment,
    deleteAppointment,
    getVolunteers
} = require('../controllers/appointment.controller');
const { protect, optionalProtect, authorize } = require('../middleware/auth.middleware');

router.use(optionalProtect);

router.get('/volunteers', protect, authorize('elderly', 'senior', 'admin'), getVolunteers);

router.route('/')
    .post(createAppointment)
    .get(getAppointments);

router.route('/:id/accept')
    .put(acceptAppointment);

router.route('/:id/cancel')
    .put(protect, cancelAppointment);

router.route('/:id')
    .get(getAppointmentById)
    .put(updateAppointment)
    .delete(deleteAppointment);

module.exports = router;
