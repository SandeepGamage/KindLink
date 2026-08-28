const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    acceptAppointment,
    declineAppointment,
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointment.controller');
const { protect, optionalProtect } = require('../middleware/auth.middleware');

router.use(optionalProtect);

router.route('/')
    .post(createAppointment)
    .get(getAppointments);

router.route('/:id/accept')
    .put(acceptAppointment);

router.route('/:id/decline')
    .put(declineAppointment);

router.route('/:id')
    .get(getAppointmentById)
    .put(updateAppointment)
    .delete(deleteAppointment);

module.exports = router;
