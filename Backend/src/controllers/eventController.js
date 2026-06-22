import Event from "../models/event.js";
import Review from "../models/review.js";
import Registration from "../models/registration.js";

export const getEvents = async (req, res) => {
  try {
    const { search, category, location, status } = req.query;

    let query = {};

    // Search by title or description
    if (search?.trim()) {
  const keywords = search
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  query.$and = keywords.map((word) => ({
    $or: [
      {
        title: {
          $regex: word,
          $options: "i",
        },
      },
      {
        description: {
          $regex: word,
          $options: "i",
        },
      },
      {
        location: {
          $regex: word,
          $options: "i",
        },
      },
      {
        category: {
          $regex: word,
          $options: "i",
        },
      },
    ],
  }));
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

    const registrations = await Registration.find({
  event: event._id,
});

const remainingTickets = {
  General:
    (event.ticketLimits?.General || 0) -
    registrations.filter(
      (r) => r.ticketType === "General"
    ).length,

  VIP:
    (event.ticketLimits?.VIP || 0) -
    registrations.filter(
      (r) => r.ticketType === "VIP"
    ).length,

  Premium:
    (event.ticketLimits?.Premium || 0) -
    registrations.filter(
      (r) => r.ticketType === "Premium"
    ).length,

  Student:
    (event.ticketLimits?.Student || 0) -
    registrations.filter(
      (r) => r.ticketType === "Student"
    ).length,
};

eventObj.remainingTickets = remainingTickets;

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

    if (req.user.role !== "organizer") {
      return res.status(403).json({
        message: "Only organizers can create events",
      });
    }

    const event = await Event.create({
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      latitude: Number(req.body.latitude),
longitude: Number(req.body.longitude),

      ticketPrices: {
        General: Number(req.body.generalPrice || 0),
        VIP: Number(req.body.vipPrice || 0),
        Premium: Number(req.body.premiumPrice || 0),
        Student: Number(req.body.studentPrice || 0),
      },

      poster: req.file ? req.file.filename : "",

      organizer: req.user.id,
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

//API to update event 
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Only organizer who created the event can edit it
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    // Basic fields
    event.title = req.body.title || event.title;
    event.description =
      req.body.description || event.description;
    event.category =
      req.body.category || event.category;
    event.location =
      req.body.location || event.location;
    event.date = req.body.date || event.date;

    // Ticket prices
    event.ticketPrices = {
      General:
        req.body.generalPrice ??
        event.ticketPrices.General,

      VIP:
        req.body.vipPrice ??
        event.ticketPrices.VIP,

      Premium:
        req.body.premiumPrice ??
        event.ticketPrices.Premium,

      Student:
        req.body.studentPrice ??
        event.ticketPrices.Student,
    };
// Ticket limits
event.ticketLimits = {
  General: Number(req.body.generalLimit) || 0,
  VIP: Number(req.body.vipLimit) || 0,
  Premium: Number(req.body.premiumLimit) || 0,
  Student: Number(req.body.studentLimit) || 0,
};

    // Poster update
    if (req.file) {
      event.poster = req.file.filename;
    }

    const updatedEvent = await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.log(error);

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

export const getOrganizerEvents = async (req, res) => {
  try {
    const { organizerId, eventId } = req.params;

    const events = await Event.find({
      organizer: organizerId,
      _id: { $ne: eventId },
      status: "Approved",
    })
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
      message: error.message,
    });
  }
};

//API to show events to its organizer
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      organizer: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getOrganizerAnalytics = async (req, res) => {
  try {
    const organizerId = req.user.id;

    // All events created by organizer
    const events = await Event.find({
      organizer: organizerId,
    });

    const eventIds = events.map((event) => event._id);

    // All registrations for organizer's events
    const registrations = await Registration.find({
      event: { $in: eventIds },
      status: "registered",
    }).populate("event");

    // Total Events
    const totalEvents = events.length;

    // Total Attendees
    const totalAttendees = registrations.length;

    // Total Tickets Sold
    const totalTicketsSold = registrations.length;

    // Total Revenue
    const totalRevenue = registrations.reduce(
      (sum, reg) => sum + (reg.price || 0),
      0
    );

    // Events By Category
    const eventsByCategoryMap = {};

    events.forEach((event) => {
      const category = event.category || "Other";

      eventsByCategoryMap[category] =
        (eventsByCategoryMap[category] || 0) + 1;
    });

    const eventsByCategory = Object.entries(
      eventsByCategoryMap
    ).map(([category, count]) => ({
      category,
      count,
    }));

    // Tickets By Category
    const ticketsByCategoryMap = {};

    registrations.forEach((reg) => {
      const category =
        reg.event?.category || "Other";

      ticketsByCategoryMap[category] =
        (ticketsByCategoryMap[category] || 0) + 1;
    });

    const ticketsByCategory = Object.entries(
      ticketsByCategoryMap
    ).map(([category, count]) => ({
      category,
      count,
    }));

    // Revenue By Category
    const revenueByCategoryMap = {};

    registrations.forEach((reg) => {
      const category =
        reg.event?.category || "Other";

      revenueByCategoryMap[category] =
        (revenueByCategoryMap[category] || 0) +
        (reg.price || 0);
    });

    const revenueByCategory = Object.entries(
      revenueByCategoryMap
    ).map(([category, revenue]) => ({
      category,
      revenue,
    }));

    res.status(200).json({
      success: true,

      totalEvents,
      totalAttendees,
      totalTicketsSold,
      totalRevenue,

      eventsByCategory,
      ticketsByCategory,
      revenueByCategory,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
