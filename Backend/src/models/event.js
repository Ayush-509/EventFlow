import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    date: {
      type: Date,
      required: true,
    },

    // Ticket Prices
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

    // Ticket Limits
    ticketLimits: {
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

    // Sold Tickets Counter
    ticketsSold: {
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

    // Total revenue generated from this event
    revenue: {
      type: Number,
      default: 0,
    },

    poster: {
      type: String,
      default: "",
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
