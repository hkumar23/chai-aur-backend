import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Middleware functions are applied using app.use()
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // when request is from some url
app.use(express.static("public"));
app.use(cookieParser()); // Parses cookies attached to the client’s request

// routes import
import userRouter from "../src/routes/user.routes.js";
import commentRouter from "../src/routes/comment.routes.js";
import videoRouter from "../src/routes/video.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/videos", videoRouter);

// https://localhost:8000/api/v1/users/register
export { app };
