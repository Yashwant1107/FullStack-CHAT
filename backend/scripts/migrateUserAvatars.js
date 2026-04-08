import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/userModel.js";
import { generateAvatar, isLegacyAvatar } from "../utils/avatar.js";

dotenv.config();

const migrateUserAvatars = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
    });

    const users = await User.find({}).select("_id username fullName gender profilePhoto");
    const usersToUpdate = users.filter((user) => isLegacyAvatar(user.profilePhoto));

    if (usersToUpdate.length === 0) {
        console.log("No users needed avatar migration.");
        await mongoose.disconnect();
        return;
    }

    const operations = usersToUpdate.map((user) => ({
        updateOne: {
            filter: { _id: user._id },
            update: {
                $set: {
                    profilePhoto: generateAvatar(user.gender),
                },
            },
        },
    }));

    await User.bulkWrite(operations);

    console.log(`Migrated ${usersToUpdate.length} user avatar(s).`);

    usersToUpdate.forEach((user) => {
        console.log(`${user.username} (${user.gender})`);
    });

    await mongoose.disconnect();
};

migrateUserAvatars().catch(async (error) => {
    console.error("Avatar migration failed:", error.message);

    try {
        await mongoose.disconnect();
    } catch {
        // ignore disconnect errors
    }

    process.exit(1);
});
