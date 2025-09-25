"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendCodeController = exports.completeController = exports.UserControllersVerifyCode = exports.UserControllers = void 0;
// import { UserRegister, VerifyCode, UserLogin } from "../controllers/UserControllers";
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
        // ✅ Maintenant user contient { id, email, firstName}
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", {
            expiresIn: "1d",
        });
        res.cookie("jwt", token, { httpOnly: true, sameSite: "strict" });
        res.status(200).json({
            message: "Inscription complétée. Vous pouvez vous connecter.",
            user, // tu peux même renvoyer le user pour debug
            token
        });
    }
    catch (err) {
        next(err);
    }
};
exports.completeController = completeController;
// 4. 🔄 Renvoi du code OTP
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
// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import {
//   CompleteRegistration,
//   ResendVerificationCode,
//   UserRegister,
//   VerifyCode,
// } from "../services/Uservices";
// // 1. 🆕 Inscription
// export const UserControllers = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user = await UserRegister(req.body);
//     res.status(201).json({ message: "Inscription réussie, code envoyé", user });
//   } catch (err: any) {
//     next(err);
//   }
// };
// // 2. ✅ Vérification du code OTP
// export const UserControllersVerifyCode = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     await VerifyCode(req.body);
//     res.status(200).json({ message: "Code vérifié avec succès" });
//   } catch (err) {
//     next(err);
//   }
// };
// // 3. 🔑 Complétion de l'inscription (ajout du mot de passe + JWT)
// export const completeController = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user = await CompleteRegistration(req.body);
//     // ✅ Maintenant user contient { id, email, prenom, nom }
//     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", {
//       expiresIn: "1d",
//     });
//     res.cookie("jwt", token, { httpOnly: true, sameSite: "strict" });
//     res.status(200).json({
//       message: "Inscription complétée. Vous pouvez vous connecter.",
//       user,
//     });
//   } catch (err) {
//     next(err);
//   }
// };
// // 4. 🔄 Renvoi du code OTP
// export const resendCodeController = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { email } = req.body;
//     const result = await ResendVerificationCode(email);
//     res.status(200).json({ message: "Nouveau code envoyé par email", result });
//   } catch (err) {
//     next(err);
//   }
// };
//# sourceMappingURL=UserControllers.js.map