import express from "express";
import {
  startConversation,
  sendMessage,
  getMessages,
  getOrganizerChats,
  getCustomerChats,
  markMessagesRead,
} from "../controllers/chatController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

router.post("/start", protect, startConversation);
router.post("/send", protect, sendMessage);
router.get("/messages/:conversationId", protect, getMessages);
router.get("/organizer", protect, getOrganizerChats);
router.get("/customer", protect, getCustomerChats);
router.put("/read/:conversationId", protect, markMessagesRead);

export default router;