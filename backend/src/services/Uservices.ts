import pool from "../config/db";
import bcrypt from "bcrypt";
import validator from "validator";
import axios from "axios";

type UserRegisterInput = {
  role: string;
  email: string;
  firstName: string;
  phone: string;
  address: string,
  companyName?: string;
  companySize?: string;
  legalForm?: string;
  siret?: string;
};

type VerifyInput = {
  email: string;
  code: string;
};

type CompleteRegistrationInput = {
  email: string;
  password: string;
};

// function genOTP(): string {
//   return String(Math.floor(100000 + Math.random() * 900000)); // 6 chiffres
// }
function genOTP(): string {
  return String(Math.floor(1000 + Math.random() * 9000)); // 4 chiffres
}

export async function UserRegister(data: UserRegisterInput) {
  const { role, email, firstName,phone,address,companyName, companySize, legalForm, siret } = data;

  if (!role || !email) {
    const err = new Error("Role et email obligatoires");
    (err as any).statusCode = 400;
    throw err;
  }
  if (!validator.isEmail(email)) {
    const err = new Error("Email invalide");
    (err as any).statusCode = 422;
    throw err;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Vérifier si le couple (email + role) existe déjà
    const [exists] = await conn.query(
      "SELECT id FROM users WHERE email = ? AND role = ?",
      [email, role]
    );
    if ((exists as any).length) {
      throw new Error("Ce rôle est déjà associé à cet email.");
    }

    // Gestion de la société
    let companyId: number | null = null;
    if (siret) {
      // Cas : la personne a un SIRET → on cherche la société
      const [rows] = await conn.query("SELECT id FROM companies WHERE siret = ?", [siret]);
      if ((rows as any).length) {
        companyId = (rows as any)[0].id;
      } else {
        // si SIRET n’existe pas → on crée une nouvelle société avec tous les champs
        const [res] = await conn.query(
          "INSERT INTO companies (name, size, legal_form, siret) VALUES (?, ?, ?, ?)",
          [companyName || null, companySize || null, legalForm || null, siret]
        );
        companyId = (res as any).insertId;
      }
    } else {
      // Cas : pas de SIRET → création société sans siret
      if (!companyName) {
        throw new Error("Le nom de la société est requis si pas de SIRET.");
      }
      const [res] = await conn.query(
        "INSERT INTO companies (name, size, legal_form) VALUES (?, ?, ?)",
        [companyName, companySize || null, legalForm || null]
      );
      companyId = (res as any).insertId;
    }


    const otp = genOTP();
    const expiry = new Date(Date.now() + 3 * 60 * 1000);

const response = await axios.post("https://mail.api.elyft.tech/send-email.php", {
  receiver: email,
  sender: "no-reply@elyft.tech",
  subject: "🔑 Vérifiez votre addresse email - Solutravo",
  message: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h2 style="color: #1E3A8A;">Bienvenue sur Solutravo 👷‍♂️</h2>
    <p>Bonjour <strong>${firstName || "cher utilisateur"}</strong>,</p>

    <p>Merci de nous rejoindre sur <strong>Solutravo</strong>, votre partenaire de confiance dans le domaine du BTP.</p>

    <p>Pour <strong>finaliser votre inscription</strong> et sécuriser votre compte, veuillez saisir le code de vérification ci-dessous :</p>

    <div style="text-align: center; margin: 20px 0;">
      <span style="display: inline-block; padding: 15px 30px; font-size: 22px; font-weight: bold; color: #fff; background-color: #F97316; border-radius: 8px;">
        ${otp}
      </span>
    </div>

    <p style="color: #d9534f;"><strong>⚠️ Attention :</strong> ce code est valable pendant <strong>5 minutes</strong>.</p>

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
      `INSERT INTO users (email, firstName,phone,address, role, company_id, verificationCode, verificationExpiry)
       VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
      [email, firstName,phone,address, role, companyId, otp, expiry]
    );

    await conn.commit();
    return { email, otp }; 
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function VerifyCode({ email, code }: VerifyInput) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  const user: any = (rows as any)[0];
  if (!user) throw new Error("Utilisateur introuvable");

  if (user.verificationCode !== code) throw new Error("Code invalide");
  if (new Date(user.verificationExpiry) < new Date()) throw new Error("Code expiré");

  await pool.query(
    "UPDATE users SET isVerified = true, verificationCode = NULL, verificationExpiry = NULL WHERE email = ?",
    [email]
  );
  return { email };
}

// 3) complete registration : stocker le mot de passe haché (après vérif)
export async function CompleteRegistration({ email, password }: CompleteRegistrationInput) {
  if (!validator.isStrongPassword(password, { minLength: 8, minUppercase: 1, minNumbers: 1 })) {
    const err = new Error("Mot de passe trop faible");
    (err as any).statusCode = 422;
    throw err;
  }

  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
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

  const hashed = await bcrypt.hash(password, 10);

  await pool.query(
    "UPDATE users SET password = ?, updatedAt = NOW() WHERE email = ?",
    [hashed, email]
  );

  // 🔑 On relit l’utilisateur mis à jour pour renvoyer son id
  const [updatedRows] = await pool.query("SELECT id, email, firstName FROM users WHERE email = ?", [email]);
  return (updatedRows as any)[0];  // contient bien user.id
}


export async function ResendVerificationCode(email: string) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Vérifier si l’utilisateur existe
    const [rows] = await conn.query("SELECT * FROM users WHERE email = ?", [email]);
    const user: any = (rows as any)[0];
    if (!user) {
      throw new Error("Utilisateur introuvable");
    }
    if (user.isVerified) {
      throw new Error("Utilisateur déjà vérifié");
    }

    // Nouveau OTP + nouvelle date d’expiration
    const otp = genOTP();
    const expiry = new Date(Date.now() + 3 * 60 * 1000);

    // Envoi de l’email
    const response = await axios.post("https://mail.api.elyft.tech/send-email.php", {
      receiver: email,
      sender: "no-reply@elyft.tech",
      subject: "🔄 Nouveau code de vérification - Solutravo",
      message: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #1E3A8A;">Nouveau code de vérification 🔑</h2>
        <p>Bonjour <strong>${user.firstName || "cher utilisateur"}</strong>,</p>

        <p>Vous avez demandé un <strong>nouveau code de vérification</strong> pour sécuriser votre inscription.</p>

        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; padding: 15px 30px; font-size: 22px; font-weight: bold; color: #fff; background-color: #F97316; border-radius: 8px;">
            ${otp}
          </span>
        </div>

        <p style="color: #d9534f;"><strong>⚠️ Attention :</strong> ce code est valable pendant <strong>5 minutes</strong>.</p>

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

    // Mise à jour du code + expiry dans la BDD
    await conn.query(
      "UPDATE users SET verificationCode = ?, verificationExpiry = ? WHERE email = ?",
      [otp, expiry, email]
    );

    await conn.commit();
    return { email}; // ⚠️ en prod ne renvoie pas otp
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}



