


// import axios from 'axios';
// import fs from 'fs';
// import path from 'path';

// const EMAIL_API_URL = 'https://auth.solutravo-app.fr/send-email.php';
// const DEFAULT_SENDER = 'noreply@solutravo-compta.fr';
//  const PDF_BASE_URL = process.env.PDF_BASE_URL || 'https://staging.solutravo.zeta-app.fr';
// // const PDF_BASE_URL = process.env.PDF_BASE_URL || 'http://localhost:3000';

// interface SendDemandePrixEmailParams {
//   to: string;
//   recipientName: string;
//   reference: string;
//   pdfPath: string;
//   societe: { name: string; email?: string; telephone?: string; adresse?: string };
//   membre: { prenom: string; nom: string; email: string };
//   urgence?: string;
//   note_generale?: string;
//   date_limite_retour?: string;
//   isRelance?: boolean;
// }

// export async function sendDemandePrixEmail(params: SendDemandePrixEmailParams): Promise<boolean> {
//   try {
//     if (!fs.existsSync(params.pdfPath)) throw new Error(`Fichier PDF introuvable: ${params.pdfPath}`);
//     const pdfBuffer = fs.readFileSync(params.pdfPath);
//     const pdfBase64 = pdfBuffer.toString('base64');
//     const pdfFilename = `demande-prix-${params.reference}.pdf`;
//     const subject = params.isRelance
//       ? construireSubjectRelance(params.urgence, params.reference, params.societe.name)
//       : construireSubject(params.urgence, params.reference);
//     const htmlMessage = construireEmailHTML(params);
//     const payload = {
//       receiver: params.to, sender: params.societe.email || DEFAULT_SENDER, subject, message: htmlMessage,
//       attachment_base64: pdfBase64, attachment_name: pdfFilename, attachment_type: 'application/pdf'
//     };
//     console.log(`📧 Envoi email ${params.isRelance ? '[RELANCE]' : ''} à ${params.to}`);
//     const response = await axios.post(EMAIL_API_URL, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
//     if (response.status === 200 || response.status === 201 || response.data?.success) {
//       console.log(`✅ Email envoyé à ${params.to}`);
//       return true;
//     }
//     console.error(`❌ Échec envoi: ${response.status}`);
//     return false;
//   } catch (error: any) {
//     console.error(`❌ Erreur envoi email:`, error.message);
//     return false;
//   }
// }

// export async function sendConfirmationEmail(params: {
//   to: string; societe_name: string; membre_prenom: string; reference: string;
//   nb_produits: number; nb_destinataires: number; destinataires: string[];
// }): Promise<boolean> {
//   try {
//     const subject = `✅ Confirmation - Demande de prix ${params.reference} envoyée`;
//     const payload = { receiver: params.to, sender: DEFAULT_SENDER, subject, message: construireConfirmationHTML(params) };
//     const response = await axios.post(EMAIL_API_URL, payload, { headers: { 'Content-Type': 'application/json' } });
//     return response.status === 200 || response.status === 201 || response.data?.success;
//   } catch (error: any) {
//     console.error(`❌ Erreur confirmation:`, error.message);
//     return false;
//   }
// }

// function construireSubject(urgence: string | undefined, reference: string): string {
//   if (urgence === 'tres_urgent') return `🔴 TRÈS URGENT - Demande de prix ${reference}`;
//   if (urgence === 'urgent') return `⚠️ URGENT - Demande de prix ${reference}`;
//   return `📋 Demande de prix ${reference}`;
// }

// function construireSubjectRelance(_u: string | undefined, ref: string, soc: string): string {
//   return `🔔 RELANCE - Demande de prix ${ref} - ${soc}`;
// }

