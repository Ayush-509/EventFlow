import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: String,
    location: String,
    date: Date,

    ticketPrices: {
      General: {
        type: Number,
        default: 0,
      },
      VIP: {
        type: Number,
        default: 0,
      },
      Premium: {
        type: Number,
        default: 0,
      },
      Student: {
        type: Number,
        default: 0,
      },
    },

    poster: {
      type: String,
      default: "",
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);