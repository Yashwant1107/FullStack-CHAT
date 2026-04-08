import mongoose from 'mongoose';
import connectDB from './config/database.js';
import { User } from './models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await connectDB();
        const users = await User.find({});
        console.log("Users found:", users.map(u => ({ id: u._id, fullName: u.fullName, username: u.username })));
        
        const target = users.filter(u => 
            u.fullName && (u.fullName.includes('TC') || u.fullName.toLowerCase() === 'tc user') || 
            u.username && (u.username.includes('TC') || u.username.toLowerCase() === 'tc user')
        );

        if (target.length > 0) {
            for (const t of target) {
                console.log("Deleting:", t.username);
                await User.deleteOne({ _id: t._id });
            }
            console.log("Deleted.");
        } else {
            console.log("Not found.");
        }
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
};
run();