// function construireEmailHTML(params: SendDemandePrixEmailParams): string {
//   const urgenceColor = params.urgence === 'tres_urgent' ? '#DC2626' : params.urgence === 'urgent' ? '#F59E0B' : '#E77131';
//   const urgenceBadge = params.urgence === 'tres_urgent'
//     ? `<div style="background:#FEE2E2;border-left:4px solid #DC2626;padding:12px 15px;margin-bottom:20px;border-radius:4px;">
//          <p style="margin:0;color:#DC2626;font-weight:bold;">🔴 TRÈS URGENT - Merci de traiter cette demande en priorité</p>
//        </div>`
//     : params.urgence === 'urgent'
//     ? `<div style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:12px 15px;margin-bottom:20px;border-radius:4px;">
//          <p style="margin:0;color:#F59E0B;font-weight:bold;">⚠️ URGENT - Merci de traiter cette demande rapidement</p>
//        </div>`
//     : '';
//   const relanceBanner = params.isRelance
//     ? `<div style="background:#FFF7ED;border-left:4px solid #E77131;padding:12px 15px;margin-bottom:20px;border-radius:4px;">
//          <p style="margin:0;color:#E77131;font-weight:bold;">🔔 RELANCE - Nous n'avons pas encore reçu votre réponse</p>
//        </div>`
//     : '';
//   const dateLimite = params.date_limite_retour
//     ? `<tr>
//          <td style="padding:5px 0;color:#666;width:140px;"><strong>Date limite :</strong></td>
//          <td style="padding:5px 0;color:#DC2626;font-weight:bold;">
//            ${new Date(params.date_limite_retour).toLocaleDateString('fr-FR')}
//          </td>
//        </tr>`
//     : '';

//   return `
//     <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;">
//       <div style="background:linear-gradient(135deg,${urgenceColor} 0%,#F59E6C 100%);padding:25px 20px;border-radius:10px 10px 0 0;">
//         <h2 style="color:white;margin:0;font-size:22px;">
//           ${params.isRelance ? '🔔 RELANCE - ' : '📋 '}Demande de prix
//         </h2>
//         <p style="color:white;margin:8px 0 0 0;font-size:14px;opacity:0.9;">
//           Référence : <strong>${params.reference}</strong>
//         </p>
//       </div>

//       <div style="background:#f9f9f9;padding:30px 20px;border-radius:0 0 10px 10px;">
//         <!-- ✅ BONJOUR SIMPLE (sans nom ni email) -->
//         <p style="font-size:16px;margin-bottom:20px;">Bonjour,</p>
        
//         ${relanceBanner}${urgenceBadge}
//         <p style="font-size:15px;margin-bottom:25px;">
//           ${params.isRelance
//             ? `Nous revenons vers vous concernant notre demande de prix <strong>${params.reference}</strong>. Merci de nous transmettre votre devis dès que possible.`
//             : `Nous vous prions de bien vouloir nous transmettre votre <strong>meilleur devis</strong> pour les produits listés en pièce jointe.`
//           }
//         </p>

//         ${params.note_generale
//           ? `<div style="background:white;padding:15px;border-left:4px solid ${urgenceColor};border-radius:5px;margin-bottom:25px;">
//                <p style="margin:0;font-size:14px;color:#666;">
//                  <strong style="color:#333;">📝 Note :</strong><br/>
//                  ${params.note_generale.replace(/\n/g, '<br/>')}
//                </p>
//              </div>`
//           : ''
//         }

//         <!-- ✅ BOUTON PDF QUI S'OUVRE DANS NOUVEL ONGLET -->
//         <div style="text-align:center;margin:30px 0;">
//           <a href="${PDF_BASE_URL}/pdfs/${path.basename(params.pdfPath)}" 
//              target="_blank"
//              rel="noopener noreferrer"
//              style="display:inline-block;background:linear-gradient(135deg,#E77131 0%,#d45d1f 100%);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(231,113,49,0.3);">
//             📄 Voir la demande de prix (PDF)
//           </a>
//         </div>

//         <div style="background:white;padding:20px;border-radius:5px;margin-bottom:25px;">
//           <h3 style="margin:0 0 15px 0;font-size:16px;color:${urgenceColor};border-bottom:2px solid #f0f0f0;padding-bottom:10px;">
//             📞 Contact
//           </h3>
//           <table style="width:100%;font-size:14px;">
//             <tr>
//               <td style="padding:5px 0;color:#666;width:140px;"><strong>Société :</strong></td>
//               <td style="padding:5px 0;">${params.societe.name}</td>
//             </tr>
//             <tr>
//               <td style="padding:5px 0;color:#666;"><strong>Contact :</strong></td>
//               <td style="padding:5px 0;">${params.membre.prenom} ${params.membre.nom}</td>
//             </tr>
//             <tr>
//               <td style="padding:5px 0;color:#666;"><strong>Email :</strong></td>
//               <td style="padding:5px 0;">
//                 <a href="mailto:${params.membre.email}" style="color:${urgenceColor};">${params.membre.email}</a>
//               </td>
//             </tr>
//             ${params.societe.telephone
//               ? `<tr>
//                    <td style="padding:5px 0;color:#666;"><strong>Téléphone :</strong></td>
//                    <td style="padding:5px 0;">${params.societe.telephone}</td>
//                  </tr>`
//               : ''
//             }
//             ${dateLimite}
//           </table>
//         </div>

