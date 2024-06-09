import { Router } from "express";
import { chatController } from "../../controllers/chat.controller";
import { asyncHandler } from "../../auth/checkAuth";

const router = Router();

router.post(
  "/createConversation",
  asyncHandler(chatController.createConversation)
);

router.post(
  "/allConversation/:id",
  asyncHandler(chatController.allConversation)
);

router.post(
  "/getConversationContent/:id",
  asyncHandler(chatController.getConversationContent)
);

router.post("/sendMessage", asyncHandler(chatController.sendMessage));

export default router;
