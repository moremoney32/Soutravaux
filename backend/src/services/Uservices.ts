


import pool from "../config/db";
import bcrypt from "bcrypt";
import validator from "validator";
import axios from "axios";


type UserRegisterInput = {
  role: string;
  email: string;
  prenom: string;
  nom: string;
  phonenumber?: string;   
  address?: string;  
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
  return String(Math.floor(1000 + Math.random() * 9000));
}

//REGISTER
export async function UserRegister(data: UserRegisterInput){
  const { email, prenom, role, phonenumber, address, size, legal_form, siret, name, nom, cp, ville, rue, capital } = data;

  if (!email){
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
  /***validation du telephone */
  if (!phonenumber) {
    const err = new Error("Le numéro de téléphone est obligatoire pour recevoir le code par SMS");
    (err as any).statusCode = 400;
    throw err;
  }

  // Nettoyer le numéro de téléphone (enlever espaces, tirets, etc.)
  let cleanPhoneNumber = phonenumber.replace(/[\s\-\(\)\.]/g, '');

  if (!/^(0[1-9]\d{8}|(\+33|0033)[1-9]\d{8})$/.test(cleanPhoneNumber)) {
    const err = new Error("Numéro de téléphone invalide. Format attendu : 0612345678 ou +33612345678");
    (err as any).statusCode = 422;
    throw err;
  }


  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [exists] = await conn.query("SELECT id FROM membres WHERE email = ?", [email]);
    if ((exists as any).length > 0) {
      throw new Error("Cet email est déjà utilisé.");
    }

    // siret déjà utilisé ?
if (siret && siret.trim() !== "") {
  // Vérifier dans les DEUX tables car un SIRET ne peut pas être réutilisé
  const [siretExists]: any = await conn.query(
    `SELECT 'societes' as source, id FROM societes WHERE siret = ? 
     UNION ALL 
     SELECT 'presocietes' as source, id FROM presocietes WHERE siret = ?`,
    [siret, siret]
  );
  
  if (siretExists.length > 0) {
    const err = new Error("Ce SIRET est déjà associé à une société (en attente de validation ou active).");
    (err as any).statusCode = 409;
    throw err;
  }
}

   
    const otp = genOTP();
    const expiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Mot de passe temporaire haché
    const tempPassword = await bcrypt.hash("__PENDING__", 10);

    //Insertion du membre
const [resMembre] = await conn.query(
  `INSERT INTO membres (
    email, prenom, nom, phonenumber, passe, type, statut,
    verificationCode, verificationExpiry, ref
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, UUID())`,
  [
    email,
    prenom,
    nom,
    cleanPhoneNumber,
    tempPassword,
    "membre",
    "actif",
    otp,
    expiry
  ]
);
const membreId = (resMembre as any).insertId;

if (siret || name) {
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
    cp ?? null,         
    ville ?? null,      
    rue ?? null,       
    capital ?? null,  
    address ?? null,     
    cleanPhoneNumber ?? null,
    membreId
  ]
);
console.log(resSociete)

}