//         <hr style="border:none;border-top:1px solid #ddd;margin:30px 0;">

//         <div style="background:#FFF7ED;padding:15px;border-radius:5px;border:1px solid #FED7AA;">
//           <p style="margin:0;font-size:13px;color:#92400E;text-align:center;">
//             Cette demande de prix vous est envoyée depuis <strong style="color:#E77131;">Solutravo</strong>, 
//             logiciel dédié aux pros du bâtiment.<br/>
//             Rejoignez notre réseau de fournisseurs partenaires et simplifiez la vie de vos clients.<br/>
//             <a href="https://www.solutravo.fr" target="_blank" 
//                rel="noopener noreferrer"
//                style="display:inline-block;margin-top:8px;background:#E77131;color:white;padding:6px 16px;border-radius:20px;text-decoration:none;font-size:12px;">
//               En savoir plus
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   `;
// }

// function construireConfirmationHTML(params: {
//   societe_name: string; membre_prenom: string; reference: string;
//   nb_produits: number; nb_destinataires: number; destinataires: string[];
// }): string {
//   return `
//     <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;">
//       <div style="background:linear-gradient(135deg,#4CAF50 0%,#66BB6A 100%);padding:25px 20px;border-radius:10px 10px 0 0;">
//         <h2 style="color:white;margin:0;">✅ Demande de prix envoyée</h2>
//       </div>
//       <div style="background:#f9f9f9;padding:30px 20px;border-radius:0 0 10px 10px;">
//         <p>Bonjour <strong>${params.membre_prenom}</strong>,</p>
//         <p>Votre demande de prix <strong>${params.reference}</strong> a bien été envoyée à ${params.nb_destinataires} fournisseur(s).</p>
//         <div style="background:white;padding:20px;border-radius:5px;margin-bottom:20px;">
//           <p style="margin:0 0 8px 0;font-size:14px;color:#666;">📦 Produits : <strong>${params.nb_produits}</strong></p>
//           <p style="margin:0 0 8px 0;font-size:14px;color:#666;">📧 Destinataires : <strong>${params.nb_destinataires}</strong></p>
//           ${params.destinataires.length > 0
//             ? `<ul style="margin:10px 0 0 0;padding-left:20px;font-size:13px;color:#666;">
//                  ${params.destinataires.map(d => `<li>${d}</li>`).join('')}
//                </ul>`
//             : ''
//           }
//         </div>
//         <p style="font-size:12px;color:#999;text-align:center;">
//           Cet email a été envoyé automatiquement via <strong style="color:#E77131;">Solutravo</strong>.
//         </p>
//       </div>
//     </div>
//   `;
// }



// export async function sendNotificationVincent(params: {
//   entreprise: string;
//   fournisseurs: string[];
//   reference: string;
// }): Promise<boolean> {
//   try {
//     const subject = `🆕 Nouvelle demande de prix envoyée par un utilisateur`;
    
//     const now = new Date();
//     const dateHeure = now.toLocaleString('fr-FR', {
//       dateStyle: 'full',
//       timeStyle: 'short'
//     });
    
//     const htmlMessage = `
//       <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;">
//         <div style="background:linear-gradient(135deg,#E77131 0%,#F59E6C 100%);padding:25px 20px;border-radius:10px 10px 0 0;">
//           <h2 style="color:white;margin:0;font-size:22px;">🆕 Nouvelle demande de prix</h2>
//         </div>
        
