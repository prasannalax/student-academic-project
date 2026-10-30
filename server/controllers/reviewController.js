const Review = require('../models/Review');
const Note = require('../models/Note');

// Helper to recalculate Note rating averages
const updateNoteRatingStats = async (noteId) => {
  const stats = await Review.aggregate([
    { $match: { note: noteId } },
    {
      $group: {
        _id: '$note',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Note.findByIdAndUpdate(noteId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await Note.findByIdAndUpdate(noteId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

// @desc    Add or update a rating/review for a note
// @route   POST /api/notes/:id/reviews
// @access  Private (Logged-in user)
const addOrUpdateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const noteId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Check if review already exists
    let review = await Review.findOne({ note: noteId, user: req.user._id });

    if (review) {
      review.rating = Number(rating);
      review.comment = comment ? comment.trim() : '';
      await review.save();
    } else {
      review = await Review.create({
        note: noteId,
        user: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        rating: Number(rating),
        comment: comment ? comment.trim() : '',
      });
    }

    // Recalculate average rating
    await updateNoteRatingStats(note._id);

    const updatedNote = await Note.findById(noteId);

    res.status(200).json({
      success: true,
      message: 'Review recorded successfully',
      data: review,
      averageRating: updatedNote.averageRating,
      totalReviews: updatedNote.totalReviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a note
// @route   GET /api/notes/:id/reviews
// @access  Public / Private
const getNoteReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ note: req.params.id })
      .populate('user', 'name role department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Review author or Admin)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    const noteId = review.note;
    await Review.findByIdAndDelete(review._id);

    await updateNoteRatingStats(noteId);

    res.json({
      success: true,
      message: 'Review removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrUpdateReview, getNoteReviews, deleteReview };
