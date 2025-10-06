"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendCodeController = exports.completeController = exports.UserControllersVerifyCode = exports.UserControllers = void 0;
// import { UserRegister, VerifyCode, UserLogin } from "../controllers/UserControllers";
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "../../.env" });
const Uservices_1 = require("../services/Uservices");
const UserControllers = async (req, res, next) => {
    try {
        const user = await (0, Uservices_1.UserRegister)(req.body);
        res.status(201).json({ message: "Inscription réussie, code envoyé", user });
    }
    catch (err) {
        next(err);
    }
};
exports.UserControllers = UserControllers;
const UserControllersVerifyCode = async (req, res, next) => {
    try {
        await (0, Uservices_1.VerifyCode)(req.body);
        res.status(200).json({ message: "Code vérifié avec succès" });
    }
    catch (err) {
        next(err);
    }
};
exports.UserControllersVerifyCode = UserControllersVerifyCode;
const completeController = async (req, res, next) => {
    try {
        const user = await (0, Uservices_1.CompleteRegistration)(req.body);
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.secretKey, { expiresIn: "120d" });
        // Cookie + réponse JSON
        res.cookie("jwt", token, { httpOnly: true, sameSite: "strict" });
        res.status(200).json({
            success: true,
            message: "Inscription complétée. Vous pouvez vous connecter.",
            user,
            token,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.completeController = completeController;
// 4.  Renvoi du code OTP
const resendCodeController = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await (0, Uservices_1.ResendVerificationCode)(email);
        res.status(200).json({ message: "Nouveau code envoyé par email", result });
    }
    catch (err) {
        next(err);
    }
};
exports.resendCodeController = resendCodeController;
//# sourceMappingURL=UserControllers.js.map