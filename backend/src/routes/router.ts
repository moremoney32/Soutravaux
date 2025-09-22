import express, { Router } from "express";
import { UserControllers, UserControllersVerifyCode,completeController } from "../controllers/UserControllers";

const router: Router = express.Router();

router.post("/register", UserControllers);
router.post("/verifyCode", UserControllersVerifyCode);
router.post("/register/complete", completeController);

export default router;