//         <div style="background:#f9f9f9;padding:30px 20px;border-radius:0 0 10px 10px;">
//           <div style="background:white;padding:20px;border-radius:5px;margin-bottom:20px;">
//             <table style="width:100%;font-size:14px;">
//               <tr>
//                 <td style="padding:8px 0;color:#666;width:180px;"><strong>📅 Date et heure :</strong></td>
//                 <td style="padding:8px 0;">${dateHeure}</td>
//               </tr>
//               <tr>
//                 <td style="padding:8px 0;color:#666;"><strong>🏢 Entreprise :</strong></td>
//                 <td style="padding:8px 0;font-weight:600;color:#E77131;">${params.entreprise}</td>
//               </tr>
//               <tr>
//                 <td style="padding:8px 0;color:#666;"><strong>📋 Référence :</strong></td>
//                 <td style="padding:8px 0;">${params.reference}</td>
//               </tr>
//               <tr>
//                 <td style="padding:8px 0;color:#666;vertical-align:top;"><strong>📧 Fournisseur(s) sollicité(s) :</strong></td>
//                 <td style="padding:8px 0;">
//                   ${params.fournisseurs.map(f => `<div style="padding:3px 0;">• ${f}</div>`).join('')}
//                 </td>
//               </tr>
//             </table>
//           </div>
          
//           <p style="font-size:12px;color:#999;text-align:center;margin-top:25px;">
//             Notification automatique Solutravo
//           </p>
//         </div>
//       </div>
//     `;
    
//     const payload = {
//       // receiver: 'vincent@solutravo.fr',
//       receiver: 'tflkmc1990@gmail.com',
//       sender: DEFAULT_SENDER,
//       subject,
//       message: htmlMessage
//     };
    
//     const response = await axios.post(EMAIL_API_URL, payload, {
//       headers: { 'Content-Type': 'application/json' },
//       timeout: 30000
//     });
    
//     return response.status === 200 || response.status === 201 || response.data?.success;
//   } catch (error: any) {
//     console.error(`❌ Erreur notification Vincent:`, error.message);
//     return false;
//   }
// }


import axios from 'axios';
import fs from 'fs';
import path from 'path';

const EMAIL_API_URL = 'https://auth.solutravo-app.fr/send-email.php';
const DEFAULT_SENDER = 'noreply@solutravo-compta.fr';
const PDF_BASE_URL = process.env.PDF_BASE_URL || 'https://staging.solutravo.zeta-app.fr';

interface SendDemandePrixEmailParams {
  to: string;
  recipientName: string;
  reference: string;
  pdfPath: string;
  societe: { name: string; email?: string; telephone?: string; adresse?: string };
  membre: { prenom: string; nom: string; email: string };
  urgence?: string;
  note_generale?: string;
  date_limite_retour?: string;
  isRelance?: boolean;
}

// ✅ FONCTION 1 : Email au fournisseur
export async function sendDemandePrixEmail(params: SendDemandePrixEmailParams): Promise<boolean> {
  try {
    if (!fs.existsSync(params.pdfPath)) throw new Error(`Fichier PDF introuvable: ${params.pdfPath}`);
    const pdfBuffer = fs.readFileSync(params.pdfPath);
    const pdfBase64 = pdfBuffer.toString('base64');
    const pdfFilename = `demande-prix-${params.reference}.pdf`;
    
    const subject = params.isRelance
      ? construireSubjectRelance(params.urgence, params.reference, params.societe.name)
      : construireSubject(params.urgence, params.reference, params.societe.name);
    
    const htmlMessage = construireEmailHTML(params);
    
    const payload = {
      receiver: params.to, 
      sender: params.societe.email || DEFAULT_SENDER, 
      subject, 
      message: htmlMessage,
      attachment_base64: pdfBase64, 
      attachment_name: pdfFilename, 
      attachment_type: 'application/pdf'
    };
    
    console.log(`📧 Envoi email ${params.isRelance ? '[RELANCE]' : ''} à ${params.to}`);
    const response = await axios.post(EMAIL_API_URL, payload, { 
      headers: { 'Content-Type': 'application/json' }, 
      timeout: 30000 
    });
    
    if (response.status === 200 || response.status === 201 || response.data?.success) {
      console.log(`✅ Email envoyé à ${params.to}`);
      return true;
    }
    console.error(`❌ Échec envoi: ${response.status}`);
    return false;
  } catch (error: any) {
    console.error(`❌ Erreur envoi email:`, error.message);
    return false;
  }
}

