import axios from 'axios';
import fs from 'fs';
import path from 'path';

const EMAIL_API_URL = 'https://auth.solutravo-app.fr/send-email.php';
const DEFAULT_SENDER = 'noreply@solutravo-compta.fr';

// URL de base publique pour servir les PDFs (peut être surchargée en prod)
// const PDF_BASE_URL = process.env.PDF_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const PDF_BASE_URL = process.env.PDF_BASE_URL || 'https://staging.solutravo.zeta-app.fr';

interface SendDemandePrixEmailParams {
  to: string;
  recipientName: string;
  reference: string;
  pdfPath: string;
  societe: {
    name: string;
    email?: string;
    telephone?: string;
    adresse?: string;
  };
  membre: {
    prenom: string;
    nom: string;
    email: string;
  };
  urgence?: string;
  note_generale?: string;
}

/**
 * Envoyer un email avec la demande de prix
 * Utilise l'API PHP externe pour l'envoi
 */
export async function sendDemandePrixEmail(
  params: SendDemandePrixEmailParams
): Promise<boolean> {
  try {
    // 1. Lire le PDF et le convertir en base64
    if (!fs.existsSync(params.pdfPath)) {
      console.error(`❌ Fichier PDF introuvable: ${params.pdfPath}`);
      throw new Error('Fichier PDF introuvable pour pièce jointe');
    }

    const pdfBuffer = fs.readFileSync(params.pdfPath);
    const pdfBase64 = pdfBuffer.toString('base64');
    const pdfFilename = `demande-prix-${params.reference}.pdf`;

    console.log(`📝 Lecture du PDF: path=${params.pdfPath} size=${pdfBuffer.length} bytes base64_len=${pdfBase64.length}`);

    // 2. Construire le sujet
    const subject = construireSubject(params.urgence, params.reference);

    // 3. Construire le message HTML
    const htmlMessage = construireEmailHTML(params);

    // 4. Préparer le payload pour l'API PHP
    const payload = {
      receiver: params.to,
      sender: params.societe.email,
      subject: subject,
      message: htmlMessage,
      // Pièce jointe en base64
      attachment_base64: pdfBase64,
      attachment_name: pdfFilename,
      attachment_type: 'application/pdf'
    };

    // 5. Envoyer via l'API PHP
    console.log(`📧 Envoi email à ${params.to} avec PJ (${pdfFilename}), payload_size ~ ${JSON.stringify(payload).length} bytes`);
    console.log(`🔗 Lien de téléchargement PDF (public) : ${PDF_BASE_URL}/pdfs/${path.basename(params.pdfPath)}`);
    
    const response = await axios.post(EMAIL_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 secondes pour les PJ
    });

    // 6. Vérifier la réponse
    console.log('📬 Réponse API email:', { status: response.status, data: response.data });

    if (response.status === 200 || response.status === 201 || response.data?.success) {
      console.log(`✅ Email envoyé à ${params.to}`);
      return true;
    }

    console.error(`❌ Échec envoi: ${response.status} ${response.statusText} - ${JSON.stringify(response.data)}`);
    return false;

  } catch (error: any) {
    console.error(`❌ Erreur envoi email:`, error.message);
    return false;
  }
}

/**
 * Envoyer un email de confirmation à l'émetteur
 */
export async function sendConfirmationEmail(
  params: {
    to: string;
    societe_name: string;
    membre_prenom: string;
    reference: string;
    nb_produits: number;
    nb_destinataires: number;
    destinataires: string[];
  }
): Promise<boolean> {
  try {
    const subject = `✅ Confirmation - Demande de prix ${params.reference} envoyée`;
    const htmlMessage = construireConfirmationHTML(params);

    const payload = {
      receiver: params.to,
      sender: DEFAULT_SENDER,
      subject: subject,
      message: htmlMessage
    };


    const response = await axios.post(EMAIL_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200 || response.status === 201 || response.data.success) {
      console.log(`✅ Email de confirmation envoyé à ${params.to}`);
      return true;
    }

    return false;

  } catch (error: any) {
    console.error(`❌ Erreur envoi confirmation:`, error.message);
    return false;
  }
}

/**
 * Construire le sujet selon l'urgence
 */
function construireSubject(urgence: string | undefined, reference: string): string {
  if (urgence === 'tres_urgent') {
    return `🔴 TRÈS URGENT - Demande de prix ${reference}`;
  }
  if (urgence === 'urgent') {
    return `⚠️ URGENT - Demande de prix ${reference}`;
  }
  return `📋 Demande de prix ${reference}`;
}

/**
 * Construire le HTML de l'email principal
 */
