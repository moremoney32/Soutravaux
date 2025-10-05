import { Request, Response, NextFunction } from "express";
// import { UserRegister, VerifyCode, UserLogin } from "../controllers/UserControllers";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { CompleteRegistration,ResendVerificationCode,UserRegister, VerifyCode } from "../services/Uservices";

export const UserControllers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserRegister(req.body);
    res.status(201).json({ message: "Inscription réussie, code envoyé", user });
  } catch (err: any) {
    next(err);
  }
};

export const UserControllersVerifyCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await VerifyCode(req.body);
    res.status(200).json({ message: "Code vérifié avec succès" });
  } catch (err) {
    next(err);
  }
};






export const completeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await CompleteRegistration(req.body);
    const token = jwt.sign(
  { userId: user.id },
  process.env.secretKey as string,
  { expiresIn: "120d" } 
);

    // Cookie + réponse JSON
    res.cookie("jwt", token, { httpOnly: true, sameSite: "strict" });

    res.status(200).json({
      success: true,
      message: "Inscription complétée. Vous pouvez vous connecter.",
      user,
      token, 
    });
  } catch (err) {
    next(err);
  }
};


// 4.  Renvoi du code OTP
export const resendCodeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const result = await ResendVerificationCode(email);
    res.status(200).json({ message: "Nouveau code envoyé par email", result });
  } catch (err) {
    next(err);
  }
};




