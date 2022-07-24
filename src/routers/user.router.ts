import { Router } from "express";
import UserController from "../controllers/user.controller";
import { auth } from "../middlewares/auth.middleware";

const router: Router = Router();

router.post("/refreshToken", UserController.refreshToken);
router.post("/", UserController.signUp);
router.post("/signin", UserController.signIn);
router.post("/signout", auth, UserController.signOut);
router.get("/me", auth, UserController.getProfile);
//router.delete("/me", auth, UserController.deleteProfile);
router.patch("/me", auth, UserController.updateProfile);

export default router;
