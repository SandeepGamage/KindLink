const mongoose = require('mongoose');

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

const appointmentSchema = new mongoose.Schema(
    {
        taskType: {
            type: String,
            required: [true, 'Task type is required'],
            enum: [
                'Grocery Shopping',
                'Medical Transport',
                'Companionship',
                'Housekeeping & Repairs',
                'Tech Support',
                'Meal Preparation',
                'Pet Care',
                'Gardening & Yard',
                'Bill Payment & Errands',
                'Mobility & Walking',
                'Other'
            ],
            default: 'Grocery Shopping'
        },
        title: {
            type: String,
            required: [true, 'Appointment title is required'],
            trim: true,
            default: 'Assistance Request'
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        date: {
            type: Date,
            default: Date.now
        },
        preferredTime: {
            type: String,
            trim: true,
            default: 'As soon as possible'
        },
        location: {
            type: String,
            trim: true,
            default: 'Home'
        },
        contactNumber: {
            type: String,
            trim: true,
            default: ''
        },
        urgency: {
            type: String,
            enum: ['Normal', 'Urgent', 'Low'],
            default: 'Normal'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'completed', 'cancelled'],
            default: 'pending'
        },
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        cancellationReason: {
            type: String,
            trim: true,
            enum: [...CANCELLATION_REASONS, ''],
            default: ''
        },
        cancellationNote: {
            type: String,
            trim: true,
            maxlength: [500, 'Cancellation note cannot exceed 500 characters'],
            default: ''
        },
        cancelledAt: {
            type: Date
        },
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
