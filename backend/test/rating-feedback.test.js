const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

// Ensure test environment and secrets
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-jwt-secret-key-12345';

// Strictly prevent any real database connection
mongoose.connect = () => {
  throw new Error('Connecting to a real database is strictly forbidden in tests!');
};

const Review = require('../src/models/Review');
const reviewController = require('../src/controllers/review.controller');

// In-memory collections
const reviews = new Map();
const users = new Map();

function populateDoc(doc, popReviewer = false, popReviewee = false) {
  if (!doc) return null;
  const clone = { ...doc };

  if (popReviewer && clone.reviewer) {
    const id = clone.reviewer && clone.reviewer._id ? clone.reviewer._id : clone.reviewer;
    const user = users.get(String(id));
    clone.reviewer = user
      ? { _id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage || '' }
      : { _id: id, name: 'Anonymous Reviewer', email: 'anon@example.com', role: 'elderly' };
  }

  if (popReviewee && clone.reviewee) {
    const id = clone.reviewee && clone.reviewee._id ? clone.reviewee._id : clone.reviewee;
    const user = users.get(String(id));
    clone.reviewee = user
      ? { _id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage || '' }
      : { _id: id, name: 'Anonymous Reviewee', email: 'worker@example.com', role: 'volunteer' };
  }

  return clone;
}

function makeQuery(resolver) {
  let shouldPopulateReviewer = false;
  let shouldPopulateReviewee = false;

  const q = {
    populate: (field) => {
      if (field === 'reviewer') shouldPopulateReviewer = true;
      if (field === 'reviewee') shouldPopulateReviewee = true;
      return q;
    },
    sort: () => q,
    select: () => q,
    then: (resolve, reject) => {
      try {
        const raw = resolver();
        if (!raw) return Promise.resolve(null).then(resolve, reject);

        if (Array.isArray(raw)) {
          const list = raw.map((d) => populateDoc(d, shouldPopulateReviewer, shouldPopulateReviewee));
          return Promise.resolve(list).then(resolve, reject);
        } else {
          const item = populateDoc(raw, shouldPopulateReviewer, shouldPopulateReviewee);
          if (raw.save) {
            item.save = raw.save;
          }
          return Promise.resolve(item).then(resolve, reject);
        }
      } catch (err) {
        return Promise.reject(err).then(resolve, reject);
      }
    }
  };
  return q;
}