await conn.commit();

  //ENVOI DU CODE PAR SMS
    try {
      
      const response = await axios.post(
        "https://integrations-api.solutravo-compta.fr/api/send_sms", 
        {
          phone: [cleanPhoneNumber], 
          code: parseInt(otp),     
          message: `Merci de nous rejoindre sur Solutravo, votre partenaire de confiance dans le domaine du BTP.
Pour finaliser votre inscription et sécuriser votre compte, veuillez saisir le code de vérification envoyé par SMS ci-dessous : ${otp}, attention, il n'est valable que 3 minutes.`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.status === 200 && response.data.success) {
        console.log("SMS envoyé avec succès:", response.data);
      } else {
        console.error("Réponse SMS inattendue:", response.data);
        throw new Error("Le SMS n'a pas pu être envoyé");
      }
      
    } catch (error: any) {
      console.error(" Erreur lors de l'envoi du SMS:", error.response?.data || error.message);
      
      await conn.rollback();
      
      const err = new Error(
        error.response?.data?.message || 
        "Impossible d'envoyer le code de vérification par SMS. Vérifiez le numéro de téléphone."
      );
      (err as any).statusCode = 500;
      throw err;
    }
 return { 
      email,
      message: "Code de vérification envoyé par SMS",
      phone: cleanPhoneNumber.replace(/^(\+33|0033)/, '0') // Afficher format français
    };
} catch (err: any) {
  await conn.rollback();
  if (err.code === "ER_DUP_ENTRY") {
     if (err.sqlMessage.includes("membres.email")) {
      const e = new Error("Cet email est déjà utilisé.");
      (e as any).statusCode = 409;
      throw e;
    }
    if (err.sqlMessage.includes("societes.siret") || err.sqlMessage.includes("presocietes.siret")) {
      const e = new Error("Ce SIRET est déjà associé à une société.");
      (e as any).statusCode = 409;
      throw e;
    }
    if (err.code === "ER_DATA_TOO_LONG") {
    const e = new Error("Une donnée est trop longue pour un champ (ex: code postal trop long).");
    (e as any).statusCode = 400;
    throw e;
  }

  if (err.code === "ER_BAD_NULL_ERROR") {
    const e = new Error("Un champ obligatoire est manquant.");
    (e as any).statusCode = 400;
    throw e;
  }
  }
  throw err;
} finally {
  conn.release();
}
}




