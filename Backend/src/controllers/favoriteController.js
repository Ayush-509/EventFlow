import Favorite from "../models/favorite.js";
import Review from "../models/review.js";

export const toggleFavorite = async (
  req,
  res
) => {
  try {
    const { eventId } = req.params;

    const existing =
      await Favorite.findOne({
        user: req.user.id,
        event: eventId,
      });

    if (existing) {
      await Favorite.findByIdAndDelete(
        existing._id
      );

      return res.status(200).json({
        success: true,
        favorited: false,
      });
    }

    await Favorite.create({
      user: req.user.id,
      event: eventId,
    });

    res.status(200).json({
      success: true,
      favorited: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getFavorites = async (
  req,
  res
) => {
  try {
    const favorites =
      await Favorite.find({
        user: req.user.id,
      }).populate(
        "event",
        "title description date location category ticketPrices poster organizer"
      );

    const events = await Promise.all(
      favorites.map(async (fav) => {
        const event =
          fav.event.toObject();

        const reviews =
          await Review.find({
            event: event._id,
          });

        const averageRating =
          reviews.length > 0
            ? reviews.reduce(
                (sum, review) =>
                  sum + review.rating,
                0
              ) / reviews.length
            : 0;

        return {
          ...event,

          averageRating,

          posterUrl: event.poster
            ? `${req.protocol}://${req.get(
                "host"
              )}/uploads/${event.poster}`
            : "",
        };
      })
    );

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch favorites",
    });
  }
};