// Mock Review methods
Review.create = async (doc) => {
  const _id = new mongoose.Types.ObjectId();
  const created = {
    _id,
    ...doc,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  reviews.set(String(_id), created);
  return created;
};

Review.findById = (id) => {
  return makeQuery(() => {
    return reviews.get(String(id)) || null;
  });
};

Review.findOne = (filter = {}) => {
  return makeQuery(() => {
    for (const r of reviews.values()) {
      let match = true;
      if (filter.request && r.request !== filter.request) match = false;
      if (filter.reviewer && String(r.reviewer) !== String(filter.reviewer)) match = false;
      if (match) {
        return {
          ...r,
          save: async function () {
            reviews.set(String(this._id), {
              ...reviews.get(String(this._id)),
              rating: this.rating,
              comment: this.comment,
              tags: this.tags,
              reviewee: this.reviewee,
              updatedAt: new Date()
            });
            return this;
          }
        };
      }
    }
    return null;
  });
};

Review.find = (filter = {}) => {
  return makeQuery(() => {
    const list = [];
    for (const r of reviews.values()) {
      let match = true;
      if (filter.request && r.request !== filter.request) match = false;
      if (filter.reviewer && String(r.reviewer) !== String(filter.reviewer)) match = false;
      if (filter.reviewee && String(r.reviewee) !== String(filter.reviewee)) match = false;
      if (filter.rating !== undefined && r.rating !== filter.rating) match = false;
      if (match) list.push(r);
    }
    return list;
  });
};

Review.findByIdAndDelete = async (id) => {
  const deleted = reviews.get(String(id));
  reviews.delete(String(id));
  return deleted;
};

Review.aggregate = async (pipeline = []) => {
  const matchStage = pipeline.find((p) => p.$match)?.$match || {};
  let list = Array.from(reviews.values());

  if (matchStage.reviewee) {
    list = list.filter((r) => String(r.reviewee) === String(matchStage.reviewee));
  }

  if (list.length === 0) {
    return [];
  }

  const totalReviews = list.length;
  const sumRating = list.reduce((acc, cur) => acc + cur.rating, 0);
  const averageRating = sumRating / totalReviews;

  const star5 = list.filter((r) => r.rating === 5).length;
  const star4 = list.filter((r) => r.rating === 4).length;
  const star3 = list.filter((r) => r.rating === 3).length;
  const star2 = list.filter((r) => r.rating === 2).length;
  const star1 = list.filter((r) => r.rating === 1).length;

  return [
    {
      _id: null,
      averageRating,
      totalReviews,
      star5,
      star4,
      star3,
      star2,
      star1
    }
  ];
};

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

// -----------------------------------------------------------------------------
// TESTS
// -----------------------------------------------------------------------------

test('Rating & Feedback Test Suite', async (suite) => {
  const reviewerId = new mongoose.Types.ObjectId();
  const revieweeId = new mongoose.Types.ObjectId();
  const otherUserId = new mongoose.Types.ObjectId();
  const adminId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    reviews.clear();
    users.clear();

    users.set(String(reviewerId), {
      _id: reviewerId,
      name: 'Alice Elder',
      email: 'alice@example.com',
      role: 'elderly'
    });

    users.set(String(revieweeId), {
      _id: revieweeId,
      name: 'Bob Volunteer',
      email: 'bob@example.com',
      role: 'volunteer'
    });

    users.set(String(otherUserId), {
      _id: otherUserId,
      name: 'Charlie Bystander',
      email: 'charlie@example.com',
      role: 'elderly'
    });

    users.set(String(adminId), {
      _id: adminId,
      name: 'Super Admin',
      email: 'admin@kindlink.com',
      role: 'admin'
    });
  });

  // ---------------------------------------------------------------------------
  // 1. CREATE AND UPDATE REVIEW (createOrUpdateReview)
  // ---------------------------------------------------------------------------
  await suite.test('createOrUpdateReview input validation and upsert logic', async (t) => {
    await t.test('rejects missing reviewer identity (400)', async () => {
      const res = createMockRes();
      await reviewController.createOrUpdateReview({ body: { request: 'REQ-101', rating: 5 } }, res);
      assert.equal(res.statusCode, 400);
      assert.match(res.body.message, /Reviewer identification is required/i);
    });

    await t.test('rejects invalid reviewer ObjectId format (400)', async () => {
      const res = createMockRes();
      await reviewController.createOrUpdateReview({
        body: { reviewer: 'invalid-hex-id', request: 'REQ-101', rating: 5 }
      }, res);
      assert.equal(res.statusCode, 400);
      assert.match(res.body.message, /Invalid reviewer user ID format/i);
    });

    await t.test('rejects missing request reference ID (400)', async () => {
      const res = createMockRes();
      await reviewController.createOrUpdateReview({
        user: { _id: reviewerId },
        body: { rating: 5 }
      }, res);
      assert.equal(res.statusCode, 400);
      assert.match(res.body.message, /Assistance request reference ID is required/i);
    });

    await t.test('rejects invalid rating: 0, negative, > 5, or decimal numbers (400)', async () => {
      const invalidRatings = [0, -1, 6, 3.5, 'five', null];
      for (const val of invalidRatings) {
        const res = createMockRes();
        await reviewController.createOrUpdateReview({
          user: { _id: reviewerId },
          body: { request: 'REQ-101', rating: val }
        }, res);
        assert.equal(res.statusCode, 400, `Expected rating ${val} to be rejected`);
        assert.match(res.body.message, /between 1 and 5/i);
      }
    });

    await t.test('creates new review successfully and populates reviewer/reviewee details', async () => {
      const res = createMockRes();
      await reviewController.createOrUpdateReview({
        user: { _id: reviewerId },
        body: {
          request: 'REQ-101',
          rating: 5,
          comment: 'Bob was punctual, polite, and very helpful with my groceries!',
          tags: ['Punctual', 'Friendly', 'Patient & Kind', '   '],
          reviewee: String(revieweeId)
        }
      }, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.match(res.body.message, /submitted successfully/i);
      assert.equal(res.body.data.rating, 5);
      assert.equal(res.body.data.comment, 'Bob was punctual, polite, and very helpful with my groceries!');
      assert.deepEqual(res.body.data.tags, ['Punctual', 'Friendly', 'Patient & Kind']);
      assert.equal(res.body.data.reviewer.name, 'Alice Elder');
      assert.equal(res.body.data.reviewee.name, 'Bob Volunteer');
    });

    await t.test('updates existing review when reviewer reviews the same request again (upsert)', async () => {
      // First review: 4 stars
      const res1 = createMockRes();
      await reviewController.createOrUpdateReview({
        user: { _id: reviewerId },
        body: {
          request: 'REQ-202',
          rating: 4,
          comment: 'Good overall',
          tags: ['Helpful'],
          reviewee: String(revieweeId)
        }
      }, res1);
      assert.equal(res1.statusCode, 200);

      // Second review: update to 5 stars
      const res2 = createMockRes();
      await reviewController.createOrUpdateReview({
        user: { _id: reviewerId },
        body: {
          request: 'REQ-202',
          rating: 5,
          comment: 'Actually extraordinary service! Bob came back to fix the lock too.',
          tags: ['Helpful', 'Above & Beyond'],
          reviewee: String(revieweeId)
        }
      }, res2);

      assert.equal(res2.statusCode, 200);
      assert.match(res2.body.message, /updated successfully/i);
      assert.equal(reviews.size, 1); // No duplicate review created
      const stored = Array.from(reviews.values())[0];
      assert.equal(stored.rating, 5);
      assert.match(stored.comment, /extraordinary service/i);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. GET REVIEW BY REQUEST ID
  // ---------------------------------------------------------------------------
  await suite.test('getReviewByRequest endpoint logic', async (t) => {
    await t.test('rejects empty or whitespace requestId parameter (400)', async () => {
      const res = createMockRes();
      await reviewController.getReviewByRequest({ params: { requestId: '   ' } }, res);
      assert.equal(res.statusCode, 400);
      assert.match(res.body.message, /Request ID is required/i);
    });

    await t.test('returns null data when no review exists for request (200)', async () => {
      const res = createMockRes();
      await reviewController.getReviewByRequest({ params: { requestId: 'REQ-NONE' } }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data, null);
    });

    await t.test('returns populated review when matching request is found', async () => {
      await Review.create({
        reviewer: reviewerId,
        reviewee: revieweeId,
        request: 'REQ-303',
        rating: 5,
        comment: 'Splendid companion for walking.',
        tags: ['Punctual']
      });

      const res = createMockRes();
      await reviewController.getReviewByRequest({ params: { requestId: 'REQ-303' } }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.rating, 5);
      assert.equal(res.body.data.reviewer.name, 'Alice Elder');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. GET ALL REVIEWS WITH FILTERING
  // ---------------------------------------------------------------------------
  await suite.test('getReviews listing and multi-field query filters', async (t) => {
    const seedReviews = async () => {
      reviews.clear();
      await Review.create({ reviewer: reviewerId, reviewee: revieweeId, request: 'REQ-A', rating: 5 });
      await Review.create({ reviewer: reviewerId, reviewee: revieweeId, request: 'REQ-B', rating: 4 });
      await Review.create({ reviewer: otherUserId, reviewee: revieweeId, request: 'REQ-C', rating: 3 });
    };

    await t.test('returns all reviews with count when no filter is provided', async () => {
      await seedReviews();
      const res = createMockRes();
      await reviewController.getReviews({ query: {} }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.count, 3);
      assert.equal(res.body.data.length, 3);
    });

    await t.test('filters reviews by rating', async () => {
      await seedReviews();
      const res = createMockRes();
      await reviewController.getReviews({ query: { rating: '5' } }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.count, 1);
      assert.equal(res.body.data[0].request, 'REQ-A');
    });

    await t.test('filters reviews by reviewer ObjectId', async () => {
      await seedReviews();
      const res = createMockRes();
      await reviewController.getReviews({ query: { reviewer: String(otherUserId) } }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.count, 1);
      assert.equal(res.body.data[0].request, 'REQ-C');
    });

    await t.test('filters reviews by request reference', async () => {
      await seedReviews();
      const res = createMockRes();
      await reviewController.getReviews({ query: { request: 'REQ-B' } }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.count, 1);
      assert.equal(res.body.data[0].rating, 4);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. GET REVIEW BY ID
  // ---------------------------------------------------------------------------
  await suite.test('getReviewById retrieval and error cases', async (t) => {
    await t.test('rejects invalid ObjectId string (400)', async () => {
      const res = createMockRes();
      await reviewController.getReviewById({ params: { id: '123-bad-id' } }, res);
      assert.equal(res.statusCode, 400);
      assert.match(res.body.message, /Invalid review ID/i);
    });

    await t.test('returns 404 if review does not exist', async () => {
      const randomId = new mongoose.Types.ObjectId();
      const res = createMockRes();
      await reviewController.getReviewById({ params: { id: String(randomId) } }, res);
      assert.equal(res.statusCode, 404);
      assert.match(res.body.message, /Review not found/i);
    });

    await t.test('returns review data for valid ID', async () => {
      const created = await Review.create({
        reviewer: reviewerId,
        reviewee: revieweeId,
        request: 'REQ-505',
        rating: 5,
        comment: 'Great!'
      });

      const res = createMockRes();
      await reviewController.getReviewById({ params: { id: String(created._id) } }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.rating, 5);
      assert.equal(res.body.data.comment, 'Great!');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. RATING STATISTICS (getReviewStats)
  // ---------------------------------------------------------------------------
  await suite.test('getReviewStats aggregate calculation', async (t) => {
    await t.test('returns 0 average and 0 total reviews when collection is empty', async () => {
      const res = createMockRes();
      await reviewController.getReviewStats({ query: {} }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.averageRating, 0);
      assert.equal(res.body.data.totalReviews, 0);
      assert.deepEqual(res.body.data.distribution, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    });

    await t.test('calculates correct average rating and star breakdown across reviews', async () => {
      await Review.create({ reviewer: reviewerId, reviewee: revieweeId, request: 'R1', rating: 5 });
      await Review.create({ reviewer: reviewerId, reviewee: revieweeId, request: 'R2', rating: 5 });
      await Review.create({ reviewer: reviewerId, reviewee: revieweeId, request: 'R3', rating: 4 });
      await Review.create({ reviewer: reviewerId, reviewee: revieweeId, request: 'R4', rating: 2 });

      // Total = 4, Sum = 5+5+4+2 = 16, Average = 16 / 4 = 4.0
      const res = createMockRes();
      await reviewController.getReviewStats({ query: {} }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.totalReviews, 4);
      assert.equal(res.body.data.averageRating, 4.0);
      assert.equal(res.body.data.distribution[5], 2);
      assert.equal(res.body.data.distribution[4], 1);
      assert.equal(res.body.data.distribution[2], 1);
      assert.equal(res.body.data.distribution[1], 0);
    });

    await t.test('filters stats for a specific reviewee volunteer', async () => {
      const anotherVolunteerId = new mongoose.Types.ObjectId();
      await Review.create({ reviewer: reviewerId, reviewee: revieweeId, request: 'R1', rating: 5 });
      await Review.create({ reviewer: reviewerId, reviewee: anotherVolunteerId, request: 'R2', rating: 1 });

      const res = createMockRes();
      await reviewController.getReviewStats({ query: { reviewee: String(revieweeId) } }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.totalReviews, 1);
      assert.equal(res.body.data.averageRating, 5);
      assert.equal(res.body.data.distribution[5], 1);
      assert.equal(res.body.data.distribution[1], 0);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. DELETE REVIEW
  // ---------------------------------------------------------------------------
  await suite.test('deleteReview authorization and removal', async (t) => {
    await t.test('rejects empty or missing ID parameter (400)', async () => {
      const res = createMockRes();
      await reviewController.deleteReview({ params: { id: '   ' } }, res);
      assert.equal(res.statusCode, 400);
      assert.match(res.body.message, /Review ID or request reference is required/i);
    });

    await t.test('returns 404 if review does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = createMockRes();
      await reviewController.deleteReview({ params: { id: String(fakeId) } }, res);
      assert.equal(res.statusCode, 404);
      assert.match(res.body.message, /Review not found/i);
    });

    await t.test('blocks unauthorized user who is neither author nor admin (403)', async () => {
      const created = await Review.create({
        reviewer: reviewerId,
        reviewee: revieweeId,
        request: 'REQ-DEL-1',
        rating: 5
      });

      const res = createMockRes();
      await reviewController.deleteReview({
        user: { _id: otherUserId, role: 'elderly' },
        params: { id: String(created._id) }
      }, res);

      assert.equal(res.statusCode, 403);
      assert.match(res.body.message, /not authorized to delete/i);
      assert.ok(reviews.has(String(created._id))); // Review was not deleted
    });

    await t.test('author can delete their own review (200)', async () => {
      const created = await Review.create({
        reviewer: reviewerId,
        reviewee: revieweeId,
        request: 'REQ-DEL-2',
        rating: 4
      });

      const res = createMockRes();
      await reviewController.deleteReview({
        user: { _id: reviewerId, role: 'elderly' },
        params: { id: String(created._id) }
      }, res);

      assert.equal(res.statusCode, 200);
      assert.match(res.body.message, /deleted successfully/i);
      assert.equal(reviews.has(String(created._id)), false);
    });

    await t.test('admin can delete any review regardless of author (200)', async () => {
      const created = await Review.create({
        reviewer: reviewerId,
        reviewee: revieweeId,
        request: 'REQ-DEL-3',
        rating: 1
      });

      const res = createMockRes();
      await reviewController.deleteReview({
        user: { _id: adminId, role: 'admin' },
        params: { id: String(created._id) }
      }, res);

      assert.equal(res.statusCode, 200);
      assert.match(res.body.message, /deleted successfully/i);
      assert.equal(reviews.has(String(created._id)), false);
    });
  });
});
