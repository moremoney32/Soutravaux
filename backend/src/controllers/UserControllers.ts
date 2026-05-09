import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { AnnonceurRegister, CompleteRegistration, FournisseurRegister, ResendVerificationCode, SimpleRegister, UserRegister, VerifyCode } from "../services/Uservices";

export const UserControllers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserRegister(req.body);
    res.status(201).json({ message: "Inscription réussie, code envoyé", user });
  } catch (err: any) {
    next(err);
  }
};
export const AnnonceurControllers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const annonceur = await AnnonceurRegister(req.body);
    res.status(201).json({ 
      message: "Inscription annonceur réussie, code envoyé", 
      annonceur 
    });
  } catch (err: any) {
    next(err);
  }
};

export const FournisseurControllers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fournisseur = await FournisseurRegister(req.body);
    res.status(201).json({ 
      message: "Demande de contact fournisseur envoyée avec succès", 
      fournisseur 
    });
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

// 5. Inscription simple (iframe client)
export const SimpleInscriptionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, membreId } = await SimpleRegister(req.body);

    const token = jwt.sign(
      { userId: membreId },
      process.env.secretKey as string,
      { expiresIn: "120d" }
    );

    const redirectUrl = `https://staging.solutravo-compta.fr/connexion-microservice?token=${encodeURIComponent(token)}`;

    const htmlEmail = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:#ffffff;border-radius:14px 14px 0 0;padding:28px 40px;text-align:center;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;border-top:1px solid #e8e8e8;">
              <img src="https://staging.solutravo.zeta-app.fr/logos/solutravo.png" alt="Solutravo" style="height:40px;object-fit:contain;" />
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px 36px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">

              <!-- Icône succès -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;width:60px;height:60px;background:#22c55e;border-radius:50%;line-height:60px;font-size:28px;color:#ffffff;">✓</div>
              </div>

              <h2 style="margin:0 0 24px;text-align:center;font-size:20px;color:#2d2d2d;font-weight:700;">Votre compte Solutravo est créé</h2>

              <!-- Séparateur -->
              <div style="height:1px;background:linear-gradient(to right,transparent,#e0e0e0,transparent);margin:0 0 28px;"></div>

              <!-- Message principal -->
              <p style="margin:0 0 8px;font-size:14px;color:#444;line-height:1.7;">Bonjour,</p>
              <p style="margin:0 0 28px;font-size:14px;color:#444;line-height:1.7;">
                Afin d'accéder à votre espace, merci de confirmer votre compte
              </p>

              <!-- CTA BOUTON -->
              <div style="text-align:center;margin:0 0 28px;">
                <a href="${redirectUrl}"
                   target="_blank"
                   rel="noopener noreferrer"
                   style="display:inline-block;background:linear-gradient(135deg,#E77131 0%,#c45a1a 100%);color:#ffffff;text-decoration:none;padding:15px 44px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(231,113,49,0.4);">
                  Accéder à mon compte
                </a>
              </div>

              <!-- Note sécurité -->
              <div style="background:#fff8f5;border-left:3px solid #E77131;border-radius:4px;padding:12px 16px;">
                <p style="margin:0;font-size:12px;color:#888;line-height:1.6;">
                  Ce lien vous donne accès directement à votre espace Solutravo. Ne le partagez pas.
                  Si vous n'avez pas effectué cette inscription, ignorez simplement ce message.
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      await axios.post("https://auth.solutravo-app.fr/send-email.php", {
        receiver: email,
        sender: "noreply@solutravo-compta.fr",
        subject: "Confirmez votre inscription - Solutravo",
        message: htmlEmail,
      }, {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      });
    } catch (mailErr) {
      console.error("Erreur envoi email de confirmation:", mailErr);
    }

    res.status(201).json({ message: "Inscription réussie, email de confirmation envoyé" });
  } catch (err) {
    next(err);
  }
};




