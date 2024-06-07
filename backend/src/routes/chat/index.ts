import { Router } from "express";
import { chatController } from "../../controllers/chat.controller";
import { asyncHandler } from "../../auth/checkAuth";

const router = Router();

router.post("/test", asyncHandler(chatController.testing));

export default router;
