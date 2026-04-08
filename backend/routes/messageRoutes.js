import { sendMessage, getMessages } from "../controllers/messageController.js";
import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/send/:id").post(isAuthenticated, sendMessage);
router.route("/:id").get(isAuthenticated, getMessages);

export default router;
