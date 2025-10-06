"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserControllers_1 = require("../controllers/UserControllers");
const CompanyController_1 = require("../controllers/CompanyController");
const PlanRoleContollers_1 = require("../controllers/PlanRoleContollers");
const CheckSubscriptionControllers_1 = require("../controllers/CheckSubscriptionControllers");
const router = express_1.default.Router();
router.post("/register", UserControllers_1.UserControllers);
router.post("/verifyCode", UserControllers_1.UserControllersVerifyCode);
router.post("/check_subscription", CheckSubscriptionControllers_1.CheckSubscription);
router.post("/register/complete", UserControllers_1.completeController);
router.post("/users/resend-code", UserControllers_1.resendCodeController);
router.get("/entreprises", CompanyController_1.SearchCompanies);
//  router.post("/check_subscription", CheckSubscription);
router.get("/plans", PlanRoleContollers_1.GetPlansByRole);
router.put("/plans/:id", PlanRoleContollers_1.updatePlan);
router.post("/plans", PlanRoleContollers_1.createPlan);
router.delete("/plans/:id", PlanRoleContollers_1.deletePlan);
router.put("/subscription-settings", PlanRoleContollers_1.updateSettings);
router.get("/subscription-settings", PlanRoleContollers_1.getSettings);
exports.default = router;
//# sourceMappingURL=router.js.map