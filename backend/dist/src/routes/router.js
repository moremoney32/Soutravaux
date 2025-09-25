"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserControllers_1 = require("../controllers/UserControllers");
const CompanyController_1 = require("../controllers/CompanyController");
// import { searchCompanies } from "../controllers/CompanyController";
// import { searchCompanies } from "../controllers/companyController";
const router = express_1.default.Router();
router.post("/register", UserControllers_1.UserControllers);
router.post("/verifyCode", UserControllers_1.UserControllersVerifyCode);
router.post("/register/complete", UserControllers_1.completeController);
router.post("/users/resend-code", UserControllers_1.resendCodeController);
router.get("/entreprises", CompanyController_1.SearchCompanies);
exports.default = router;
//# sourceMappingURL=router.js.map