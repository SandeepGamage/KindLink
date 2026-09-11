const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function seedVolunteers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const volunteers = [
      {
        name: 'Sarah Fernando',
        email: 'sarah.fernando@kindlink.lk',
        role: 'volunteer',
        isVerified: true,
        isActive: true,
        mobile: '+94 77 123 4567',
        address: 'Colombo 07, Cinnamon Gardens',
        bio: 'Certified First Aider & compassionate companion with 3+ years elderly care experience.',
        availability: ['Mon - Fri Mornings', 'Weekends'],
        age: 26,
      },
      {
        name: 'Kasun Jayawardena',
        email: 'kasun.j@kindlink.lk',
        role: 'volunteer',
        isVerified: true,
        isActive: true,
        mobile: '+94 71 987 6543',
        address: 'Nugegoda, Western Province',
        bio: 'Tech enthusiast & safe driver ready to assist with transport and tech troubleshooting.',
        availability: ['Weekdays After 2 PM', 'Full Day Saturdays'],
        age: 29,
      },
      {
        name: 'Dilini Perera',
        email: 'dilini.perera@kindlink.lk',
        role: 'volunteer',
        isVerified: true,
        isActive: true,
        mobile: '+94 76 555 8921',
        address: 'Dehiwala - Mount Lavinia',
        bio: 'Passionate about meal preparation, gardening, and daily errands for senior residents.',
        availability: ['Everyday 8 AM - 6 PM'],
        age: 24,
      },
      {
        name: 'Amila Bandara',
        email: 'amila.bandara@kindlink.lk',
        role: 'volunteer',
        isVerified: true,
        isActive: true,
        mobile: '+94 70 444 1122',
        address: 'Rajagiriya, Kotte',
        bio: 'Friendly companion for walking, grocery shopping, and reading assistance.',
        availability: ['Mon, Wed, Fri Mornings'],
        age: 31,
      },
    ];

    for (const vol of volunteers) {
      const exists = await User.findOne({ email: vol.email });
      if (!exists) {
        await User.create(vol);
        console.log(`Created volunteer: ${vol.name}`);
      } else {
        console.log(`Volunteer ${vol.name} already exists`);
      }
    }

    console.log('Volunteer seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding volunteers:', err);
    process.exit(1);
  }
}

seedVolunteers();
