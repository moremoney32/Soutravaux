import { Request, Response, NextFunction } from "express";
// import { UserRegister, VerifyCode, UserLogin } from "../controllers/UserControllers";
import jwt from "jsonwebtoken";
import { CompleteRegistration,UserRegister, VerifyCode } from "../services/Uservices";

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

    // ✅ Maintenant user contient { id, email, firstName, lastName }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1d",
    });

    res.cookie("jwt", token, { httpOnly: true, sameSite: "strict" });
    res.status(200).json({
      message: "Inscription complétée. Vous pouvez vous connecter.",
      user, // tu peux même renvoyer le user pour debug
    });
  } catch (err) {
    next(err);
  }
};

