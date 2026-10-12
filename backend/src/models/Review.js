const mongoose = require('mongoose');

/**
 * Review & Rating Schema
 * 
 * References:
 * - reviewer: Reference to User model (Elderly/Senior/Member who gave the rating)
 * - reviewee: Reference to User model (Volunteer/Helper who received the rating)
 * - request: Reference/ID of the completed Assistance Request
 * 
 * Fields:
 * - rating: Number (1 to 5)
 * - comment: Optional detailed review text
 * - tags: Optional array of compliment tags (e.g., 'Punctual', 'Patient & Kind')
 */
const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer user reference is required']
    },

    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },

    request: {
      type: String,
      required: [true, 'Request reference ID is required'],
      trim: true,
      index: true
    },

    rating: {
      type: Number,
      required: [true, 'Rating value (1-5) is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
      validate: {
        validator: function (val) {
          return Number.isInteger(val) && val >= 1 && val <= 5;
        },
        message: 'Rating must be an integer between 1 and 5'
      }
    },

    comment: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },

    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying reviews by request and reviewer efficiently
reviewSchema.index({ request: 1, reviewer: 1 });
reviewSchema.index({ reviewee: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
