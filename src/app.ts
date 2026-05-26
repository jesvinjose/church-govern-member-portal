import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import familyRoutes from "./modules/family/family.routes";
import memberAuthRoutes from "./modules/member-auth/member-auth.routes";
import announcementRoutes from "./modules/announcements/announcement.routes";
import requestRoutes from "./modules/requests/requests.routes";
import contributionRoutes from "./modules/contributions/contributions.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors());

app.use(express.json());

app.use(cookieParser());

app.use(helmet());

app.use(morgan("dev"));

app.use("/auth", authRoutes);

app.use("/member-auth", memberAuthRoutes);

app.use("/family", familyRoutes);

app.use("/announcements", announcementRoutes);

app.use("/requests", requestRoutes);

app.use("/contributions", contributionRoutes);

app.use("/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Church Govern Backend API Running"
  });
});

app.use(errorMiddleware);

export default app;