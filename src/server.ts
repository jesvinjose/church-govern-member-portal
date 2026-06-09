import http from "http";
import "dotenv/config";
import app from "./app";
import prisma from "./config/prisma";
import { initializeSocket } from "./socket/socket";
import { transporter } from "./utils/mail"

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeSocket(server);

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    await transporter.verify();
    console.log("SMTP server connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
    process.exit(1);
  }
}

startServer();