const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Appointment = require('./models/Appointment');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user s123@gmail.com or any elderly user
    let user = await User.findOne({ email: 's123@gmail.com' });
    if (!user) {
      user = await User.findOne({ role: { $in: ['elderly', 'senior'] } });
    }

    const sampleRequests = [
      {
        title: 'Weekly Grocery Shopping & Medicines',
        taskType: 'Grocery Shopping',
        description: 'Need help buying fresh vegetables, milk, and picking up prescription at Keells Super.',
        preferredTime: 'Tomorrow, 10:00 AM',
        location: 'Havelock Road, Colombo 05',
        urgency: 'Normal',
        status: 'pending',
        requester: user ? user._id : undefined,
      },
      {
        title: 'Medical Transport to Asiri Hospital',
        taskType: 'Medical Transport',
        description: 'Routine checkup appointment with Dr. Perera. Need accompaniment and assistance.',
        preferredTime: 'Thursday, 2:30 PM',
        location: '123 Baseline Rd, Colombo 08',
        urgency: 'Urgent',
        status: 'pending',
        requester: user ? user._id : undefined,
      },
      {
        title: 'Help with TV Setup & Wi-Fi Router',
        taskType: 'Tech Support',
        description: 'The Smart TV disconnected from home Wi-Fi and needs re-configuration.',
        preferredTime: 'Friday, 4:00 PM',
        location: 'Cinnamon Gardens, Colombo 07',
        urgency: 'Low',
        status: 'pending',
        requester: user ? user._id : undefined,
      },
    ];

    for (const req of sampleRequests) {
      const created = await Appointment.create(req);
      console.log('Created request:', created.title);
    }

    console.log('Successfully seeded pending requests!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding requests:', err);
    process.exit(1);
  }
}

seed();