// ✅ FONCTION 2 : Notification à Vincent
export async function sendNotificationVincent(params: {
  entreprise: string;
  fournisseurs: string[];
  reference: string;
}): Promise<boolean> {
  try {
    const subject = `🆕 Nouvelle demande de prix envoyée par un utilisateur`;
    
    const now = new Date();
    const dateHeure = now.toLocaleString('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'short'
    });
    
    const htmlMessage = `
      <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#E77131 0%,#F59E6C 100%);padding:25px 20px;border-radius:10px 10px 0 0;">
          <h2 style="color:white;margin:0;font-size:22px;">🆕 Nouvelle demande de prix</h2>
        </div>
        
        <div style="background:#f9f9f9;padding:30px 20px;border-radius:0 0 10px 10px;">
          <div style="background:white;padding:20px;border-radius:5px;margin-bottom:20px;">
            <table style="width:100%;font-size:14px;">
              <tr>
                <td style="padding:8px 0;color:#666;width:180px;"><strong>📅 Date et heure :</strong></td>
                <td style="padding:8px 0;">${dateHeure}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#666;"><strong>🏢 Entreprise :</strong></td>
                <td style="padding:8px 0;font-weight:600;color:#E77131;">${params.entreprise}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#666;"><strong>📋 Référence :</strong></td>
                <td style="padding:8px 0;">${params.reference}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#666;vertical-align:top;"><strong>📧 Fournisseur(s) sollicité(s) :</strong></td>
                <td style="padding:8px 0;">
                  ${params.fournisseurs.map(f => `<div style="padding:3px 0;">• ${f}</div>`).join('')}
                </td>
              </tr>
            </table>
          </div>
          
          <p style="font-size:12px;color:#999;text-align:center;margin-top:25px;">
            Notification automatique Solutravo
          </p>
        </div>
      </div>
    `;
    
    const payload = {
     receiver: 'vincent@solutravo.fr',
      sender: DEFAULT_SENDER,
      subject,
      message: htmlMessage
    };
    
    console.log(`📧 Envoi notification à Vincent`);
    const response = await axios.post(EMAIL_API_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    if (response.status === 200 || response.status === 201 || response.data?.success) {
      console.log(`✅ Notification Vincent envoyée`);
      return true;
    }
    return false;
  } catch (error: any) {
    console.error(`❌ Erreur notification Vincent:`, error.message);
    return false;
  }
}

// ✅ SUJET EMAIL FOURNISSEUR
function construireSubject(urgence: string | undefined, reference: string, societe: string): string {
  const urgencePrefix = urgence === 'tres_urgent' 
    ? '🔴 TRÈS URGENT - ' 
    : urgence === 'urgent' 
    ? '⚠️ URGENT - ' 
    : '';
    
  return `${urgencePrefix}Demande de prix : ${societe} - ${reference}`;
}

// ✅ SUJET EMAIL RELANCE
function construireSubjectRelance(_u: string | undefined, ref: string, soc: string): string {
  return `🔔 RELANCE - Demande de prix ${ref} - ${soc}`;
}

