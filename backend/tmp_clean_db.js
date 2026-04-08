import mongoose from 'mongoose';
import connectDB from './config/database.js';
import { User } from './models/userModel.js';
import { Message } from './models/messageModel.js';
import { Conversation } from './models/conversationModel.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await connectDB();
        const users = await User.find({});
        const validUserIds = users.map(u => u._id.toString());
        
        console.log("Valid users count:", validUserIds.length);

        // Delete messages where sender or receiver is not in the validUserIds
        const messages = await Message.find({});
        let deletedMessageCount = 0;
        for (const msg of messages) {
            if (!validUserIds.includes(msg.sender.toString()) || !validUserIds.includes(msg.receiver.toString())) {
                await Message.deleteOne({ _id: msg._id });
                deletedMessageCount++;
            }
        }
        console.log("Deleted orphaned messages:", deletedMessageCount);

        // Delete conversations where participants are not fully valid
        const conversations = await Conversation.find({});
        let deletedConversationsCount = 0;
        for (const conv of conversations) {
            const hasInvalidParticipant = conv.participants.some(p => !validUserIds.includes(p.toString()));
            if (hasInvalidParticipant) {
                await Conversation.deleteOne({ _id: conv._id });
                deletedConversationsCount++;
            }
        }
        console.log("Deleted orphaned conversations:", deletedConversationsCount);

        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
};
run();