function construireEmailHTML(params: SendDemandePrixEmailParams): string {
  const urgenceColor = params.urgence === 'tres_urgent' 
    ? '#DC2626' 
    : params.urgence === 'urgent'
    ? '#F59E0B'
    : '#E77131';

  const urgenceBadge = params.urgence === 'tres_urgent'
    ? `<div style="background: #FEE2E2; border-left: 4px solid #DC2626; padding: 12px 15px; margin-bottom: 20px; border-radius: 4px;">
         <p style="margin: 0; color: #DC2626; font-weight: bold;">🔴 TRÈS URGENT - Merci de traiter cette demande en priorité</p>
       </div>`
    : params.urgence === 'urgent'
    ? `<div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 15px; margin-bottom: 20px; border-radius: 4px;">
         <p style="margin: 0; color: #F59E0B; font-weight: bold;">⚠️ URGENT - Merci de traiter cette demande rapidement</p>
       </div>`
    : '';

  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, ${urgenceColor} 0%, #F59E6C 100%); padding: 25px 20px; border-radius: 10px 10px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 22px;">📋 Demande de prix</h2>
        <p style="color: white; margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">
          Référence : <strong>${params.reference}</strong>
        </p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Bonjour <strong>${params.recipientName}</strong>,
        </p>
        
        ${urgenceBadge}
        
        <p style="font-size: 15px; margin-bottom: 25px;">
          Nous vous prions de bien vouloir nous transmettre votre <strong>meilleur devis</strong> pour les produits listés en pièce jointe.
        </p>
        
        ${params.note_generale ? `
        <div style="background: white; padding: 15px; border-left: 4px solid ${urgenceColor}; border-radius: 5px; margin-bottom: 25px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong style="color: #333;">📝 Note importante :</strong><br/>
            ${params.note_generale.replace(/\n/g, '<br/>')}
          </p>
        </div>
        ` : ''}
        
        <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0; font-size: 16px; color: ${urgenceColor}; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
            📞 Informations de contact
          </h3>
          
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding: 5px 0; color: #666; width: 120px;"><strong>Société :</strong></td>
              <td style="padding: 5px 0;">${params.societe.name}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #666;"><strong>Nom :</strong></td>
              <td style="padding: 5px 0;">${params.membre.prenom} ${params.membre.nom}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #666;"><strong>Email :</strong></td>
              <td style="padding: 5px 0;"><a href="mailto:${params.membre.email}" style="color: ${urgenceColor}; text-decoration: none;">${params.membre.email}</a></td>
            </tr>
            ${params.societe.telephone ? `
            <tr>
              <td style="padding: 5px 0; color: #666;"><strong>Téléphone :</strong></td>
              <td style="padding: 5px 0;">${params.societe.telephone}</td>
            </tr>
            ` : ''}
            ${params.societe.adresse ? `
            <tr>
              <td style="padding: 5px 0; color: #666; vertical-align: top;"><strong>Adresse :</strong></td>
              <td style="padding: 5px 0;">${params.societe.adresse.replace(/\n/g, '<br/>')}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div style="background: #E8F5E9; padding: 15px; border-radius: 5px; margin-bottom: 25px; border-left: 4px solid #4CAF50;">
          <p style="margin: 0; font-size: 14px; color: #2E7D32;">
            📎 <strong>Pièce jointe :</strong> demande-prix-${params.reference}.pdf<br/>
            <span style="font-size: 12px; color: #666;">La liste détaillée des produits se trouve dans le PDF ci-joint.</span>
            <br/>
            <span style="font-size: 12px; color: #666;">Si la pièce jointe n'apparaît pas, <a href="${PDF_BASE_URL}/pdfs/${path.basename(params.pdfPath)}" target="_blank">cliquez ici pour télécharger le PDF</a>.</span>
          </p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 5px; text-align: center; margin: 25px 0;">
          <p style="font-size: 15px; color: #666; margin: 0 0 10px 0;">
            Merci de nous faire parvenir votre devis dans les meilleurs délais.
          </p>
          <p style="font-size: 13px; color: #999; margin: 0;">
            Vous pouvez répondre directement à cet email.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          Cet email a été envoyé automatiquement via <strong style="color: ${urgenceColor};">Solutravo</strong>.<br/>
          Pour toute question, contactez ${params.membre.prenom} ${params.membre.nom}.
        </p>
      </div>
    </div>
  `;
}

/**
 * Construire le HTML de l'email de confirmation
 */
function construireConfirmationHTML(params: {
  societe_name: string;
  membre_prenom: string;
  reference: string;
  nb_produits: number;
  nb_destinataires: number;
  destinataires: string[];
}): string {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); padding: 25px 20px; border-radius: 10px 10px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 22px;">✅ Demande de prix envoyée</h2>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Bonjour <strong>${params.membre_prenom}</strong>,
        </p>
        
        <p style="font-size: 15px; margin-bottom: 25px;">
          Votre demande de prix <strong>${params.reference}</strong> a bien été envoyée.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #4CAF50; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
            📊 Récapitulatif
          </h3>
          
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 180px;">📦 Produits demandés :</td>
              <td style="padding: 8px 0;"><strong>${params.nb_produits}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">📧 Destinataires :</td>
              <td style="padding: 8px 0;"><strong>${params.nb_destinataires}</strong></td>
            </tr>
          </table>
          
          ${params.destinataires.length > 0 ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f0f0f0;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">
              <strong>✉️ Envoyé à :</strong>
            </p>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #666;">
              ${params.destinataires.map(dest => `<li style="margin: 4px 0;">${dest}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
        </div>
        
        <div style="background: #E8F5E9; padding: 15px; border-radius: 5px; margin-bottom: 25px; border-left: 4px solid #4CAF50;">
          <p style="margin: 0; font-size: 14px; color: #2E7D32;">
            ✅ Vos fournisseurs ont reçu votre demande avec le PDF en pièce jointe.
          </p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 25px;">
          Vous recevrez les devis directement par email.<br/>
          Consultez l'historique dans votre espace Solutravo.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          Cet email a été envoyé automatiquement via <strong style="color: #E77131;">Solutravo</strong>.
        </p>
      </div>
    </div>
  `;
}


