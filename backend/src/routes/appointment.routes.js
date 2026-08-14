const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointment.controller');
const { protect } = require('../middleware/auth.middleware');


router.use(protect);

router.route('/')
    .post(createAppointment)
    .get(getAppointments);

router.route('/:id')
    .get(getAppointmentById)
    .put(updateAppointment)
    .delete(deleteAppointment);

module.exports = router;
