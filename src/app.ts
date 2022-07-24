import express, { Application } from "express";
import cors from "cors";
import userRouter from "./routers/user.router";
import taskRouter from "./routers/task.router";

const app: Application = express();

//settings
app.set("port", process.env.PORT || 3001);

//middlewares
app.use(cors());
app.use(express.json());

//routes
app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);

export default app;
