const express = require('express');
const router = express.Router();
const {
  createOrUpdateReview,
  getReviewByRequest,
  getReviews,
  getReviewById,
  getReviewStats,
  deleteReview
} = require('../controllers/review.controller');
const { protect, optionalProtect } = require('../middleware/auth.middleware');

// Public / Protected endpoints
router.post('/', optionalProtect, createOrUpdateReview);
router.get('/', getReviews);
router.get('/stats', getReviewStats);
router.get('/request/:requestId', getReviewByRequest);
router.get('/:id', getReviewById);
router.delete('/:id', protect, deleteReview);

module.exports = router;
