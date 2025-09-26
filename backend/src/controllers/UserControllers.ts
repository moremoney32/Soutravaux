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


// export const completeController = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user = await CompleteRegistration(req.body);

//     // ✅ Maintenant user contient { id, email, firstName}
    // const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", {
    //   expiresIn: "1d",
    // });

//     res.cookie("jwt", token, { httpOnly: true, sameSite: "strict" });
//     res.status(200).json({
//       message: "Inscription complétée. Vous pouvez vous connecter.",
//       user, // tu peux même renvoyer le user pour debug
//       token
//     });
//   } catch (err) {
//     next(err);
//   }
// };



export const completeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await CompleteRegistration(req.body);

    // Génération du token
    const token =  jwt.sign({ userId: user.id }, process.env.secretKey as string, { expiresIn: "1d" })

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