// ✅ HTML EMAIL FOURNISSEUR
function construireEmailHTML(params: SendDemandePrixEmailParams): string {
  const urgenceColor = params.urgence === 'tres_urgent' ? '#DC2626' : params.urgence === 'urgent' ? '#F59E0B' : '#E77131';
  
  // ✅ URGENCE AVANT LE BONJOUR
  const urgenceBadge = params.urgence === 'tres_urgent'
    ? `<div style="background:#FEE2E2;border-left:4px solid #DC2626;padding:12px 15px;margin-bottom:20px;border-radius:4px;">
         <p style="margin:0;color:#DC2626;font-weight:bold;">🔴 TRÈS URGENT - Merci de traiter cette demande en priorité</p>
       </div>`
    : params.urgence === 'urgent'
    ? `<div style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:12px 15px;margin-bottom:20px;border-radius:4px;">
         <p style="margin:0;color:#F59E0B;font-weight:bold;">⚠️ URGENT - Merci de traiter cette demande rapidement</p>
       </div>`
    : '';
    
  const relanceBanner = params.isRelance
    ? `<div style="background:#FFF7ED;border-left:4px solid #E77131;padding:12px 15px;margin-bottom:20px;border-radius:4px;">
         <p style="margin:0;color:#E77131;font-weight:bold;">🔔 RELANCE - Nous n'avons pas encore reçu votre réponse</p>
       </div>`
    : '';
    
  const dateLimite = params.date_limite_retour
    ? `<tr>
         <td style="padding:5px 0;color:#666;width:140px;"><strong>Date limite :</strong></td>
         <td style="padding:5px 0;color:#DC2626;font-weight:bold;">
           ${new Date(params.date_limite_retour).toLocaleDateString('fr-FR')}
         </td>
       </tr>`
    : '';

  return `
    <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,${urgenceColor} 0%,#F59E6C 100%);padding:25px 20px;border-radius:10px 10px 0 0;">
        <h2 style="color:white;margin:0;font-size:22px;">
          ${params.isRelance ? '🔔 RELANCE - ' : '📋 '}Demande de prix
        </h2>
        <p style="color:white;margin:8px 0 0 0;font-size:14px;opacity:0.9;">
          RÉFÉRENCE : <strong>${params.reference}</strong>
        </p>
      </div>

      <div style="background:#f9f9f9;padding:30px 20px;border-radius:0 0 10px 10px;">
        ${urgenceBadge}
        
        <p style="font-size:16px;margin-bottom:20px;">Bonjour,</p>
        
        ${relanceBanner}
        
        <p style="font-size:15px;margin-bottom:25px;">
          ${params.isRelance
            ? `Nous revenons vers vous concernant notre demande de prix <strong>${params.reference}</strong>. Merci de nous transmettre votre devis dès que possible.`
            : `Nous vous prions de bien vouloir nous transmettre votre <strong>meilleur devis</strong> pour les produits listés en pièce jointe.`
          }
        </p>

        <div style="text-align:center;margin:30px 0;">
          <a href="${PDF_BASE_URL}/pdfs/${path.basename(params.pdfPath)}" 
             target="_blank"
             rel="noopener noreferrer"
             style="display:inline-block;background:linear-gradient(135deg,#E77131 0%,#d45d1f 100%);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(231,113,49,0.3);">
            📄 Voir la demande de prix (PDF)
          </a>
        </div>

        <div style="background:white;padding:20px;border-radius:5px;margin-bottom:25px;">
          <h3 style="margin:0 0 15px 0;font-size:16px;color:${urgenceColor};border-bottom:2px solid #f0f0f0;padding-bottom:10px;">
            📞 Contact
          </h3>
          <table style="width:100%;font-size:14px;">
            <tr>
              <td style="padding:5px 0;color:#666;width:140px;"><strong>Société :</strong></td>
              <td style="padding:5px 0;">${params.societe.name}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;color:#666;"><strong>Contact :</strong></td>
              <td style="padding:5px 0;">${params.membre.prenom} ${params.membre.nom}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;color:#666;"><strong>Email :</strong></td>
              <td style="padding:5px 0;">
                <a href="mailto:${params.membre.email}" style="color:${urgenceColor};">${params.membre.email}</a>
              </td>
            </tr>
            ${params.societe.telephone
              ? `<tr>
                   <td style="padding:5px 0;color:#666;"><strong>Téléphone :</strong></td>
                   <td style="padding:5px 0;">${params.societe.telephone}</td>
                 </tr>`
              : ''
            }
            ${dateLimite}
          </table>
        </div>

        <hr style="border:none;border-top:1px solid #ddd;margin:30px 0;">

        <div style="background:#FFF7ED;padding:15px;border-radius:5px;border:1px solid #FED7AA;">
          <p style="margin:0;font-size:13px;color:#92400E;text-align:center;">
            Cette demande de prix vous est envoyée depuis <strong style="color:#E77131;">Solutravo</strong>, 
            logiciel dédié aux pros du bâtiment.<br/>
            Rejoignez notre réseau de fournisseurs partenaires et simplifiez la vie de vos clients.<br/>
            <a href="https://www.solutravo.fr" target="_blank" 
               rel="noopener noreferrer"
               style="display:inline-block;margin-top:8px;background:#E77131;color:white;padding:6px 16px;border-radius:20px;text-decoration:none;font-size:12px;">
              En savoir plus
            </a>
          </p>
        </div>
      </div>
    </div>
  `;
}