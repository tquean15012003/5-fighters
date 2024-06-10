import { Router } from "express";
import { ChatController } from "../../controllers/chat.controller";
import { asyncHandler } from "../../auth/checkAuth";

const router = Router();

router.post(
  "/createConversation",
  asyncHandler(ChatController.createConversation)
);

router.post(
  "/allConversation/:id",
  asyncHandler(ChatController.allConversation)
);

router.post(
  "/getConversationContent/:id",
  asyncHandler(ChatController.getConversationContent)
);

router.post("/sendMessage", asyncHandler(ChatController.sendMessage));
router.post("/summaryChat/:id", asyncHandler(ChatController.summaryChat));
router.post("/generateChat/:id", asyncHandler(ChatController.generateChat));

export default router;
