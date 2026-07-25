import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate conversations for the same event/customer pair
conversationSchema.index(
  { event: 1, customer: 1 },
  { unique: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;