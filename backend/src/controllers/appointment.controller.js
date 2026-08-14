const Appointment = require('../models/Appointment');

//create appointments

exports.createAppointment = async (req, res) => {
    try {
        const { title, description, date, provider, requester } = req.body;
        const appointment = await Appointment.create({
            title,
            description,
            date,
            provider,
            requester: req.user.id
        });

        res.status(201).json({
            success: true,
            data: appointment
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

//Get user's appointments

exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            $or: [
                { requester: req.user._id },
                { provider: req.user._id }
            ]
        })
            .populate('requester', 'name email')
            .populate('provider', 'name email')
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

//Get a single appointment

exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('requester', 'name email profileImage')
            .populate('provider', 'name email profileImage');
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


//update appoitments

exports.updateAppointment = async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

//Delete an appointment

exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        await appointment.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Appointment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};