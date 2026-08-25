const mongoose = require('mongoose');

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
        }
    },
    {
        timestamps: true
    }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
