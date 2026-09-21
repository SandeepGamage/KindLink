const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');

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

// Get list of active volunteer profiles (accessible to authenticated elders and admins)
// Accepts date, time, and location query criteria
exports.getVolunteers = async (req, res) => {
    try {
        if (!req.user || !['elderly', 'senior', 'admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only registered elders are authorized to view the volunteer directory.'
            });
        }

        const { date, time, location } = req.query;

        const filter = {
            role: 'volunteer',
            isActive: { $ne: false },
            isVerified: true
        };

        const volunteers = await User.find(filter)
            .select('_id name profileImage bio availability isVerified createdAt')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: volunteers.length,
            data: volunteers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// create appointments / assistance requests
exports.createAppointment = async (req, res) => {
    try {
        const { taskType, title, description, date, preferredTime, location, contactNumber, urgency, provider } = req.body;
        const requesterId = req.user ? (req.user._id || req.user.id) : undefined;
        const requesterName = req.user && req.user.name ? req.user.name : 'Elderly Resident';
        
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

        // Deliver appropriate notifications
        if (provider) {
            // Targeted notification to specifically selected volunteer
            try {
                await Notification.create({
                    title: 'New Assistance Request Assigned',
                    message: `${requesterName} requested your assistance for "${appointment.title || appointment.taskType}" scheduled for ${appointment.preferredTime || 'your requested time'}.`,
                    type: 'INFO',
                    audience: 'volunteer',
                    recipient: provider,
                    sender: requesterName,
                    status: 'sent'
                });
            } catch (notifErr) {
                console.error('Failed to create targeted volunteer notification:', notifErr);
            }
        } else {
            // Broadcast notification to all volunteers
            try {
                await Notification.create({
                    title: 'New Assistance Request Available',
                    message: `A new assistance request for "${appointment.title || appointment.taskType}" in ${appointment.location || 'the community'} is available to accept.`,
                    type: 'INFO',
                    audience: 'volunteer',
                    recipient: null,
                    sender: requesterName,
                    status: 'sent'
                });
            } catch (notifErr) {
                console.error('Failed to create broadcast volunteer notification:', notifErr);
            }
        }

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

        if (req.user) {
            const userId = req.user._id || req.user.id;
            const role = req.user.role;

            if (role === 'volunteer') {
                if (req.query.status === 'pending') {
                    filter.status = 'pending';
                    filter.$or = [
                        { provider: null },
                        { provider: { $exists: false } },
                        { provider: userId }
                    ];
                } else if (req.query.status) {
                    filter.status = req.query.status;
                    filter.provider = userId;
                } else {
                    filter.$or = [
                        { provider: userId },
                        { provider: null, status: 'pending' },
                        { provider: { $exists: false }, status: 'pending' }
                    ];
                }
            } else if (['elderly', 'senior'].includes(role)) {
                filter.requester = userId;
                if (req.query.status) {
                    filter.status = req.query.status;
                }
            } else if (role === 'admin') {
                if (req.query.status) {
                    filter.status = req.query.status;
                }
            } else {
                if (req.query.status) {
                    filter.status = req.query.status;
                }
                filter.$or = [
                    { requester: userId },
                    { provider: userId }
                ];
            }
        } else if (req.query.status) {
            filter.status = req.query.status;
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

        // Enforce provider reservation / preference: if assigned to a specific volunteer, only they can accept
        const volunteerId = req.user ? (req.user._id || req.user.id).toString() : null;
        if (appointment.provider) {
            const assignedProviderId = (appointment.provider._id || appointment.provider).toString();
            if (volunteerId && assignedProviderId !== volunteerId) {
                return res.status(403).json({
                    success: false,
                    message: 'This assistance request was assigned to a specific volunteer and cannot be accepted by another user.'
                });
            }
        }

        appointment.status = 'accepted';
        if (req.user) {
            appointment.provider = req.user._id || req.user.id;
        }
        await appointment.save();

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('requester', 'name email profileImage')
            .populate('provider', 'name email profileImage');

        // Deliver notification to requester
        if (appointment.requester) {
            try {
                const volunteerName = req.user && req.user.name ? req.user.name : 'A volunteer';
                await Notification.create({
                    title: 'Assistance Request Accepted',
                    message: `${volunteerName} has accepted your request for "${appointment.title || appointment.taskType}" scheduled for ${appointment.preferredTime || 'your requested time'}.`,
                    type: 'INFO',
                    audience: 'elder',
                    recipient: appointment.requester,
                    sender: volunteerName,
                    status: 'sent'
                });
            } catch (notifErr) {
                console.error('Failed to create acceptance notification:', notifErr);
            }
        }

        res.status(200).json({
            success: true,
            data: populatedAppointment || appointment,
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

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required to cancel an assistance request'
            });
        }

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Assistance request not found'
            });
        }

        const userId = (req.user._id || req.user.id).toString();
        const isAdmin = req.user.role === 'admin';
        const isRequester = appointment.requester && (
            appointment.requester.toString() === userId ||
            (appointment.requester._id && appointment.requester._id.toString() === userId)
        );
        const isProvider = appointment.provider && (
            appointment.provider.toString() === userId ||
            (appointment.provider._id && appointment.provider._id.toString() === userId)
        );

        if (!isAdmin && !isRequester && !isProvider) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to cancel this assistance request'
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
        appointment.cancelledBy = req.user._id || req.user.id;

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