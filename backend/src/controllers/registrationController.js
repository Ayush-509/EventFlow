import mongoose from 'mongoose';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { generateQRCodeDataUrl } from '../utils/qrcode.js';
import { sendEmail } from '../utils/email.js';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

export const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid event ID',
      });
    }

    const event = await Event.findById(id);

    if (!event || event.status !== 'approved') {
      return res.status(400).json({
        message: 'Event not available',
      });
    }

    const existingRegistration =
      await Registration.findOne({
        user: req.user.id,
        event: event._id,
      });

    if (existingRegistration) {
      return res.status(400).json({
        message: 'You are already registered for this event',
      });
    }

    const currentRegistrations =
      await Registration.countDocuments({
        event: event._id,
        status: { $ne: 'cancelled' },
      });

    if (
      event.capacity > 0 &&
      currentRegistrations >= event.capacity
    ) {
      return res.status(400).json({
        message: 'Event capacity has been reached',
      });
    }

    const payload = JSON.stringify({
      userId: req.user.id,
      eventId: event._id,
      at: Date.now(),
    });

    const qrCodeDataUrl =
      await generateQRCodeDataUrl(payload);

    const registration =
      await Registration.create({
        user: req.user.id,
        event: event._id,
        qrCodeDataUrl,
      });

    try {
      const user = await User.findById(req.user.id);

      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: `Registered: ${event.title}`,
          html: `
            <h2>Registration Confirmed</h2>
            <p>You have successfully registered for:</p>
            <p><strong>${event.title}</strong></p>
          `,
        });
      }
    } catch (emailError) {
      console.error(
        'Email sending failed:',
        emailError.message
      );
    }

    res.status(201).json({
      message: 'Registration successful',
      registration,
    });
  } catch (err) {
    console.error('Register Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const myRegistrations = async (req, res) => {
  try {
    const registrations =
      await Registration.find({
        user: req.user.id,
      })
        .populate('event')
        .sort({ createdAt: -1 });

    res.json({
      count: registrations.length,
      registrations,
    });
  } catch (err) {
    console.error('My Registrations Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const participantsForEvent = async (
  req,
  res
) => {
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

    if (
      req.user.role === 'organizer' &&
      String(event.organizer) !==
        String(req.user.id)
    ) {
      return res.status(403).json({
        message:
          'You can only view participants for your own events',
      });
    }

    const participants =
      await Registration.find({
        event: id,
      }).populate('user', 'name email');

    res.json({
      count: participants.length,
      participants,
    });
  } catch (err) {
    console.error(
      'Participants Fetch Error:',
      err
    );

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const checkInParticipant = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(userId)
    ) {
      return res.status(400).json({
        message: 'Invalid ID',
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
      });
    }

    if (
      req.user.role === 'organizer' &&
      String(event.organizer) !==
        String(req.user.id)
    ) {
      return res.status(403).json({
        message:
          'You can only manage your own events',
      });
    }

    const registration =
      await Registration.findOneAndUpdate(
        {
          user: userId,
          event: id,
        },
        {
          status: 'attended',
          checkedInAt: new Date(),
        },
        {
          new: true,
        }
      );

    if (!registration) {
      return res.status(404).json({
        message:
          'Registration record not found',
      });
    }

    res.json({
      message:
        'Participant checked in successfully',
      registration,
    });
  } catch (err) {
    console.error(
      'Check-in Error:',
      err
    );

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const exportParticipantsCsv = async (
  req,
  res
) => {
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

    if (
      req.user.role === 'organizer' &&
      String(event.organizer) !==
        String(req.user.id)
    ) {
      return res.status(403).json({
        message:
          'You can only export your own event data',
      });
    }

    const registrations =
      await Registration.find({
        event: id,
      }).populate(
        'user',
        'name email'
      );

    const rows = registrations.map(
      (registration) => ({
        name:
          registration.user?.name || '',
        email:
          registration.user?.email || '',
        status: registration.status,
        registeredAt:
          registration.createdAt,
      })
    );

    const filePath = path.join(
      process.cwd(),
      `participants-${id}.csv`
    );

    const csvWriter =
      createObjectCsvWriter({
        path: filePath,
        header: [
          {
            id: 'name',
            title: 'Name',
          },
          {
            id: 'email',
            title: 'Email',
          },
          {
            id: 'status',
            title: 'Status',
          },
          {
            id: 'registeredAt',
            title: 'Registered At',
          },
        ],
      });

    await csvWriter.writeRecords(rows);

    res.download(
      filePath,
      `participants-${id}.csv`,
      () => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    );
  } catch (err) {
    console.error(
      'CSV Export Error:',
      err
    );

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};