const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

const CANCELLATION_REASONS = [
    'Schedule conflict / Need to reschedule',
    'Health or medical situation changed',
    'Found alternative help / Family assisted',
    'No longer need this assistance',
    'Volunteer unavailable or unresponsive',
    'Weather or transportation issue',
    'Personal emergency',
    'Other reason'
];

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

// Cancel an appointment with structured reason prompts
exports.cancelAppointment = async (req, res) => {
    try {
        const { reason, note } = req.body;

        if (!reason || typeof reason !== 'string' || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid cancellation reason'
            });
        }

        const trimmedReason = reason.trim();
        if (!CANCELLATION_REASONS.includes(trimmedReason)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cancellation reason. Please select a valid reason from the provided options.'
            });
        }

        const trimmedNote = (note && typeof note === 'string') ? note.trim() : '';

        if (trimmedReason === 'Other reason' && !trimmedNote) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an explanatory note when selecting "Other reason"'
            });
        }

        if (trimmedNote.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Cancellation note cannot exceed 500 characters'
            });
        }

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Assistance request not found'
            });
        }

        if (appointment.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Assistance request is already cancelled'
            });
        }

        if (appointment.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel an appointment that is already completed'
            });
        }

        if (!['pending', 'accepted'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel an appointment with status '${appointment.status}'`
            });
        }

        appointment.status = 'cancelled';
        appointment.cancellationReason = trimmedReason;
        appointment.cancellationNote = trimmedNote;
        appointment.cancelledAt = new Date();
        if (req.user) {
            appointment.cancelledBy = req.user._id || req.user.id;
        }

        await appointment.save();

        // Deliver notification to assigned volunteer
        if (appointment.provider) {
            try {
                await Notification.create({
                    title: 'Appointment Cancelled',
                    message: `The assistance request "${appointment.title || appointment.taskType}" scheduled for ${appointment.preferredTime || 'your agenda'} has been cancelled. Reason: ${appointment.cancellationReason}.`,
                    type: 'ALERT',
                    audience: 'volunteer',
                    sender: req.user && req.user.name ? req.user.name : 'System',
                    status: 'sent'
                });
            } catch (notifErr) {
                console.error('Failed to create volunteer cancellation notification:', notifErr);
            }
        }

        res.status(200).json({
            success: true,
            data: appointment,
            message: 'Assistance request cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
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