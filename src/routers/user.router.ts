import { Router } from "express";
import UserController from "../controllers/user.controller";

const router: Router = Router();

router.post("/test", UserController.refreshToken);

export default router;
