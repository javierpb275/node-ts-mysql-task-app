import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import TaskController from "../controllers/task.controller";

const router: Router = Router();

router.post("/", auth, TaskController.createTask);
router.get("/:id", auth, TaskController.getTaskById);
router.get("/", auth, TaskController.getTasks);
router.delete("/:id", auth, TaskController.deleteTask);
router.patch("/:id", auth, TaskController.updateTask);

export default router;
