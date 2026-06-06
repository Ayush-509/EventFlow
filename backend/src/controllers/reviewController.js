import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

async function updateEventRating(eventId) {
  const stats = await Review.aggregate([
    {
      $match: {
        event: new mongoose.Types.ObjectId(eventId),
      },
    },
    {
      $group: {
        _id: '$event',
        averageRating: {
          $avg: '$rating',
        },
        totalReviews: {
          $sum: 1,
        },
      },
    },
  ]);

  const averageRating =
    stats.length > 0
      ? Number(stats[0].averageRating.toFixed(1))
      : 0;

  await Event.findByIdAndUpdate(eventId, {
    averageRating,
  });
}

export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid event ID',
      });
    }

    if (!rating) {
      return res.status(400).json({
        message: 'Rating is required',
      });
    }

    const numericRating = Number(rating);

    if (
      Number.isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5',
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
      });
    }

    const attendance =
      await Registration.findOne({
        user: req.user.id,
        event: id,
        status: 'attended',
      });

    if (!attendance) {
      return res.status(403).json({
        message:
          'You must attend the event before reviewing it',
      });
    }

    const existingReview =
      await Review.findOne({
        user: req.user.id,
        event: id,
      });

    if (existingReview) {
      return res.status(400).json({
        message:
          'You have already reviewed this event',
      });
    }

    const review = await Review.create({
      user: req.user.id,
      event: id,
      rating: numericRating,
      comment:
        typeof comment === 'string'
          ? comment.trim()
          : '',
    });

    await updateEventRating(id);

    const populatedReview =
      await Review.findById(review._id)
        .populate('user', 'name')
        .populate('event', 'title');

    res.status(201).json({
      message:
        'Review submitted successfully',
      review: populatedReview,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message:
          'You have already reviewed this event',
      });
    }

    console.error(
      'Review Creation Error:',
      err
    );

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const listReviews = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid event ID',
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
      });
    }

    const reviews = await Review.find({
      event: id,
    })
      .populate('user', 'name')
      .sort({
        createdAt: -1,
      });

    const reviewCount =
      reviews.length;

    const averageRating =
      reviewCount > 0
        ? (
            reviews.reduce(
              (sum, review) =>
                sum + review.rating,
              0
            ) / reviewCount
          ).toFixed(1)
        : 0;

    res.json({
      reviewCount,
      averageRating: Number(
        averageRating
      ),
      reviews,
    });
  } catch (err) {
    console.error(
      'List Reviews Error:',
      err
    );

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

