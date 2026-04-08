import mongoose from "mongoose";
import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

const messagePopulation = [
    { path: "sender", select: "fullName username profilePhoto gender" },
    { path: "receiver", select: "fullName username profilePhoto gender" },
];

const getAuthenticatedUserId = (req) => req.user?.userId || req.user?._id || req.user?.id || req.id;

export const sendMessage = async (req, res) => {
    try {
        const receiverId = req.params.id; 
        const senderId = getAuthenticatedUserId(req);
        const { message } = req.body;
        const trimmedMessage = message?.trim();

        if (!senderId || !mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(401).json({ message: "Unauthorized user", success: false });
        }

        if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "A valid receiver id is required", success: false });
        }

        if (!trimmedMessage) {
            return res.status(400).json({ message: "Message is required", success: false });
        }

        let gotConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });
        if (!gotConversation) {
            gotConversation = new Conversation({
                participants: [senderId, receiverId],
            });
        };

        const newMessage = new Message({
            conversationId: gotConversation._id,
            sender: senderId,
            receiver: receiverId,
            content: trimmedMessage,
        });

        if (newMessage) {
            gotConversation.messages.push(newMessage._id);
            await gotConversation.save();
        }
        await newMessage.save();
        await newMessage.populate(messagePopulation);

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(200).json({
            message: "Message sent successfully",
            success: true,
            newMessage
        });
    } catch (error) {
        console.error("Error in sendMessage controller:", error.message);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
export const getMessages = async (req, res) => {
    try {
        const senderId = getAuthenticatedUserId(req);
        const receiverId = req.params.id;

        if (!senderId || !mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(401).json({ message: "Unauthorized user", success: false, messages: [] });
        }

        if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "A valid receiver id is required", success: false, messages: [] });
        }

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        }).populate({
            path: "messages",
            options: { sort: { createdAt: 1 } },
            populate: messagePopulation,
        });

        if (!conversation) {
            return res.status(200).json({ message: "No messages yet", success: true, messages: [] });
        }

        return res.status(200).json({
            message: "Messages retrieved successfully",
            success: true,
            messages: conversation.messages
        });
    }
    catch (error) {
        console.error("Error in getMessages controller:", error.message);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