// VERIFY 
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
  const updatedUser = (updatedRows as any)[0];

  // ENVOI DE L'EMAIL DE BIENVENUE APRÈS INSCRIPTION COMPLÈTE
  try {
    const response = await axios.post("https://auth.solutravo-app.fr/send-email.php", {
      receiver:"vincent@solutravo.fr",
      sender: "noreply@solutravo-compta.fr",
      subject: `🎉 Bienvenue sur Solutravo !`, 
      message: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #e67131;">Félicitations à ${updatedUser.prenom || "cher utilisateur"} ! 🎉</h2>
        
        <p>Son compte <strong style="color: #e67131;">Solutravo</strong> à été activé avec succès !</p>
      </div>
      `
    });

    if (response.status !== 201) {
      console.warn("Email de bienvenue non envoyé, mais compte créé");
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du mail de bienvenue:", error);
  }

  return updatedUser;
}

function normalizePhoneNumber(phone: string): string {
  // Enlever tous les caractères non-numériques sauf +
  let clean = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Convertir format français vers international
  if (clean.startsWith('0')) {
    clean = clean.replace(/^0/, '+33');
  } else if (clean.startsWith('33')) {
    clean = '+' + clean;
  }
  
  return clean;
}
async function sendOTPSMS(
  phoneNumber: string, 
  otp: string, 
  isResend: boolean = false
): Promise<void> {
  const message = isResend
    ? `Nouveau code de vérification Solutravo : ${otp}. Ce code expire dans 3 minutes.`
    : `Merci de nous rejoindre sur Solutravo, votre partenaire de confiance dans le domaine du BTP. Pour finaliser votre inscription et sécuriser votre compte, veuillez saisir le code de vérification : ${otp}. Attention, il n'est valable que 3 minutes.`;

  console.log(`Envoi SMS vers ${phoneNumber} avec code: ${otp}`);

  try {
    const response = await axios.post(
      "https://integrations-api.solutravo-compta.fr/api/send_sms",
      {
        phone: [phoneNumber],
        code: parseInt(otp),
        message: message
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    // Vérifier la réponse
    if (response.status !== 200) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'SMS non envoyé');
    }

    console.log(`SMS envoyé avec succès:`, response.data);

  } catch (error: any) {
    console.error(' Erreur envoi SMS:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Relancer avec message détaillé
    throw new Error(
      error.response?.data?.message || 
      error.message ||
      'Impossible d\'envoyer le SMS'
    );
  }
}

export async function ResendVerificationCode(email: string){
  // Validation email
  if (!email || !validator.isEmail(email)) {
    const err = new Error("Email invalide");
    (err as any).statusCode = 400;
    throw err;
  }

  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `SELECT id, email, prenom, nom, statut, verificationCode, verificationExpiry 
       FROM membres 
       WHERE email = ?`,
      [email]
    );

    const user: any = (rows as any)[0];
    
    if (!user) {
      await conn.rollback();
      const err = new Error("Utilisateur introuvable");
      (err as any).statusCode = 404;
      throw err;
    }

    if (!user.verificationCode) {
      await conn.rollback();
      const err = new Error("Compte déjà vérifié. Vous pouvez vous connecter.");
      (err as any).statusCode = 400;
      throw err;
    }
    const [societeRows] = await conn.query(
      "SELECT phonenumber FROM presocietes WHERE membre_id = ?",
      [user.id]
    );

    const societe: any = (societeRows as any)[0];
    
    if (!societe || !societe.phonenumber) {
      await conn.rollback();
      const err = new Error("Aucun numéro de téléphone associé à ce compte");
      (err as any).statusCode = 400;
      throw err;
    }

    const cleanPhoneNumber = normalizePhoneNumber(societe.phonenumber);

    // Validation format international
    if (!/^\+33[1-9]\d{8}$/.test(cleanPhoneNumber)) {
      await conn.rollback();
      const err = new Error(`Format de téléphone invalide: ${cleanPhoneNumber}`);
      (err as any).statusCode = 400;
      throw err;
    }

    const otp = genOTP();
    const expiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    console.log(`Renvoi code pour ${email}:`, {
      phone: cleanPhoneNumber,
      otp: otp,
      expiry: expiry
    });

    const [updateResult] = await conn.query(
      `UPDATE membres 
       SET verificationCode = ?, verificationExpiry = ? 
       WHERE email = ?`,
      [otp, expiry, email]
    );

    if ((updateResult as any).affectedRows === 0) {
      await conn.rollback();
      const err = new Error("Impossible de mettre à jour le code");
      (err as any).statusCode = 500;
      throw err;
    }

    await conn.commit();
    console.log('Code mis à jour en BD');

    try {
      await sendOTPSMS(cleanPhoneNumber, otp, true);
    } catch (smsError: any) {
      console.error('SMS non envoyé mais code enregistré:', smsError.message);
      
      const err = new Error(
        `Code généré mais SMS non envoyé: ${smsError.message}. Réessayez dans quelques instants.`
      );
      (err as any).statusCode = 500;
      throw err;
    }

    const displayPhone = cleanPhoneNumber.replace(/^\+33/, '0');
    const maskedPhone = displayPhone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 ** ** ** $5');

    return {
      email,
      message: "Code de vérification renvoyé par SMS",
      phone: maskedPhone
    };

  } catch (err: any) {
    try {
      await conn.rollback();
    } catch (rollbackErr) {
    }
    if (err.statusCode) {
      throw err;
    }
    
    const error = new Error(err.message || "Erreur lors du renvoi du code");
    (error as any).statusCode = err.statusCode || 500;
    throw error;
    
  } finally {
    conn.release();
  }
}
/*****userAnnonceur **/

export async function AnnonceurRegister(data: AnnonceurRegisterInput) {
  const { 
    emailAnnonceur, 
    firstNameAnnonceur, 
    lastNameAnnonceur, 
    role, 
    phoneAnnonceur, 
    headquartersAnnonceur, 
    activityAnnonceur, 
    companyNameAnnonceur, 
    howDidYouKnowAnnonceur, 
    siretAnnonceur,
    // Colonnes supplémentaires existantes (optionnelles)
    size,
    legal_form, 
    cp,
    ville,
    rue,
    capital
  } = data;
  console.log(data)

  // Validation des champs obligatoires
  if (!emailAnnonceur) {
    const err = new Error("Email obligatoire");
    (err as any).statusCode = 400;
    throw err;
  }
  if (!validator.isEmail(emailAnnonceur)) {
    const err = new Error("Email invalide");
    (err as any).statusCode = 422;
    throw err;
  }

  if (!firstNameAnnonceur) {
    const err = new Error("Le prénom est obligatoire");
    (err as any).statusCode = 400;
    throw err;
  }

  if (!companyNameAnnonceur) {
    const err = new Error("La raison sociale est obligatoire");
    (err as any).statusCode = 400;
    throw err;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Vérifier si l'email existe déjà
    const [exists] = await conn.query("SELECT id FROM membres WHERE email = ?", [emailAnnonceur]);
    if ((exists as any).length > 0) {
      throw new Error("Cet email est déjà utilisé.");
    }
    if (siretAnnonceur && siretAnnonceur.trim() !== "") {
  // Vérifier dans les DEUX tables car un SIRET ne peut pas être réutilisé
  const [siretExists]: any = await conn.query(
    `SELECT 'societes' as source, id FROM societes WHERE siret = ? 
     UNION ALL 
     SELECT 'presocietes' as source, id FROM presocietes WHERE siret = ?`,
    [siretAnnonceur,siretAnnonceur]
  );
  
  if (siretExists.length > 0){
    const err = new Error("Ce SIRET est déjà associé à une société (en attente de validation ou active).");
    (err as any).statusCode = 409;
    throw err;
  }
}


    // Génération OTP
    const otp = genOTP();
    const expiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Mot de passe temporaire haché
    const tempPassword = await bcrypt.hash("__PENDING__", 10);

    // Insertion dans la table MEMBRES
    const [resMembre] = await conn.query(
      `INSERT INTO membres (
        email, prenom, nom, passe, type, statut,
        verificationCode, verificationExpiry, ref
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, UUID())`,
      [
        emailAnnonceur,
        firstNameAnnonceur,
        lastNameAnnonceur,
        tempPassword,
        "membre",
        "actif",
        otp,
        expiry
      ]
    );
    const membreId = (resMembre as any).insertId;

    // Insertion dans PRESOCIETES avec TOUTES les colonnes existantes + nouvelles
    const [resSociete] = await conn.query(
      `INSERT INTO presocietes (
        name, size, legal_form, siret, role,
        cp, ville, rue, capital,
        address, phonenumber, 
        activity, how_did_you_know,  -- Nouvelles colonnes
        membre_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyNameAnnonceur,
        size ?? null,
        (legal_form ?? 'SARL') as any,  // SARL par défaut pour annonceurs
        siretAnnonceur ?? null,
        (role ?? 'annonceur') as any,
        cp ?? null,
        ville ?? null,
        rue ?? null,
        capital ?? null,
        headquartersAnnonceur ?? null,  // address = headquartersAnnonceur
        phoneAnnonceur ?? null,
        activityAnnonceur ?? null,      // Nouvelle colonne
        howDidYouKnowAnnonceur ?? null, // Nouvelle colonne
        membreId
      ]
    );
    console.log(resSociete);

    await conn.commit();

    // Envoi email OTP
    try {
      const response = await axios.post("https://mail.api.elyft.tech/send-email.php", {
        receiver: emailAnnonceur,
         sender: "noreply@solutravo-compta.fr",
        subject: "🔑 Vérifiez votre Adresse email - Solutravo",
        message: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #1E3A8A;">Bienvenue sur Solutravo 📢</h2>
          <p>Bonjour <strong>${firstNameAnnonceur || "cher annonceur"}</strong>,</p>

          <p>Merci de nous rejoindre sur <strong>Solutravo</strong>, votre plateforme de référence pour toucher les professionnels du BTP.</p>

          <p>Pour <strong>finaliser votre inscription</strong> et sécuriser votre compte annonceur, veuillez saisir le code de vérification ci-dessous :</p>

          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; padding: 15px 30px; font-size: 22px; font-weight: bold; color: #fff; background-color: #F97316; border-radius: 8px;">
              ${otp}
            </span>
          </div>

          <p style="color: #d9534f;"><strong>⚠️ Attention :</strong> ce code est valable pendant <strong>3 minutes</strong>.</p>

          <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 12px; color: #777;">
            Merci de faire confiance à <strong>Solutravo</strong> pour promouvoir vos produits et services auprès des professionnels du bâtiment.<br>
            <em>L'équipe Solutravo</em>
          </p>
        </div>
        `
      });

      if (response.status !== 201) {
        throw new Error("Erreur lors de l'envoi de l'email");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du mail OTP:");
    }

    return { email: emailAnnonceur };

  } catch (err: any) {
    await conn.rollback();
    
    // Gestion des erreurs spécifiques
    if (err.code === "ER_DUP_ENTRY") {
      if (err.sqlMessage.includes("membres.email")) {
        const e = new Error("Cet email est déjà utilisé.");
        (e as any).statusCode = 409;
        throw e;
      }
       if (err.sqlMessage.includes("societes.siret") || err.sqlMessage.includes("presocietes.siret")) {
      const e = new Error("Ce SIRET est déjà associé à une société.");
      (e as any).statusCode = 409;
      throw e;
    }
    }
    
    if (err.code === "ER_DATA_TOO_LONG") {
      const e = new Error("Une donnée est trop longue pour un champ (ex: code postal trop long).");
      (e as any).statusCode = 400;
      throw e;
    }

    if (err.code === "ER_BAD_NULL_ERROR") {
      const e = new Error("Un champ obligatoire est manquant.");
      (e as any).statusCode = 400;
      throw e;
    }
    
    throw err;
  } finally {
    conn.release();
  }
}

