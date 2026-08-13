const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Appointment title is required'],
            trim: true,
            default: 'Assistance Appointment'
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        date: {
            type: Date,
            required: [true, 'Appointment date is required']
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'completed', 'cancelled'],
            default: 'pending'
        },
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        provider: {
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
