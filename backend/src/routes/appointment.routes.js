const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    acceptAppointment,
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointment.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
    .post(createAppointment)
    .get(getAppointments);

router.route('/:id/accept')
    .put(acceptAppointment);

router.route('/:id')
    .get(getAppointmentById)
    .put(updateAppointment)
    .delete(deleteAppointment);

module.exports = router;
