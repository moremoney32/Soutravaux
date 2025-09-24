import express, { Router } from "express";
import { UserControllers, UserControllersVerifyCode,completeController, resendCodeController } from "../controllers/UserControllers";
import { SearchCompanies } from "../controllers/CompanyController";
// import { searchCompanies } from "../controllers/CompanyController";
// import { searchCompanies } from "../controllers/companyController";


const router: Router = express.Router();

router.post("/register", UserControllers);
router.post("/verifyCode", UserControllersVerifyCode);
router.post("/register/complete", completeController);
router.post("/users/resend-code", resendCodeController);
router.get("/entreprises", SearchCompanies);

export default router;
