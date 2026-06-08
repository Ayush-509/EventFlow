import Review from "../models/review.js";
import Event from "../models/event.js";

/**
 * Create Review
 */
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const existingReview = await Review.findOne({
      event: eventId,
      user: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this event",
      });
    }

    const review = await Review.create({
      event: eventId,
      user: req.user.id,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Reviews of Event
 */
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      event: req.params.eventId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};