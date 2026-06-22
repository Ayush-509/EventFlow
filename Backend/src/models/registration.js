import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["registered", "cancelled"],
      default: "registered",
    },

    ticketType: {
      type: String,
      enum: [
        "General",
        "VIP",
        "Premium",
        "Student",
      ],
      default: "General",
    },

    ticketId: {
      type: String,
      unique: true,
    },

    // Amount paid for ticket
    price: {
      type: Number,
      default: 0,
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Paid",
    },

    qrCodeDataUrl: {
      type: String,
      default: "",
    },

    barcodeDataUrl: {
      type: String,
      default: "",
    },

    // Useful for exports/reports
    checkedIn: {
      type: Boolean,
      default: false,
    },

    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Registration",
  registrationSchema
);
