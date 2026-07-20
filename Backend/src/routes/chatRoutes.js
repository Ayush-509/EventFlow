import express from "express";
import { startConversation,sendMessage,getMessages,getOrganizerChats } from "../controllers/chatController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

router.post("/start/:eventId", protect, startConversation);
router.post("/send", protect, sendMessage);
router.get("/messages/:conversationId", protect, getMessages);
router.get("/organizer",protect,getOrganizerChats);

export default router;