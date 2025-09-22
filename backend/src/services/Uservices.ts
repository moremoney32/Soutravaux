import pool from "../config/db";
import bcrypt from "bcrypt";
import validator from "validator";
import axios from "axios";

type UserRegisterInput = {
  role: string;
  email: string;
  firstName: string;
  lastName: string;
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

function genOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 chiffres
}

export async function UserRegister(data: UserRegisterInput) {
  const { role, email, firstName, lastName, companyName, companySize, legalForm, siret } = data;

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

    const [exists] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
    if ((exists as any).length) {
      throw new Error("Cet email existe déjà");
    }

    let companyId: number | null = null;
    if (!siret && companyName) {
      const [res] = await conn.query(
        "INSERT INTO companies (name, size, legal_form) VALUES (?, ?, ?)",
        [companyName, companySize || null, legalForm || null]
      );
      companyId = (res as any).insertId;
    } else if (siret) {
      const [rows] = await conn.query("SELECT id FROM companies WHERE siret = ?", [siret]);
      if ((rows as any).length) {
        companyId = (rows as any)[0].id;
      } else {
        throw new Error("SIRET introuvable");
      }
    }

    const otp = genOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // Appel API PHP pour envoyer le mail
    const response = await axios.post("https://mail.api.elyft.tech/send-email.php", {
      receiver: email,
      sender: "noreply@yahoo.fr",
      subject: "Votre code de vérification",
      message: `Votre code est ${otp}`
    });

    if (response.status !== 201) {
      throw new Error("Erreur lors de l'envoi de l'email");
    }

    await conn.query(
      `INSERT INTO users (email, firstName, lastName, role, company_id, verificationCode, verificationExpiry)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, firstName, lastName, role, companyId, otp, expiry]
    );

    await conn.commit();
    return { email, otp }; // ⚠️ en prod tu ne renvoies pas l’OTP
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
  const [updatedRows] = await pool.query("SELECT id, email, firstName, lastName FROM users WHERE email = ?", [email]);
  return (updatedRows as any)[0];  // contient bien user.id
}