// Interface complète
interface AnnonceurRegisterInput {
  emailAnnonceur: string;
  firstNameAnnonceur: string;
  lastNameAnnonceur: string;
  role: string;
  phoneAnnonceur: string;
  headquartersAnnonceur: string;
  activityAnnonceur: string;
  companyNameAnnonceur: string;
  howDidYouKnowAnnonceur: string;
  siretAnnonceur?: string;
  // Colonnes supplémentaires (optionnelles)
  size?: string;
  legal_form?: string;
  cp?: string;
  ville?: string;
  rue?: string;
  capital?: number;
}




export async function FournisseurRegister(data: FournisseurRegisterInput) {
  const { 
    contactEmail,
    contactFirstName, 
    contactLastName, 
    contactPosition,
    contactPhone,
    role,
    companyName,
    siret,
    address,
    postalCode,
    city,
    sector,
    customSector,
    message,
    cp,
    ville,
    rue
  } = data;
  console.log(data)

  // Validation des champs obligatoires
  if (!contactEmail) {
    const err = new Error("Email obligatoire");
    (err as any).statusCode = 400;
    throw err;
  }
  if (!validator.isEmail(contactEmail)) {
    const err = new Error("Email invalide");
    (err as any).statusCode = 422;
    throw err;
  }

  if (!contactFirstName) {
    const err = new Error("Le prénom est obligatoire");
    (err as any).statusCode = 400;
    throw err;
  }

  if (!companyName) {
    const err = new Error("Le nom de l'entreprise est obligatoire");
    (err as any).statusCode = 400;
    throw err;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    

    // Génération OTP
    const otp = genOTP();
    const expiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    const tempPassword = await bcrypt.hash("__PENDING__", 10);

    // Insertion dans la table MEMBRES
    const [resMembre] = await conn.query(
      `INSERT INTO membres (
        email, prenom, nom, passe, type, statut,
        verificationCode, verificationExpiry, ref
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, UUID())`,
      [
        contactEmail,
        contactFirstName,
        contactLastName,
        tempPassword,
        "membre",
        "actif",
        otp,
        expiry
      ]
    );
    const membreId = (resMembre as any).insertId;

    const finalSector = sector === 'autres' ? customSector : sector;

    // Insertion dans PRESOCIETES
    const [resSociete] = await conn.query(
      `INSERT INTO presocietes (
        name, siret, role,
        cp, ville, rue,
        address, phonenumber, 
        sector, message, position,
        membre_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyName,
        siret ?? null,
        (role ?? 'fournisseur') as any,
        cp ?? null,
        ville ?? null,
        rue ?? null,
        address ?? null,
        contactPhone ?? null,
        finalSector ?? null,
        message ?? null,
        contactPosition ?? null,
        membreId
      ]
    );
    console.log(resSociete);

    await conn.commit();


    // Envoi email professionnel à Solutravo
    try {
      const secteurAffichage = finalSector || "Non spécifié";
      const fonctionAffichage = contactPosition || "Non spécifiée";
      const messageAffichage = message || "Aucun message";
      const siretAffichage = siret || "Non renseigné";

      const emailSolutravo = await axios.post("https://mail.api.elyft.tech/send-email.php", {
        receiver: "vincent@solutravo.fr",
        sender: "no-reply@elyft.tech",
        subject: "🚀 Nouveau contact Fournisseur - Solutravo",
        message: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nouveau Contact Fournisseur</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f8f9fa;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 700px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #E77131, #D45A1F);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                }
                .header .subtitle {
                    font-size: 16px;
                    opacity: 0.9;
                    margin-top: 8px;
                }
                .content {
                    padding: 40px;
                }
                .section {
                    margin-bottom: 30px;
                    border-left: 4px solid #E77131;
                    padding-left: 20px;
                }
                .section-title {
                    color: #1E3A8A;
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-top: 10px;
                }
                .info-item {
                    background: #f8f9fa;
                    padding: 12px 15px;
                    border-radius: 8px;
                    border: 1px solid #e9ecef;
                }
                .info-label {
                    font-weight: 600;
                    color: #495057;
                    font-size: 14px;
                    margin-bottom: 5px;
                }
                .info-value {
                    color: #212529;
                    font-size: 15px;
                }
                .full-width {
                    grid-column: 1 / -1;
                }
                .message-box {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 10px;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 25px;
                    text-align: center;
                    border-top: 1px solid #e9ecef;
                }
                .logo {
                    color: #E77131;
                    font-weight: 700;
                    font-size: 20px;
                    margin-bottom: 10px;
                }
                .timestamp {
                    color: #6c757d;
                    font-size: 14px;
                    margin-top: 10px;
                }
                .badge {
                    background: #E77131;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    display: inline-block;
                    margin-left: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏗️ Nouveau Contact Fournisseur</h1>
                    <div class="subtitle">Opportunité business - À traiter rapidement</div>
                </div>
                
                <div class="content">
                    <!-- Section Entreprise -->
                    <div class="section">
                        <div class="section-title">
                            🏢 Informations Entreprise
                        </div>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Raison Sociale</div>
                                <div class="info-value">${companyName}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">SIRET</div>
                                <div class="info-value">${siretAffichage}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Secteur d'activité</div>
                                <div class="info-value">${secteurAffichage}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Adresse</div>
                                <div class="info-value">${address}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Code Postal</div>
                                <div class="info-value">${postalCode}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Ville</div>
                                <div class="info-value">${city}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Section Contact -->
                    <div class="section">
                        <div class="section-title">
                            👤 Contact Principal
                        </div>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Prénom & Nom</div>
                                <div class="info-value">${contactFirstName} ${contactLastName}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Fonction</div>
                                <div class="info-value">${fonctionAffichage}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Téléphone</div>
                                <div class="info-value">${contactPhone}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Email</div>
                                <div class="info-value">${contactEmail}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Section Message -->
                    <div class="section">
                        <div class="section-title">
                            💬 Message du fournisseur
                        </div>
                        <div class="message-box">
                            <div style="font-style: italic; color: #856404;">
                                "${messageAffichage}"
                            </div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div class="logo">SOLUTRAVO</div>
                    <div style="color: #6c757d; font-size: 14px;">
                        Ce message a été généré automatiquement suite à un nouveau contact fournisseur sur la plateforme.
                    </div>
                    <div class="timestamp">
                        Reçu le ${new Date().toLocaleString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
            </div>
        </body>
        </html>
        `
      });

      if (emailSolutravo.status !== 201) {
        console.error("Erreur lors de l'envoi de l'email à Solutravo");
      } else {
        console.log("Email envoyé avec succès à Solutravo");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du mail à Solutravo:", error);
    }

    return { email: contactEmail };

  } catch (err: any) {
    await conn.rollback();
    
    
    if (err.code === "ER_DATA_TOO_LONG") {
      const e = new Error("Une donnée est trop longue pour un champ (ex: code postal trop long).");
      (e as any).statusCode = 400;
      throw e;
    }

    if (err.code === "ER_BAD_NULL_ERROR") {
      const e = new Error("Un champ obligatoire est manquant.");
      (e as any).statusCode = 400;
      throw e;
    }
    
    throw err;
  } finally {
    conn.release();
  }
}

