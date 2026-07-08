import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import familyRoutes from "./modules/family/family.routes";
import memberAuthRoutes from "./modules/member-auth/member-auth.routes";
import broadcastRoutes from "./modules/broadcast/broadcast.routes";
import requestRoutes from "./modules/requests/requests.routes";
import contributionRoutes from "./modules/contributions/contributions.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors({
  origin: [
    "http://192.168.7.147:4000",
    "http://localhost:4000",
  ],
  credentials: true,
}));

app.use(express.json());

app.use(cookieParser());

app.use(helmet());

app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

app.use("/api/member-auth", memberAuthRoutes);

app.use("/api/family", familyRoutes);

app.use("/api/broadcast", broadcastRoutes);

app.use("/api/requests", requestRoutes);

app.use("/api/contributions", contributionRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Church Govern Backend API Running"
  });
});

app.use(errorMiddleware);

export default app;