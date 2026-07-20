import Conversation from "../models/Conversation.js";
import Event from "../models/event.js";
import Message from "../models/Message.js";
import { io } from "../../server.js";

export const startConversation = async (req, res) => {
  try {
    const { eventId } = req.params;
    const customerId = req.user.id;

    const event = await Event.findById(eventId);

console.log("Event ID:", eventId);
console.log("Event:", event);
console.log("Organizer:", event?.organizer);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      event: eventId,
      customer: customerId,
      organizer: event.organizer,
    });

    // Create if it doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        event: eventId,
        customer: customerId,
        organizer: event.organizer,
      });
    }

    res.status(200).json({
      success: true,
      conversation,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID and message are required",
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const userId = req.user.id;

    if (
      conversation.customer.toString() !== userId &&
      conversation.organizer.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      text,
    });

    await message.populate("sender", "name email");
    const receiverId =
  conversation.customer.toString() === userId
    ? conversation.organizer.toString()
    : conversation.customer.toString();

io.to(receiverId).emit("receiveMessage", message);

    res.status(201).json({
      success: true,
      message,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const userId = req.user.id;

    if (
      conversation.customer.toString() !== userId &&
      conversation.organizer.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getOrganizerChats = async (req, res) => {
  try {

    const organizerId = req.user.id;
    console.log("Organizer Logged In:", organizerId);
console.log("Found Conversations:", conversations);

    const conversations = await Conversation.find({
      organizer: organizerId,
    })
      .populate("customer", "name email")
      .populate("event", "title")
      .sort({ updatedAt: -1 });

    const chats = await Promise.all(
      conversations.map(async (conversation) => {

        const lastMessage = await Message.findOne({
          conversation: conversation._id,
        }).sort({ createdAt: -1 });

        return {
          conversationId: conversation._id,
          customer: conversation.customer,
          event: conversation.event,
          lastMessage,
        };

      })
    );

    res.status(200).json({
      success: true,
      chats,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};