import Registration from "../models/registration.js";
import Event from "../models/event.js";

// Register for event
export const registerEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const alreadyRegistered =
      await Registration.findOne({
        event: eventId,
        user: req.user.id,
      });

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "Already registered",
      });
    }

    const registration =
      await Registration.create({
        event: eventId,
        user: req.user.id,
      });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      registration,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get my registrations
export const getMyRegistrations = async (
  req,
  res
) => {
  try {
    const registrations =
      await Registration.find({
        user: req.user.id,
      }).populate("event");

    res.status(200).json({
      success: true,
      registrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOne({
      event: req.params.eventId,
      user: req.user.id,
    });

    res.json({
      success: true,
      registered: !!registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};