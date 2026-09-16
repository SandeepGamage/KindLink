const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    acceptAppointment,
    cancelAppointment,
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointment.controller');
const { protect, optionalProtect, volunteerApproved } = require('../middleware/auth.middleware');

router.use(optionalProtect);

router.route('/')
    .post(volunteerApproved, createAppointment)
    .get(getAppointments);

router.route('/:id/accept')
    .put(protect, volunteerApproved, acceptAppointment);

router.route('/:id/cancel')
    .put(protect, cancelAppointment);

router.route('/:id')
    .get(getAppointmentById)
    .put(updateAppointment)
    .delete(deleteAppointment);

module.exports = router;
