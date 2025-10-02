






import pool from "../config/db";
import bcrypt from "bcrypt";
import validator from "validator";
import axios from "axios";

type UserRegisterInput = {
  role: string;
  email: string;
  prenom: string;
  nom: string;
  phonenumber?: string;    // pas encore dans la table, à ajouter si besoin
  address?: string;  //  pas encore dans la table, à ajouter si besoin
  size?: string;
  name?: string;
  legal_form?: string;
  siret?: string;
  cp?: string;
  ville?: string;
  rue?: string;
  capital?: number;
};

type VerifyInput = {
  email: string;
  code: string;
};

type CompleteRegistrationInput = {
  email: string;
  passe: string;
};

// Générateur OTP
function genOTP(): string {
  return String(Math.floor(1000 + Math.random() * 9000)); // 4 chiffres
}

// ======================== REGISTER ========================
export async function UserRegister(data: UserRegisterInput) {
  const { email, prenom, role, phonenumber, address, size, legal_form, siret, name, nom, cp, ville, rue, capital } = data;

  // Vérifications de base
  if (!email) {
    const err = new Error("Email obligatoire");
    (err as any).statusCode = 400;
    throw err;
  }
  if (!validator.isEmail(email)) {
    const err = new Error("Email invalide");
    (err as any).statusCode = 422;
    throw err;
  }
  if (!prenom) {
    const err = new Error("Le prénom est obligatoire");
    (err as any).statusCode = 400;
    throw err;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Vérifier si l’email existe déjà
    const [exists] = await conn.query("SELECT id FROM membres WHERE email = ?", [email]);
    if ((exists as any).length > 0) {
      throw new Error("Cet email est déjà utilisé.");
    }

    // Génération OTP
    const otp = genOTP();
    const expiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Mot de passe temporaire haché
    const tempPassword = await bcrypt.hash("__PENDING__", 10);

    // Envoi email OTP
    const response = await axios.post("https://mail.api.elyft.tech/send-email.php", {
  receiver: email,
  sender: "no-reply@elyft.tech",
  subject: "🔑 Vérifiez votre addresse email - Solutravo",
  message: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h2 style="color: #1E3A8A;">Bienvenue sur Solutravo 👷‍♂️</h2>
    <p>Bonjour <strong>${prenom || "cher utilisateur"}</strong>,</p>

    <p>Merci de nous rejoindre sur <strong>Solutravo</strong>, votre partenaire de confiance dans le domaine du BTP.</p>

    <p>Pour <strong>finaliser votre inscription</strong> et sécuriser votre compte, veuillez saisir le code de vérification ci-dessous :</p>

    <div style="text-align: center; margin: 20px 0;">
      <span style="display: inline-block; padding: 15px 30px; font-size: 22px; font-weight: bold; color: #fff; background-color: #F97316; border-radius: 8px;">
        ${otp}
      </span>
    </div>

    <p style="color: #d9534f;"><strong>⚠️ Attention :</strong> ce code est valable pendant <strong>3 minutes</strong>.</p>

    <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.</p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

    <p style="font-size: 12px; color: #777;">
      Merci de faire confiance à <strong>Solutravo</strong> pour vos projets dans le bâtiment et les travaux publics.<br>
      <em>L’équipe Solutravo</em>
    </p>
  </div>
  `
});

    if (response.status !== 201) {
      throw new Error("Erreur lors de l'envoi de l'email");
    }

//     // 1️⃣ Insertion du membre
//     const [resMembre] = await conn.query(
//       `INSERT INTO membres (
//         email, prenom, passe, type, statut,
//         verificationCode, verificationExpiry, ref
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, UUID())`,
//       [
//         email,
//         prenom,
//         tempPassword,
//         "membre",
//         "actif",
//         otp,
//         expiry
//       ]
//     );
//     const membreId = (resMembre as any).insertId;

//     // 2️⃣ Insertion de la société liée (si info fournie)
//     if (siret || name) {
//       await conn.query(
//         `INSERT INTO presocietes (
//           name, size, legal_form, siret, role,
//           address, phonenumber, membre_id
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           name || null,
//           size || null,
//           legal_form || "EI",
//           siret || null,
//           role || "artisan",
//           address || null,
//           phonenumber || null,
//           membreId
//         ]
//       );
//     }

//     await conn.commit();
//     return { email };
//   } catch (err: any) {
//     await conn.rollback();
//     // Gestion spécifique des doublons MySQL
   
//    // Gestion spécifique des doublons MySQL
//   if (err && err.code === "ER_DUP_ENTRY") {
//     const customErr = new Error("Ce SIRET est déjà associé à une société.");
//     (customErr as any).statusCode = 409;
//     throw customErr;
//   }

//   throw err;
//   } finally {
//     conn.release();
//   }
// }

//Insertion du membre
const [resMembre] = await conn.query(
  `INSERT INTO membres (
    email, prenom, nom, passe, type, statut,
    verificationCode, verificationExpiry, ref
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, UUID())`,
  [
    email,
    prenom,
    nom,
    tempPassword,
    "membre",
    "actif",
    otp,
    expiry
  ]
);
const membreId = (resMembre as any).insertId;

// Insertion de la société liée (si info fournie)
let societeId: number | null = null;
if (siret || name) {
  // ✅ 12 colonnes  ⇔  12 valeurs, dans le MÊME ordre
const [resSociete] = await conn.query(
  `INSERT INTO presocietes (
     name, size, legal_form, siret, role,
     cp, ville, rue, capital,
     address, phonenumber, membre_id
   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    name ?? null,
    size ?? null,
    (legal_form ?? 'EI') as any,
    siret ?? null,
    (role ?? 'artisan') as any,

    cp ?? null,          // ← ici seulement le code postal (ex: "84250")
    ville ?? null,       // ← "LE THOR"
    rue ?? null,         // ← "COURS GAMBETTA" (ou ce que tu as)
    capital ?? null,     // ← number ou null

    address ?? null,     // ← adresse complète optionnelle
    phonenumber ?? null,
    membreId
  ]
);

  societeId = (resSociete as any).insertId;

  //  Trouver le plan gratuit par défaut correspondant au rôle
  const [defaultPlan] = await conn.query(
    "SELECT id FROM plans WHERE role = ? AND is_default = TRUE LIMIT 1",
    [role || "artisan"]
  );

  if ((defaultPlan as any).length > 0) {
    const planId = (defaultPlan as any)[0].id;

    //  Créer l'abonnement gratuit
    await conn.query(
      `INSERT INTO subscriptions (
        societe_id, plan_id, status, start_date
      ) VALUES (?, ?, 'active', NOW())`,
      [societeId, planId]
    );
  }
}

await conn.commit();
return { email };
} catch (err: any) {
  await conn.rollback();

  // Gestion spécifique des doublons MySQL
  if (err && err.code === "ER_DUP_ENTRY") {
    const customErr = new Error("Ce SIRET est déjà associé à une société.");
    (customErr as any).statusCode = 409;
    throw customErr;
  }

  throw err;
} finally {
  conn.release();
}
}




// ======================== VERIFY ========================
export async function VerifyCode({ email, code }: VerifyInput) {
  const [rows] = await pool.query("SELECT * FROM membres WHERE email = ?", [email]);
  const user: any = (rows as any)[0];
  if (!user) throw new Error("Utilisateur introuvable");

  if (user.verificationCode !== code) throw new Error("Code invalide");
  if (new Date(user.verificationExpiry) < new Date()) throw new Error("Code expiré");

  await pool.query(
    "UPDATE membres SET isVerified = true, verificationCode = NULL, verificationExpiry = NULL WHERE email = ?",
    [email]
  );
  return { email };
}

// ======================== COMPLETE REGISTRATION ========================
export async function CompleteRegistration({ email, passe }: CompleteRegistrationInput) {
  if (!validator.isStrongPassword(passe, { minLength: 8, minUppercase: 1, minNumbers: 1 })) {
    const err = new Error("Mot de passe trop faible");
    (err as any).statusCode = 422;
    throw err;
  }

  const [rows] = await pool.query("SELECT * FROM membres WHERE email = ?", [email]);
  const user: any = (rows as any)[0];
  if (!user) {
    const err = new Error("Utilisateur introuvable");
    (err as any).statusCode = 404;
    throw err;
  }

  if (!user.isVerified) {
    const err = new Error("Compte non vérifié (OTP manquant)");
    (err as any).statusCode = 410;
    throw err;
  }

  const hashed = await bcrypt.hash(passe, 10);

  await pool.query(
    "UPDATE membres SET passe = ?, date_modification = NOW() WHERE email = ?",
    [hashed, email]
  );

  const [updatedRows] = await pool.query("SELECT id, email, prenom FROM membres WHERE email = ?", [email]);
  return (updatedRows as any)[0];
}

// ======================== RESEND OTP ========================
export async function ResendVerificationCode(email: string) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query("SELECT * FROM membres WHERE email = ?", [email]);
    const user: any = (rows as any)[0];
    if (!user) throw new Error("Utilisateur introuvable");
    if (user.isVerified) throw new Error("Utilisateur déjà vérifié");

    const otp = genOTP();
    const expiry = new Date(Date.now() + 3 * 60 * 1000);

    const response = await axios.post("https://mail.api.elyft.tech/send-email.php", {
      receiver: email,
      sender: "no-reply@elyft.tech",
      subject: "🔄 Nouveau code de vérification - Solutravo",
      message: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #1E3A8A;">Nouveau code de vérification 🔑</h2>
        <p>Bonjour <strong>cher utilisateur</strong>,</p>

        <p>Vous avez demandé un <strong>nouveau code de vérification</strong> pour sécuriser votre inscription.</p>

        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; padding: 15px 30px; font-size: 22px; font-weight: bold; color: #fff; background-color: #F97316; border-radius: 8px;">
            ${otp}
          </span>
        </div>

        <p style="color: #d9534f;"><strong>⚠️ Attention :</strong> ce code est valable pendant <strong>3 minutes</strong>.</p>

        <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #777;">
          Merci de faire confiance à <strong>Solutravo</strong> pour vos projets dans le bâtiment et les travaux publics.<br>
          <em>L’équipe Solutravo</em>
        </p>
      </div>
      `
    });

    if (response.status !== 201) {
      throw new Error("Erreur lors de l'envoi de l'email");
    }

    await conn.query(
      "UPDATE membres SET verificationCode = ?, verificationExpiry = ? WHERE email = ?",
      [otp, expiry, email]
    );

    await conn.commit();
    return { email };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
