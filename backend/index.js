import express from "express"; // method-2
import dotenv from "dotenv";
import http from "http";
import connectDB from "./config/database.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/messageRoutes.js";
import cors from "cors";
import { setupSocket } from "./socket/socket.js";

dotenv.config({});

const app = express();
const server = http.createServer(app);
app.use(cookieParser());
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => !origin || allowedOrigins.includes(origin);

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
};
app.use(cors(corsOptions));
// routes
app.use('/api/v1/user', userRoutes);
// http://localhost:8080/api/v1/user/register

app.use("/api/v1/message", messageRoutes);
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "chat-backend",
  });
});

const startServer = async () => {
  try {
    await connectDB();
    setupSocket(server, {
      origin: allowedOrigins,
      credentials: corsOptions.credentials,
    });
    server.listen(PORT, () => {
      console.log(`Server listen at port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