export interface FournisseurRegisterInput {
    contactEmail: string;
    contactFirstName: string;
    contactLastName: string;
    contactPosition?: string;
    contactPhone: string;
    role?: string;
    companyName: string;
    siret?: string;
    address: string;
    postalCode: string;
    city: string;
    sector?: string;
    customSector?: string;
    message?: string;
    cp?: string;
    ville?: string;
    rue?: string;
}

type SimpleRegisterInput = {
  nom: string;
  prenom: string;
  email: string;
  phonenumber: string;
  name: string;
  size?: string;
  passe: string;
};

export async function SimpleRegister(data: SimpleRegisterInput) {
  const { nom, prenom, email, phonenumber, name, size, passe } = data;

  if (!email || !validator.isEmail(email)) {
    const err = new Error("Email invalide");
    (err as any).statusCode = 400;
    throw err;
  }
  if (!prenom) {
    const err = new Error("Le prénom est obligatoire");
    (err as any).statusCode = 400;
    throw err;
  }
  if (!nom) {
    const err = new Error("Le nom est obligatoire");
    (err as any).statusCode = 400;
    throw err;
  }
  if (!name) {
    const err = new Error("Le nom de l'entreprise est obligatoire");
    (err as any).statusCode = 400;
    throw err;
  }
  if (!phonenumber) {
    const err = new Error("Le numéro de téléphone est obligatoire");
    (err as any).statusCode = 400;
    throw err;
  }
  if (!passe) {
    const err = new Error("Le mot de passe est obligatoire");
    (err as any).statusCode = 400;
    throw err;
  }
  if (!validator.isStrongPassword(passe, { minLength: 8, minUppercase: 1, minNumbers: 1 })) {
    const err = new Error("Mot de passe trop faible (8 caractères min, 1 majuscule, 1 chiffre)");
    (err as any).statusCode = 422;
    throw err;
  }

  const cleanPhone = phonenumber.replace(/[\s\-\(\)\.]/g, "");
  if (!/^(0[1-9]\d{8}|(\+33|0033)[1-9]\d{8})$/.test(cleanPhone)) {
    const err = new Error("Numéro de téléphone invalide. Format attendu : 0612345678 ou +33612345678");
    (err as any).statusCode = 422;
    throw err;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [exists] = await conn.query("SELECT id FROM membres WHERE email = ?", [email]);
    if ((exists as any).length > 0) {
      const err = new Error("Cet email est déjà utilisé.");
      (err as any).statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(passe, 10);

    const [resMembre] = await conn.query(
      `INSERT INTO membres (email, prenom, nom, phonenumber, passe, type, statut, isVerified, ref)
       VALUES (?, ?, ?, ?, ?, 'membre', 'actif', 1, UUID())`,
      [email, prenom, nom, cleanPhone, hashedPassword]
    );
    const membreId = (resMembre as any).insertId;

    await conn.query(
      `INSERT INTO presocietes (name, size, role, phonenumber, membre_id) VALUES (?, ?, 'artisan', ?, ?)`,
      [name, size ?? null, cleanPhone, membreId]
    );

    await conn.commit();
    return { email, membreId };
  } catch (err: any) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      const e = new Error("Cet email est déjà utilisé.");
      (e as any).statusCode = 409;
      throw e;
    }
    throw err;
  } finally {
    conn.release();
  }
}