import mongoose from 'mongoose';
import connectDB from './backend/config/database.js';
import { User } from './backend/models/userModel.js';

const run = async () => {
    await connectDB();
    const users = await User.find({});
    console.log("Users found:", users.map(u => ({ id: u._id, fullName: u.fullName, username: u.username })));
    const target = users.find(u => u.fullName && u.fullName.includes('TC') || u.username && u.username.includes('TC'));
    if (target) {
        console.log("Deleting:", target);
        await User.deleteOne({ _id: target._id });
        console.log("Deleted.");
    } else {
        console.log("Not found.");
    }
    process.exit(0);
};
run();
