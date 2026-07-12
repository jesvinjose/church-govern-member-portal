import http from "http";
import "dotenv/config";
import app from "./app";
import prisma from "./config/prisma";
import { initializeSocket } from "./socket/socket";
import { transporter } from "./utils/mail";
import { startRefreshTokenCleanup } from "./cron/refreshTokenCleanup";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeSocket(server);

async function startServer() {

  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error: any) {
    console.error("❌ Database connection failed due to:", error.message);
    // throw error;
  }

  try {
    await transporter.verify();
    console.log("✅ SMTP server connected");
  } catch (error: any) {
    console.error("❌ SMTP authentication failed due to:", error.message);
    // throw error;
  }
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    startRefreshTokenCleanup();
  });
}

startServer();