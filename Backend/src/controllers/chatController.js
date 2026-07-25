import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Event from "../models/event.js";

/*
    Start a conversation between
    Customer <--> Organizer
*/
export const startConversation = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { eventId } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const organizerId = event.organizer;

    let conversation = await Conversation.findOne({
      event: eventId,
      customer: customerId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        event: eventId,
        customer: customerId,
        organizer: organizerId,
      });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
    Send Message
*/
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, message } = req.body;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    let receiverId;

    if (senderId.toString() === conversation.customer.toString()) {
      receiverId = conversation.organizer;
    } else {
      receiverId = conversation.customer;
    }

    const newMessage = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      message,
    });

    conversation.lastMessage = message;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate sender and receiver details
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.status(201).json({
      success: true,
      message: populatedMessage,
      receiverId: receiverId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/*
    Get Messages
*/
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

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
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
    Organizer Conversations
*/
export const getOrganizerChats = async (req, res) => {
  try {
    const organizerId = req.user.id;

    const conversations = await Conversation.find({
      organizer: organizerId,
    })
      .populate("customer", "name email profileImage")
      .populate("event", "title")
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
    Customer Conversations
*/
export const getCustomerChats = async (req, res) => {
  try {
    const customerId = req.user.id;

    const conversations = await Conversation.find({
      customer: customerId,
    })
      .populate("organizer", "name email profileImage")
      .populate("event", "title")
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
    Mark Messages As Read
*/
export const markMessagesRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: req.user.id,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};