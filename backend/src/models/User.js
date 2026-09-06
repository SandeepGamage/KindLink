const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      default: ''
    },

    age: {
      type: Number
    },

    mobile: {
      type: String,
      trim: true
    },

    address: {
      type: String,
      trim: true
    },

    emergencyContact: {
      type: String,
      trim: true,
      default: ''
    },

    emergencyContactName: {
      type: String,
      trim: true,
      default: ''
    },

    emergencyContactNumber: {
      type: String,
      trim: true,
      default: ''
    },

    idDocument: {
      type: String,
      default: ''
    },

    availability: {
      type: [String],
      default: []
    },

    dob: {
      type: Date
    },

    profileImage: {
      type: String,
      default: ''
    },

    bio: {
      type: String,
      default: '',
      trim: true
    },

    careNotes: {
      type: String,
      default: '',
      trim: true
    },

    careNeeds: {
      type: [String],
      default: []
    },

    role: {
      type: String,
      enum: ['senior', 'elderly', 'volunteer', 'admin'],
      default: 'elderly'
    },

    verificationCode: {
      type: String,
      default: ''
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Strip password from JSON responses
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;