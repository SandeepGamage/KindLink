const Appointment = require('../models/Appointment');

// create appointments / assistance requests
exports.createAppointment = async (req, res) => {
    try {
        const { taskType, title, description, date, preferredTime, location, contactNumber, urgency, provider } = req.body;
        const requesterId = req.user ? (req.user._id || req.user.id) : undefined;
        
        const appointment = await Appointment.create({
            taskType: taskType || 'Grocery Shopping',
            title: title || 'Assistance Request',
            description: description || '',
            date: date || new Date(),
            preferredTime: preferredTime || 'As soon as possible',
            location: location || 'Home',
            contactNumber: contactNumber || '',
            urgency: urgency || 'Normal',
            provider: provider || null,
            requester: requesterId,
            status: 'pending'
        });

        res.status(201).json({
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

// Get user's appointments or open requests for nearby volunteers
exports.getAppointments = async (req, res) => {
    try {
        const filter = {};

        // If status filter provided in query string (e.g. ?status=pending)
        if (req.query.status) {
            filter.status = req.query.status;
        } else if (req.user) {
            // Filter by current user if logged in and no specific query
            filter.$or = [
                { requester: req.user._id || req.user.id },
                { provider: req.user._id || req.user.id }
            ];
        }

        const appointments = await Appointment.find(filter)
            .populate('requester', 'name email profileImage')
            .populate('provider', 'name email profileImage')
            .sort({ createdAt: -1 });

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

// Accept an appointment / assistance request (Volunteer matching)
exports.acceptAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Assistance request not found'
            });
        }

        if (appointment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot accept request with status '${appointment.status}'`
            });
        }

        appointment.status = 'accepted';
        if (req.user) {
            appointment.provider = req.user._id || req.user.id;
        }
        await appointment.save();

        res.status(200).json({
            success: true,
            data: appointment,
            message: 'Assistance request accepted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get a single appointment
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

// Update appointments
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

// Delete an appointment
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