import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      location,
      capacity,
      tags,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !date ||
      !location
    ) {
      return res.status(400).json({
        message:
          'Title, description, category, date and location are required',
      });
    }

    const posterUrl = req.file
      ? `/uploads/${req.file.filename}`
      : undefined;

    const event = await Event.create({
      title: title.trim(),
      description,
      category,
      date,
      location: location.trim(),
      capacity: Number(capacity) || 0,
      tags: tags || [],
      organizer: req.user.id,
      posterUrl,
    });

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (err) {
    console.error('Create Event Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid event ID',
      });
    }

    const update = { ...req.body };

    if (req.file) {
      update.posterUrl = `/uploads/${req.file.filename}`;
    }

    const filter =
      req.user.role === 'admin'
        ? { _id: id }
        : {
            _id: id,
            organizer: req.user.id,
          };

    const event = await Event.findOneAndUpdate(
      filter,
      update,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!event) {
      return res.status(404).json({
        message:
          req.user.role === 'admin'
            ? 'Event not found'
            : 'Event not found or access denied',
      });
    }

    res.json({
      message: 'Event updated successfully',
      event,
    });
  } catch (err) {
    console.error('Update Event Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid event ID',
      });
    }

    const filter =
      req.user.role === 'admin'
        ? { _id: id }
        : {
            _id: id,
            organizer: req.user.id,
          };

    const event = await Event.findOneAndDelete(filter);

    if (!event) {
      return res.status(404).json({
        message:
          req.user.role === 'admin'
            ? 'Event not found'
            : 'Event not found or access denied',
      });
    }

    // Remove related registrations
    await Registration.deleteMany({
      event: event._id,
    });

    res.json({
      message: 'Event deleted successfully',
    });
  } catch (err) {
    console.error('Delete Event Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const listEvents = async (req, res) => {
  try {
    const {
      q,
      category,
      status,
      organizer,
    } = req.query;

    const filter = {};

    if (q) {
      filter.title = {
        $regex: q,
        $options: 'i',
      };
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    if (
      organizer &&
      isValidObjectId(organizer)
    ) {
      filter.organizer = organizer;
    }

    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    res.json({
      count: events.length,
      events,
    });
  } catch (err) {
    console.error('List Events Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid event ID',
      });
    }

    const event = await Event.findById(id)
      .populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
      });
    }

    const registrations =
      await Registration.countDocuments({
        event: event._id,
        status: {
          $ne: 'cancelled',
        },
      });

    res.json({
      event,
      registrations,
      availableSeats:
        event.capacity > 0
          ? Math.max(
              event.capacity - registrations,
              0
            )
          : null,
    });
  } catch (err) {
    console.error('Get Event Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

