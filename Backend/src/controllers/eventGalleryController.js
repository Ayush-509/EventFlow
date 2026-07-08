import fs from "fs";
import path from "path";

import EventGallery from "../models/eventGallery.js";
import Event from "../models/event.js";

export const uploadMedia = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Gallery uploads only after event completion
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

      mediaType: req.file.mimetype.startsWith("video")
        ? "video"
        : "image",

      // Save only filename
      mediaUrl: req.file.filename,

      caption: req.body.caption || "",
    });

    const populatedMedia = await EventGallery.findById(media._id).populate(
      "uploadedBy",
      "name email"
    );

    res.status(201).json({
      success: true,
      media: populatedMedia,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEventGallery = async (req, res) => {
  try {
    const gallery = await EventGallery.find({
      event: req.params.eventId,
    })
      .populate("uploadedBy", "name email")
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

export const deleteMedia = async (req, res) => {
  try {
    const media = await EventGallery.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // Only uploader or admin can delete
    if (
      media.uploadedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Delete file from uploads folder
    const filePath = path.join(
      process.cwd(),
      "uploads",
      media.mediaUrl
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete MongoDB record
    await EventGallery.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
