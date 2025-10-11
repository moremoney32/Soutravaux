import express, { Router } from "express";
import { AnnonceurControllers, FournisseurControllers, UserControllers, UserControllersVerifyCode,completeController, resendCodeController } from "../controllers/UserControllers";
import { SearchCompanies } from "../controllers/CompanyController";
import { createPlan, deletePlan, GetPlansByRole, getSettings, updatePlan, updateSettings } from "../controllers/PlanRoleContollers";
 import { CheckSubscription } from "../controllers/CheckSubscriptionControllers";

const router: Router = express.Router();

router.post("/register", UserControllers);
router.post("/registerAnnonceur",AnnonceurControllers);
router.post("/registerFournisseur", FournisseurControllers);
router.post("/verifyCode", UserControllersVerifyCode);
 router.post("/check_subscription", CheckSubscription);
router.post("/register/complete", completeController);
router.post("/users/resend-code", resendCodeController);
router.get("/entreprises", SearchCompanies);
router.get("/plans", GetPlansByRole);
router.put("/plans/:id", updatePlan);
router.post("/plans", createPlan);
router.delete("/plans/:id", deletePlan);
router.put("/subscription-settings", updateSettings);
router.get("/subscription-settings", getSettings);


export default router;
