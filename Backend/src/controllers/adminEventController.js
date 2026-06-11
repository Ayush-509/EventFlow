import Event from "../models/event.js";

/**
 * GET all Pending events
 */
export const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: "Pending",
    }).populate("organizer", "name email");

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Get Pending Events Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * APPROVE event
 */
export const approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    event.status = "Approved";

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event Approved successfully",
      event,
    });
  } catch (error) {
    console.error("Approve Event Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * REJECT event
 */
export const rejectEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    event.status = "Rejected";

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event Rejected successfully",
      event,
    });
  } catch (error) {
    console.error("Reject Event Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};