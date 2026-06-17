import Announcement from "../models/Announcement.js";
import Event from "../models/event.js";

//API to create announcement 

export const createAnnouncement = async (
  req,
  res
) => {
  try {
    const { eventId } = req.params;

    const { title, message } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (
      event.organizer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const announcement =
      await Announcement.create({
        event: eventId,
        organizer: req.user.id,
        title,
        message,
      });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//API to get announcement
export const getAnnouncements = async (
  req,
  res
) => {
  try {
    const announcements =
      await Announcement.find({
        event: req.params.eventId,
      })
        .populate("organizer", "name")
        .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//API to delete announcement
export const deleteAnnouncement = async (
  req,
  res
) => {
  try {
    const announcement =
      await Announcement.findById(
        req.params.id
      );

    if (!announcement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    if (
      announcement.organizer.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await announcement.deleteOne();

    res.json({
      message: "Announcement deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};