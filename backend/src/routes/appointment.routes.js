const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    acceptAppointment,
    verifyArrivalPin,
    completeAppointment,
    cancelAppointment,
    updateAppointment,
    deleteAppointment,
    getVolunteers
} = require('../controllers/appointment.controller');
const { protect, optionalProtect, authorize, volunteerApproved } = require('../middleware/auth.middleware');

router.use(optionalProtect);

router.get('/volunteers', protect, authorize('elderly', 'senior', 'admin'), getVolunteers);

router.route('/')
    .post(volunteerApproved, createAppointment)
    .get(getAppointments);

router.route('/:id/accept')
    .put(protect, volunteerApproved, acceptAppointment);

router.route('/:id/verify-pin')
    .put(protect, volunteerApproved, verifyArrivalPin);

router.route('/:id/complete')
    .put(protect, volunteerApproved, completeAppointment);

router.route('/:id/cancel')
    .put(protect, cancelAppointment);

router.route('/:id')
    .get(getAppointmentById)
    .put(updateAppointment)
    .delete(deleteAppointment);

module.exports = router;
