import Registration from "../models/registration.js";
import Event from "../models/event.js";
import QRCode from "qrcode";
import bwipjs from "bwip-js";

// Register for Event
export const registerEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { ticketType = "General" } = req.body;

    const validTicketTypes = [
      "General",
      "VIP",
      "Premium",
      "Student",
    ];

    if (!validTicketTypes.includes(ticketType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket type",
      });
    }

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

    // Generate Unique Ticket ID
    const ticketId =
      "EVT-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 10000);

    // Get price from event ticket prices
    const price =
      event.ticketPrices?.[ticketType] ?? 0;

    // Generate QR Code
    const qrCodeDataUrl =
      await QRCode.toDataURL(ticketId);

    // Generate Barcode
    const barcodeBuffer =
      await bwipjs.toBuffer({
        bcid: "code128",
        text: ticketId,
        scale: 3,
        height: 10,
        includetext: false,
      });

    const barcodeDataUrl =
      `data:image/png;base64,${barcodeBuffer.toString(
        "base64"
      )}`;

    // Create Registration
    const registration =
      await Registration.create({
        event: eventId,
        user: req.user.id,
        ticketType,
        ticketId,
        price,
        qrCodeDataUrl,
        barcodeDataUrl,
        status: "registered",
      });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      registration,
    });
  } catch (error) {
    console.error("Register Event Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Registrations
export const getMyRegistrations = async (
  req,
  res
) => {
  try {
    const registrations =
      await Registration.find({
        user: req.user.id,
      })
        .populate("event")
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check Registration Status
export const checkRegistration = async (
  req,
  res
) => {
  try {
    const registration =
      await Registration.findOne({
        event: req.params.eventId,
        user: req.user.id,
      });

    res.status(200).json({
      success: true,
      registered: !!registration,
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