import Event from "../models/event.js";
import Review from "../models/review.js";

export const getEvents = async (req, res) => {
  try {
    const { search, category, location, status } = req.query;

    let query = {};

    // Search by title or description
    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Location filter
    if (location) {
      query.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate("organizer", "name email")
      .sort({ createdAt: -1 });

    const eventsWithPoster = await Promise.all(
  events.map(async (event) => {
    const reviews = await Review.find({
      event: event._id,
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / reviews.length
        : 0;

    return {
      ...event.toObject(),
      averageRating,
      posterUrl: event.poster
        ? `${req.protocol}://${req.get("host")}/uploads/${event.poster}`
        : "",
    };
  })
);

    res.status(200).json({
      success: true,
      events: eventsWithPoster,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const reviews = await Review.find({
      event: event._id,
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / reviews.length
        : 0;

    const eventObj = event.toObject();

    eventObj.averageRating = averageRating;

    eventObj.posterUrl = event.poster
      ? `${req.protocol}://${req.get("host")}/uploads/${event.poster}`
      : "";

    res.status(200).json({
      success: true,
      event: eventObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Event
export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      price: Number(req.body.price || 0),

      poster: req.file ? req.file.filename : "",

      organizer: req.user?._id,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    event.title = req.body.title || event.title;
    event.description =
      req.body.description || event.description;
    event.category =
      req.body.category || event.category;
    event.location =
      req.body.location || event.location;
    event.date = req.body.date || event.date;

    if (req.body.price !== undefined) {
      event.price = Number(req.body.price);
    }

    if (req.file) {
      event.poster = req.file.filename;
    }

    await event.save();

    const updatedEvent = {
      ...event.toObject(),
      posterUrl: event.poster
        ? `${req.protocol}://${req.get("host")}/uploads/${event.poster}`
        : "",
    };

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
