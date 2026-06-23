import EventGallery from "../models/eventGallery.js";
import Event from "../models/event.js";

export const uploadMedia = async (
  req,
  res
) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(
      eventId
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Gallery only for completed events
    if (new Date(event.date) > new Date()) {
      return res.status(400).json({
        success: false,
        message:
          "Gallery uploads are allowed only after event completion",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file",
      });
    }

    const media = await EventGallery.create({
      event: eventId,
      uploadedBy: req.user.id,

      mediaType: req.file.mimetype.startsWith(
        "video"
      )
        ? "video"
        : "image",

      mediaUrl: req.file.filename,
    });

    res.status(201).json({
      success: true,
      media,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEventGallery = async (
  req,
  res
) => {
  try {
    const gallery =
      await EventGallery.find({
        event: req.params.eventId,
      })
        .populate(
          "uploadedBy",
          "name"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      gallery,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
