const mongoose = require('mongoose');
const Review = require('../models/Review');
const User = require('../models/User');

/**
 * @desc    Create or update a rating and review for an assistance request
 * @route   POST /api/reviews
 * @access  Protected (fallback for development if user provided)
 */
const createOrUpdateReview = async (req, res) => {
  try {
    const {
      request,
      rating,
      comment = '',
      tags = [],
      reviewee,
      reviewer: bodyReviewer
    } = req.body;

    // 1. Identify reviewer (from auth token or request body)
    const reviewerId = req.user?._id || bodyReviewer;

    if (!reviewerId) {
      return res.status(400).json({
        success: false,
        message: 'Reviewer identification is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(reviewerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reviewer user ID format'
      });
    }

    // 2. Validate request reference
    if (!request || !request.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Assistance request reference ID is required'
      });
    }

    // 3. Validate rating (1-5)
    const numericRating = Number(rating);
    if (!numericRating || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // 4. Validate reviewee if provided
    let validRevieweeId = undefined;
    if (reviewee) {
      if (mongoose.Types.ObjectId.isValid(reviewee)) {
        validRevieweeId = reviewee;
      }
    }

    // 5. Sanitize tags array
    const sanitizedTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : [];

    const requestRef = request.toString().trim();

    // 6. Check if review already exists for this request + reviewer
    let existingReview = await Review.findOne({
      request: requestRef,
      reviewer: reviewerId
    });

    let review;
    if (existingReview) {
      existingReview.rating = numericRating;
      existingReview.comment = typeof comment === 'string' ? comment.trim() : '';
      existingReview.tags = sanitizedTags;
      if (validRevieweeId) {
        existingReview.reviewee = validRevieweeId;
      }
      review = await existingReview.save();
    } else {
      review = await Review.create({
        reviewer: reviewerId,
        reviewee: validRevieweeId,
        request: requestRef,
        rating: numericRating,
        comment: typeof comment === 'string' ? comment.trim() : '',
        tags: sanitizedTags
      });
    }

    // 7. Populate User references for rich response
    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name email role profileImage')
      .populate('reviewee', 'name email role profileImage');

    return res.status(200).json({
      success: true,
      message: existingReview
        ? 'Rating & review updated successfully'
        : 'Rating & review submitted successfully',
      data: populatedReview
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit rating & review. Please try again.',
      error: error.message
    });
  }
};

/**
 * @desc    Get review for a specific request ID
 * @route   GET /api/reviews/request/:requestId
 * @access  Public / Protected
 */
const getReviewByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!requestId || !requestId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }

    const review = await Review.findOne({ request: requestId.trim() })
      .populate('reviewer', 'name email role profileImage')
      .populate('reviewee', 'name email role profileImage');

    return res.status(200).json({
      success: true,
      data: review || null
    });
  } catch (error) {
    console.error('Error fetching review by request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve review',
      error: error.message
    });
  }
};

/**
 * @desc    Get all reviews with optional filtering
 * @route   GET /api/reviews
 * @access  Public / Protected
 */
const getReviews = async (req, res) => {
  try {
    const { request, reviewer, reviewee, rating } = req.query;
    const filter = {};

    if (request) filter.request = request;
    if (reviewer && mongoose.Types.ObjectId.isValid(reviewer)) filter.reviewer = reviewer;
    if (reviewee && mongoose.Types.ObjectId.isValid(reviewee)) filter.reviewee = reviewee;
    if (rating && !isNaN(Number(rating))) filter.rating = Number(rating);

    const reviews = await Review.find(filter)
      .populate('reviewer', 'name email role profileImage')
      .populate('reviewee', 'name email role profileImage')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews',
      error: error.message
    });
  }
};

/**
 * @desc    Get single review by ID
 * @route   GET /api/reviews/:id
 * @access  Public / Protected
 */
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const review = await Review.findById(id)
      .populate('reviewer', 'name email role profileImage')
      .populate('reviewee', 'name email role profileImage');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching review by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve review',
      error: error.message
    });
  }
};

/**
 * @desc    Get rating statistics (average, breakdown, top tags)
 * @route   GET /api/reviews/stats
 * @access  Public / Protected
 */
const getReviewStats = async (req, res) => {
  try {
    const { reviewee } = req.query;
    const matchFilter = {};

    if (reviewee && mongoose.Types.ObjectId.isValid(reviewee)) {
      matchFilter.reviewee = new mongoose.Types.ObjectId(reviewee);
    }

    const stats = await Review.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);

    if (!stats || stats.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      });
    }

    const raw = stats[0];
    return res.status(200).json({
      success: true,
      data: {
        averageRating: Number(raw.averageRating.toFixed(1)),
        totalReviews: raw.totalReviews,
        distribution: {
          5: raw.star5,
          4: raw.star4,
          3: raw.star3,
          2: raw.star2,
          1: raw.star1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve rating statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Protected
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization: only the author or an admin can delete
    if (
      req.user &&
      req.user.role !== 'admin' &&
      review.reviewer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

module.exports = {
  createOrUpdateReview,
  getReviewByRequest,
  getReviews,
  getReviewById,
  getReviewStats,
  deleteReview
};
