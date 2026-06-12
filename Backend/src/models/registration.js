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

    price: {
      type: Number,
      default: 0,
    },

    qrCodeDataUrl: {
      type: String,
      default: "",
    },

    barcodeDataUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Registration",
  registrationSchema
);