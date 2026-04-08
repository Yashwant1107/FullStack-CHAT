import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const buildAuthUser = (user) => ({
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    profilePhoto: user.profilePhoto,
    gender: user.gender,
    createdAt: user.createdAt
});

const buildCookieOptions = () => ({
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production"
});
const generateAvatar = (gender) => {
  if (gender === "male") {
    return `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
  } else {
    return `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 30) + 70}`;
  }
};
export const register = async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;
        const normalizedGender = typeof gender === "string" ? gender.trim().toLowerCase() : "";

        if (!fullName || !username || !password || !normalizedGender) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        if (!["male", "female"].includes(normalizedGender)) {
            return res.status(400).json({ message: "Gender must be male or female" });
        }
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "Username already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const profilePhoto = generateAvatar(normalizedGender);

        const createdUser = await User.create({
            fullName,
            username,
            password: hashedPassword,
            profilePhoto,
            gender: normalizedGender
        });

        const userResponse = buildAuthUser(createdUser);
        const token = jwt.sign({ userId: createdUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        console.log("User registered:", userResponse);

        return res
            .status(201)
            .cookie("token", token, buildCookieOptions())
            .json({
                message: "User registered successfully",
                success: true,
                user: userResponse,
                token
            });
    } catch (error) {
        console.error("Error in register controller:", error.message);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const tokenData = {
            userId: user._id,
        };

        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "1d" });


        const userResponse = buildAuthUser(user);

        return res
            .status(200)
            .cookie("token", token, buildCookieOptions())
            .json({
                message: "Login successful",
                success: true,
                user: userResponse,
                token
            });

    } catch (error) {
        console.error("Error in login controller:", error.message);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
export const logout = (req, res) => {
    try {
        return res.status(200).cookie("token", "", { ...buildCookieOptions(), maxAge: 0 }).json({
            message: "Logged out successfully."
        })
    } catch (error) {
        console.log(error);
    }
}
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            user: buildAuthUser(user)
        });
    } catch (error) {
        console.error("Error in getCurrentUser controller:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
}
export const getOtherUsers = async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const otherUsers = await User.find({ _id: { $ne: currentUserId } }).select("-password");
        return res.status(200).json({ otherUsers });
    } catch (error) {
        console.error("Error in getOtherUsers controller:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
};
