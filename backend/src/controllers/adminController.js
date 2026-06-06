import mongoose from 'mongoose';
import Event from '../models/Event.js';
import User from '../models/User.js';

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

export const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid event ID',
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
      });
    }

    if (event.status === 'approved') {
      return res.status(400).json({
        message: 'Event already approved',
      });
    }

    event.status = 'approved';
    await event.save();

    res.json({
      message: 'Event approved successfully',
      event,
    });
  } catch (err) {
    console.error('Approve Event Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const rejectEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid event ID',
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
      });
    }

    if (event.status === 'rejected') {
      return res.status(400).json({
        message: 'Event already rejected',
      });
    }

    event.status = 'rejected';
    await event.save();

    res.json({
      message: 'Event rejected successfully',
      event,
    });
  } catch (err) {
    console.error('Reject Event Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const listPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: 'pending',
    })
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: events.length,
      events,
    });
  } catch (err) {
    console.error('List Pending Events Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid user ID',
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        message: 'Admin accounts cannot be blocked',
      });
    }

    if (user.isBlocked) {
      return res.status(400).json({
        message: 'User already blocked',
      });
    }

    user.isBlocked = true;
    await user.save();

    res.json({
      message: 'User blocked successfully',
      user,
    });
  } catch (err) {
    console.error('Block User Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid user ID',
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (!user.isBlocked) {
      return res.status(400).json({
        message: 'User is not blocked',
      });
    }

    user.isBlocked = false;
    await user.save();

    res.json({
      message: 'User unblocked successfully',
      user,
    });
  } catch (err) {
    console.error('Unblock User Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};