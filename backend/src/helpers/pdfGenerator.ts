

// // import PDFDocument from 'pdfkit';
// // import fs from 'fs';
// // import path from 'path';
// // import axios from 'axios';
// // import { DemandePrixPDFData } from '../types/demandesPrix';

// // const BASE_URL = process.env.PDF_BASE_URL || 'https://staging.solutravo.zeta-app.fr'
// // const LOGO_BASE_URL = process.env.LOGO_BASE_URL || 'https://staging.solutravo-compta.fr/public';

// // export async function generateDemandePrixPDF(
// //   data: DemandePrixPDFData
// // ): Promise<string> {
// //   return new Promise(async (resolve, reject) => {
// //     try {
// //       const pdfDir = path.join(__dirname, '../../storage/pdfs');
// //       if (!fs.existsSync(pdfDir)) {
// //         fs.mkdirSync(pdfDir, { recursive: true });
// //       }

// //       const sanitize = (name: string) =>
// //         (name || '')
// //           .normalize('NFKD')
// //           .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
// //           .replace(/\s+/g, '-')
// //           .replace(/-+/g, '-')
// //           .trim()
// //           .slice(0, 100);

// //       const safeRef = sanitize(data.demande.reference || 'reference');
// //       const filename = `demande-prix-${safeRef}-${Date.now()}.pdf`;
// //       const filepath = path.join(pdfDir, filename);

// //       const doc = new PDFDocument({ 
// //         margin: 40,
// //         size: 'A4'
// //       });
// //       const stream = fs.createWriteStream(filepath);
// //       doc.pipe(stream);

// //       const ORANGE = '#E77131';
// //       const GRAY = '#666666';
// //       const BLACK = '#333333';
// //       const RED = '#DC2626';

// //       // ─── LOGO ENTREPRISE CLIENTE (DISTANT - CENTRÉ) ──────
// //       let logoLoaded = false;
      
// //       if (data.societe.logo) {
// //         try {
// //           const logoUrl = `${LOGO_BASE_URL}/${data.societe.logo}`;
// //           console.log(`📷 Tentative de chargement du logo: ${logoUrl}`);
          
// //           const response = await axios.get(logoUrl, {
// //             responseType: 'arraybuffer',
// //             timeout: 5000,
// //             validateStatus: (status) => status === 200
// //           });

// //           if (response.data) {
// //             const tempLogoPath = path.join(pdfDir, `temp-logo-${Date.now()}.png`);
// //             fs.writeFileSync(tempLogoPath, response.data);

// //             const logoWidth =40;
// //             const logoX = (doc.page.width - logoWidth) / 2;
// //             doc.image(tempLogoPath, logoX, doc.y, { width: logoWidth, align: 'center' });
// //             doc.moveDown(0.8);

// //             fs.unlinkSync(tempLogoPath);
// //             logoLoaded = true;
// //             console.log(`✅ Logo chargé avec succès`);
// //           }
// //         } catch (err: any) {
// //           console.warn(`⚠️ Impossible de charger le logo:`, err.message);
// //         }
// //       }

// //       // ✅ PLACEHOLDER SI PAS DE LOGO
// //       if (!logoLoaded) {
// //         console.log('📦 Utilisation du placeholder logo');
// //         const logoWidth =40;
// //         const logoHeight =40;
// //         const logoX = (doc.page.width - logoWidth) / 2;
// //         const logoY = doc.y;

// //         // Rectangle avec initiales de la société
// //         doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 6)
// //           .fillAndStroke('#F0F0F0', '#CCCCCC');

// //         // Initiales de la société
// //         const initiales = data.societe.name
// //           .split(' ')
// //           .map(word => word[0])
// //           .join('')
// //           .toUpperCase()
// //           .slice(0, 2);

// //         doc.fontSize(24)
// //           .fillColor(ORANGE)
// //           .text(initiales, logoX, logoY + 18, {
// //             width: logoWidth,
// //             align: 'center'
// //           });

// //         doc.moveDown(2.5);
// //       }
// // //logos
// //       // ─── EN-TETE ─────────────────────────────────────────
// //       // ✅ Centre de la page (calculé une fois)
// //       const pageCenter = doc.page.width / 2;
      
// //       // ✅ TITRE CENTRÉ MANUELLEMENT
// //       doc.fontSize(22).fillColor(ORANGE);
// //       const titreText = 'DEMANDE DE PRIX';
// //       const titreWidth = doc.widthOfString(titreText);
// //       doc.text(titreText, pageCenter - titreWidth / 2, doc.y);
// //       doc.moveDown(1);
      
// //       // ✅ BLOC CENTRÉ MANUELLEMENT
// //       // Référence
// //       doc.fontSize(11).fillColor(GRAY);
// //       const refText = `Reference : ${data.demande.reference}`;
// //       const refWidth = doc.widthOfString(refText);
// //       doc.text(refText, pageCenter - refWidth / 2, doc.y);
      
// //       // Date
// //       const dateText = `Date : ${new Date(data.demande.date_creation).toLocaleDateString('fr-FR')}`;
// //       const dateWidth = doc.widthOfString(dateText);
// //       doc.text(dateText, pageCenter - dateWidth / 2, doc.y);

// //       // Date limite
// //       if (data.demande.date_limite_retour) {
// //         doc.fillColor(RED);
// //         const limiteText = `Date limite de retour : ${new Date(data.demande.date_limite_retour).toLocaleDateString('fr-FR')}`;
// //         const limiteWidth = doc.widthOfString(limiteText);
// //         doc.text(limiteText, pageCenter - limiteWidth / 2, doc.y);
// //       }

// //       doc.moveDown(1);

// //       // ─── URGENCE (CENTRÉE MANUELLEMENT) ───────────────────
// //       if (data.demande.urgence && data.demande.urgence !== 'normal') {
// //         const urgenceText = data.demande.urgence === 'tres_urgent'
// //           ? '!! TRES URGENT !!'
// //           : '! URGENT !';
// //         const urgenceColor = data.demande.urgence === 'tres_urgent' ? RED : '#F59E0B';
// //         doc.fontSize(13).fillColor(urgenceColor);
// //         const urgenceWidth = doc.widthOfString(urgenceText);
// //         doc.text(urgenceText, pageCenter - urgenceWidth / 2, doc.y);
// //         doc.moveDown(1.2);
// //       }

// //       doc.fillColor(BLACK);

// //       // ─── EMETTEUR (ALIGNÉ À GAUCHE X=40) ─────────────────
// //       doc.fontSize(13).fillColor(ORANGE).text('Emetteur', 40, doc.y, { underline: true });




// import PDFDocument from 'pdfkit';
// import fs from 'fs';
// import path from 'path';
// import axios from 'axios';
// import { DemandePrixPDFData } from '../types/demandesPrix';

// const BASE_URL = process.env.PDF_BASE_URL || 'https://staging.solutravo.zeta-app.fr'
// const LOGO_BASE_URL = process.env.LOGO_BASE_URL || 'https://staging.solutravo-compta.fr/public';

// export async function generateDemandePrixPDF(
//   data: DemandePrixPDFData
// ): Promise<string> {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const pdfDir = path.join(__dirname, '../../storage/pdfs');
//       if (!fs.existsSync(pdfDir)) {
//         fs.mkdirSync(pdfDir, { recursive: true });
//       }

//       const sanitize = (name: string) =>
//         (name || '')
//           .normalize('NFKD')
//           .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
//           .replace(/\s+/g, '-')
//           .replace(/-+/g, '-')
//           .trim()
//           .slice(0, 100);

//       const safeRef = sanitize(data.demande.reference || 'reference');
//       const filename = `demande-prix-${safeRef}-${Date.now()}.pdf`;
//       const filepath = path.join(pdfDir, filename);

//       const doc = new PDFDocument({ 
//         margin: 40,
//         size: 'A4'
//       });
//       const stream = fs.createWriteStream(filepath);
//       doc.pipe(stream);

//       const ORANGE = '#E77131';
//       const GRAY = '#666666';
//       const BLACK = '#333333';
//       const RED = '#DC2626';

//       // ─── LOGO ENTREPRISE CLIENTE (DISTANT - CENTRÉ) ──────
//       let logoLoaded = false;
      
//       if (data.societe.logo) {
//         try {
//           const logoUrl = `${LOGO_BASE_URL}/${data.societe.logo}`;
//           console.log(`📷 Tentative de chargement du logo: ${logoUrl}`);
          
//           const response = await axios.get(logoUrl, {
//             responseType: 'arraybuffer',
//             timeout: 5000,
//             validateStatus: (status) => status === 200
//           });

//           if (response.data) {
//             const tempLogoPath = path.join(pdfDir, `temp-logo-${Date.now()}.png`);
//             fs.writeFileSync(tempLogoPath, response.data);

//             // ✅ Logo 60px large x 30px haut
//             const logoWidth = 60;
//             const logoHeight = 30;
//             const logoX = (doc.page.width - logoWidth) / 2;
//             doc.image(tempLogoPath, logoX, doc.y, { 
//               width: logoWidth,
//               height: logoHeight
//             });
//             doc.moveDown(0.5);  // ✅ Espacement réduit après le logo

//             fs.unlinkSync(tempLogoPath);
//             logoLoaded = true;
//             console.log(`✅ Logo chargé avec succès`);
//           }
//         } catch (err: any) {
//           console.warn(`⚠️ Impossible de charger le logo:`, err.message);
//         }
//       }

//       // ✅ PLACEHOLDER SI PAS DE LOGO
//       if (!logoLoaded) {
//         console.log('📦 Utilisation du placeholder logo');
//         const logoWidth = 60;
//         const logoHeight = 60;
//         const logoX = (doc.page.width - logoWidth) / 2;
//         const logoY = doc.y;

//         // Rectangle avec initiales de la société
//         doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 6)
//           .fillAndStroke('#F0F0F0', '#CCCCCC');

//         // Initiales de la société
//         const initiales = data.societe.name
//           .split(' ')
//           .map(word => word[0])
//           .join('')
//           .toUpperCase()
//           .slice(0, 2);

//         doc.fontSize(24)
//           .fillColor(ORANGE)
//           .text(initiales, logoX, logoY + 18, {
//             width: logoWidth,
//             align: 'center'
//           });

//         doc.moveDown(1.5);
//       }

//       // ─── EN-TETE ─────────────────────────────────────────
//       // ✅ Centre de la page (calculé une fois)
//       const pageCenter = doc.page.width / 2;
      
//       // ✅ TITRE CENTRÉ MANUELLEMENT
//       doc.fontSize(22).fillColor(ORANGE);
//       const titreText = 'DEMANDE DE PRIX';
//       const titreWidth = doc.widthOfString(titreText);
//       doc.text(titreText, pageCenter - titreWidth / 2, doc.y);
//       doc.moveDown(1);
      
//       // ✅ BLOC CENTRÉ MANUELLEMENT
//       // Référence
//       doc.fontSize(11).fillColor(GRAY);
//       const refText = `Reference : ${data.demande.reference}`;
//       const refWidth = doc.widthOfString(refText);
//       doc.text(refText, pageCenter - refWidth / 2, doc.y);
      
//       // Date
//       const dateText = `Date : ${new Date(data.demande.date_creation).toLocaleDateString('fr-FR')}`;
//       const dateWidth = doc.widthOfString(dateText);
//       doc.text(dateText, pageCenter - dateWidth / 2, doc.y);

//       // Date limite
//       if (data.demande.date_limite_retour) {
//         doc.fillColor(RED);
//         const limiteText = `Date limite de retour : ${new Date(data.demande.date_limite_retour).toLocaleDateString('fr-FR')}`;
//         const limiteWidth = doc.widthOfString(limiteText);
//         doc.text(limiteText, pageCenter - limiteWidth / 2, doc.y);
//       }

//       doc.moveDown(1);

//       // ─── URGENCE (CENTRÉE MANUELLEMENT) ───────────────────
//       if (data.demande.urgence && data.demande.urgence !== 'normal') {
//         const urgenceText = data.demande.urgence === 'tres_urgent'
//           ? '!! TRES URGENT !!'
//           : '! URGENT !';
//         const urgenceColor = data.demande.urgence === 'tres_urgent' ? RED : '#F59E0B';
//         doc.fontSize(13).fillColor(urgenceColor);
//         const urgenceWidth = doc.widthOfString(urgenceText);
//         doc.text(urgenceText, pageCenter - urgenceWidth / 2, doc.y);
//         doc.moveDown(1.2);
//       }

//       doc.fillColor(BLACK);

//       // ─── EMETTEUR (ALIGNÉ À GAUCHE X=40) ─────────────────
//       doc.fontSize(13).fillColor(ORANGE).text('Emetteur', 40, doc.y, { underline: true });
//       doc.moveDown(0.4);
//       doc.fontSize(10).fillColor(BLACK)
//         .text(`Societe : ${data.societe.name}`, 40)
//         .text(`Contact : ${data.membre.prenom} ${data.membre.nom}`, 40)
//         .text(`Email : ${data.membre.email}`, 40);
//       if (data.societe.telephone)
//         doc.text(`Telephone : ${data.societe.telephone}`, 40);
//       if (data.societe.adresse)
//         doc.text(`Adresse : ${data.societe.adresse}`, 40);
//       doc.moveDown(1.2);

//       // ─── LIVRAISON (ALIGNÉE À GAUCHE X=40) ───────────────
//       doc.fontSize(13).fillColor(ORANGE).text('Livraison', 40, doc.y, { underline: true });
//       doc.moveDown(0.4);
//       doc.fontSize(10).fillColor(BLACK);

//       // ✅ Adaptation aux valeurs du frontend
//       if (data.demande.adresse_livraison_type === 'retrait') {
//         doc.text('Retrait en point de vente', 40);
//       } else if (data.demande.adresse_livraison_type === 'siege') {
//         doc.text('À mon siège', 40);
//       } else if (data.demande.adresse_livraison_type === 'nouvelle') {
//         doc.text(data.demande.adresse_livraison || 'Adresse non spécifiée', 40);
//       } else {
//         // Fallback pour les anciennes données (a_mon_siege, etc.)
//         if (data.demande.adresse_livraison_type === 'retrait_point_vente') {
//           doc.text('Retrait en point de vente', 40);
//         } else if (data.demande.adresse_livraison_type === 'a_mon_siege') {
//           doc.text('À mon siège', 40);
//         } else if (data.demande.adresse_livraison_type === 'nouvelle_adresse') {
//           doc.text(data.demande.adresse_livraison || 'Adresse non spécifiée', 40);
//         } else {
//           doc.text('À définir', 40);
//         }
//       }
//       doc.moveDown(1.2);

//       // ─── NOTE GENERALE (ALIGNÉE À GAUCHE X=40) ───────────
//       if (data.demande.note_generale) {
//         doc.fontSize(13).fillColor(ORANGE).text('Note generale', 40, doc.y, { underline: true });
//         doc.moveDown(0.4);
//         doc.fontSize(10).fillColor(BLACK).text(data.demande.note_generale, 40);
//         doc.moveDown(1.2);
//       }

//       // ─── TABLEAU DES PRODUITS (ALIGNÉ À GAUCHE X=40) ─────
//       doc.fontSize(13).fillColor(ORANGE).text('Produits demandes', 40, doc.y, { underline: true });
//       doc.moveDown(0.8);

//       const tableTop = doc.y;
//       const headers = ['Qte', 'Produit', 'Unite', 'Specifications / Note'];
//       const colWidths = [50, 200, 60, 235];
//       const rowHeight = 20;
//       let xPos = 40;

//       doc.fontSize(9).fillColor(BLACK);
//       headers.forEach((header, i) => {
//         doc.rect(xPos, tableTop, colWidths[i], rowHeight)
//           .fillAndStroke('#F0F0F0', '#CCCCCC');
//         doc.fillColor(BLACK).text(header, xPos + 4, tableTop + 6, {
//           width: colWidths[i] - 8,
//           align: 'left'
//         });
//         xPos += colWidths[i];
//       });

//       let yPos = tableTop + rowHeight;

//       data.lignes.forEach((ligne, idx) => {
//         xPos = 40;
//         const lineH = Math.max(
//           rowHeight,
//           doc.heightOfString(ligne.product_nom, { width: colWidths[1] - 8 }) + 10,
//           doc.heightOfString(ligne.note_ligne || '', { width: colWidths[3] - 8 }) + 10
//         );
//         const bgColor = idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA';
//         const rowData = [
//           String(ligne.quantite),
//           ligne.product_nom,
//           ligne.product_unite || '',
//           ligne.note_ligne || ''
//         ];
//         rowData.forEach((cell, i) => {
//           doc.rect(xPos, yPos, colWidths[i], lineH)
//             .fillAndStroke(bgColor, '#CCCCCC');
//           doc.fillColor(BLACK).fontSize(9).text(cell, xPos + 4, yPos + 5, {
//             width: colWidths[i] - 8,
//             align: i === 0 ? 'center' : 'left'
//           });
//           xPos += colWidths[i];
//         });
//         yPos += lineH;
//       });

//       // ─── PIECES JOINTES (ALIGNÉES À GAUCHE) ──────────────
//       if (data.pieces_jointes && data.pieces_jointes.length > 0) {
//         doc.moveDown(3);
//         doc.fontSize(13).fillColor(ORANGE).text('Pieces jointes', 40, doc.y, { underline: true });
//         doc.moveDown(0.5);

//         data.pieces_jointes.forEach((pj, index) => {
//           const fileUrl = `${BASE_URL}/pieces-jointes/${pj.filename_stocke}`;
          
//           const xStart = 40;
//           const currentY = doc.y;
          
//           // Numéro + nom du fichier
//           doc.fontSize(10).fillColor(BLACK)
//             .text(`${index + 1}. ${pj.filename_original}`, xStart, currentY, {
//               continued: false
//             });
          
//           // Lien [Télécharger] en dessous
//           doc.fillColor('#1a56db')
//             .text(`    [Telecharger]`, xStart, doc.y, {
//               link: fileUrl,
//               underline: true,
//               continued: false
//             });

//           doc.fillColor(BLACK);
//           doc.moveDown(0.8);
//         });

//         doc.moveDown(0.5);
//         doc.fontSize(9).fillColor(GRAY)
//           .text(
//             'Cliquez sur "Telecharger" pour acceder a chaque piece jointe.',
//             40,
//             doc.y,
//             { align: 'left' }
//           );
//       }

//       // ─── PIED DE PAGE (À GAUCHE) ─────────────────────────
//       doc.moveDown(3);
//       doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#DDDDDD').stroke();
//       doc.moveDown(0.5);
//       doc.fontSize(9).fillColor(GRAY)
//         .text(
//           'Cette demande de prix vous est envoyee depuis Solutravo, logiciel dedie aux pros du batiment.',
//           40,
//           doc.y,
//           { align: 'left' }
//         )
//         .text(
//           'Rejoignez notre reseau de fournisseurs partenaires et simplifiez la vie de vos clients.',
//           40,
//           doc.y,
//           { align: 'left' }
//         );

//       doc.end();
//       stream.on('finish', () => resolve(filepath));
//       stream.on('error', (err) => reject(err));

//     } catch (error) {
//       reject(error);
//     }
//   });
// }



import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { DemandePrixPDFData } from '../types/demandesPrix';

const BASE_URL = process.env.PDF_BASE_URL || 'https://staging.solutravo.zeta-app.fr'
const LOGO_BASE_URL = process.env.LOGO_BASE_URL || 'https://staging.solutravo-compta.fr/public';

export async function generateDemandePrixPDF(
  data: DemandePrixPDFData
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfDir = path.join(__dirname, '../../storage/pdfs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const sanitize = (name: string) =>
        (name || '')
          .normalize('NFKD')
          .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
          .slice(0, 100);

      const safeRef = sanitize(data.demande.reference || 'reference');
      const filename = `demande-prix-${safeRef}-${Date.now()}.pdf`;
      const filepath = path.join(pdfDir, filename);

      const doc = new PDFDocument({ 
        margin: 40,
        size: 'A4'
      });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      const ORANGE = '#E77131';
      const GRAY = '#666666';
      const BLACK = '#333333';
      const RED = '#DC2626';

      // ─── LOGO ENTREPRISE CLIENTE (DISTANT - CENTRÉ) ──────
      let logoLoaded = false;
      
      if (data.societe.logo) {
        try {
          const logoUrl = `${LOGO_BASE_URL}/${data.societe.logo}`;
          console.log(`📷 Tentative de chargement du logo: ${logoUrl}`);
          
          const response = await axios.get(logoUrl, {
            responseType: 'arraybuffer',
            timeout: 5000,
            validateStatus: (status) => status === 200
          });

          if (response.data) {
            const tempLogoPath = path.join(pdfDir, `temp-logo-${Date.now()}.png`);
            fs.writeFileSync(tempLogoPath, response.data);

            // ✅ Logo 60px large x 30px haut
            const logoWidth = 60;
            const logoHeight = 30;
            const logoX = (doc.page.width - logoWidth) / 2;
            const logoY = doc.y;  // Position actuelle
            
            doc.image(tempLogoPath, logoX, logoY, { 
              width: logoWidth,
              height: logoHeight
            });
            
            // ✅ IMPORTANT: Déplacer manuellement le curseur APRÈS l'image
            doc.y = logoY + logoHeight + 15;  // Logo + petit espace

            fs.unlinkSync(tempLogoPath);
            logoLoaded = true;
            console.log(`✅ Logo chargé avec succès`);
          }
        } catch (err: any) {
          console.warn(`⚠️ Impossible de charger le logo:`, err.message);
        }
      }

      // ✅ PLACEHOLDER SI PAS DE LOGO
      if (!logoLoaded) {
        console.log('📦 Utilisation du placeholder logo');
        const logoWidth = 60;
        const logoHeight = 60;
        const logoX = (doc.page.width - logoWidth) / 2;
        const logoY = doc.y;

        // Rectangle avec initiales de la société
        doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 6)
          .fillAndStroke('#F0F0F0', '#CCCCCC');

        // Initiales de la société
        const initiales = data.societe.name
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        doc.fontSize(24)
          .fillColor(ORANGE)
          .text(initiales, logoX, logoY + 18, {
            width: logoWidth,
            align: 'center'
          });

        // ✅ IMPORTANT: Déplacer manuellement le curseur APRÈS le placeholder
        doc.y = logoY + logoHeight + 15;
      }

      // ─── EN-TETE ─────────────────────────────────────────
      // ✅ Centre de la page (calculé une fois)
      const pageCenter = doc.page.width / 2;
      
      // ✅ TITRE CENTRÉ MANUELLEMENT
      doc.fontSize(22).fillColor(ORANGE);
      const titreText = 'DEMANDE DE PRIX';
      const titreWidth = doc.widthOfString(titreText);
      doc.text(titreText, pageCenter - titreWidth / 2, doc.y);
      doc.moveDown(1);
      
      // ✅ BLOC CENTRÉ MANUELLEMENT
      // Référence
      doc.fontSize(11).fillColor(GRAY);
      const refText = `Reference : ${data.demande.reference}`;
      const refWidth = doc.widthOfString(refText);
      doc.text(refText, pageCenter - refWidth / 2, doc.y);
      
      // Date
      const dateText = `Date : ${new Date(data.demande.date_creation).toLocaleDateString('fr-FR')}`;
      const dateWidth = doc.widthOfString(dateText);
      doc.text(dateText, pageCenter - dateWidth / 2, doc.y);

      // Date limite
      if (data.demande.date_limite_retour) {
        doc.fillColor(RED);
        const limiteText = `Date limite de retour : ${new Date(data.demande.date_limite_retour).toLocaleDateString('fr-FR')}`;
        const limiteWidth = doc.widthOfString(limiteText);
        doc.text(limiteText, pageCenter - limiteWidth / 2, doc.y);
      }

      doc.moveDown(1);

      // ─── URGENCE (CENTRÉE MANUELLEMENT) ───────────────────
      if (data.demande.urgence && data.demande.urgence !== 'normal') {
        const urgenceText = data.demande.urgence === 'tres_urgent'
          ? '!! TRES URGENT !!'
          : '! URGENT !';
        const urgenceColor = data.demande.urgence === 'tres_urgent' ? RED : '#F59E0B';
        doc.fontSize(13).fillColor(urgenceColor);
        const urgenceWidth = doc.widthOfString(urgenceText);
        doc.text(urgenceText, pageCenter - urgenceWidth / 2, doc.y);
        doc.moveDown(1.2);
      }

      doc.fillColor(BLACK);

      // ─── EMETTEUR (ALIGNÉ À GAUCHE X=40) ─────────────────
      doc.fontSize(13).fillColor(ORANGE).text('Emetteur', 40, doc.y, { underline: true });
      doc.moveDown(0.4);
      doc.fontSize(10).fillColor(BLACK)
        .text(`Societe : ${data.societe.name}`, 40)
        .text(`Contact : ${data.membre.prenom} ${data.membre.nom}`, 40)
        .text(`Email : ${data.membre.email}`, 40);
      if (data.societe.telephone)
        doc.text(`Telephone : ${data.societe.telephone}`, 40);
      if (data.societe.adresse)
        doc.text(`Adresse : ${data.societe.adresse}`, 40);
      doc.moveDown(1.2);

      // ─── LIVRAISON (ALIGNÉE À GAUCHE X=40) ───────────────
      doc.fontSize(13).fillColor(ORANGE).text('Livraison souhaitée', 40, doc.y, { underline: true });
      doc.moveDown(0.4);
      doc.fontSize(10).fillColor(BLACK);

      // ✅ Adaptation aux valeurs du frontend
      if (data.demande.adresse_livraison_type === 'retrait') {
        doc.text('Retrait en point de vente', 40);
      } else if (data.demande.adresse_livraison_type === 'siege') {
        doc.text('À mon siège', 40);
      } else if (data.demande.adresse_livraison_type === 'nouvelle') {
        doc.text(data.demande.adresse_livraison || 'Adresse non spécifiée', 40);
      } else {
        // Fallback pour les anciennes données (a_mon_siege, etc.)
        if (data.demande.adresse_livraison_type === 'retrait_point_vente') {
          doc.text('Retrait en point de vente', 40);
        } else if (data.demande.adresse_livraison_type === 'a_mon_siege') {
          doc.text('À mon siège', 40);
        } else if (data.demande.adresse_livraison_type === 'nouvelle_adresse') {
          doc.text(data.demande.adresse_livraison || 'Adresse non spécifiée', 40);
        } else {
          doc.text('À définir', 40);
        }
      }
      doc.moveDown(1.2);

      // ─── NOTE GENERALE (ALIGNÉE À GAUCHE X=40) ───────────
      if (data.demande.note_generale) {
        doc.fontSize(13).fillColor(ORANGE).text('Note generale', 40, doc.y, { underline: true });
        doc.moveDown(0.4);
        doc.fontSize(10).fillColor(BLACK).text(data.demande.note_generale, 40);
        doc.moveDown(1.2);
      }

      // ─── TABLEAU DES PRODUITS (ALIGNÉ À GAUCHE X=40) ─────
      doc.fontSize(13).fillColor(ORANGE).text('Produits demandes', 40, doc.y, { underline: true });
      doc.moveDown(0.8);

      const tableTop = doc.y;
      const headers = ['Qte', 'Produit', 'Unite', 'Specifications / Note'];
      const colWidths = [50, 200, 60, 235];
      const rowHeight = 20;
      let xPos = 40;

      doc.fontSize(9).fillColor(BLACK);
      headers.forEach((header, i) => {
        doc.rect(xPos, tableTop, colWidths[i], rowHeight)
          .fillAndStroke('#F0F0F0', '#CCCCCC');
        doc.fillColor(BLACK).text(header, xPos + 4, tableTop + 6, {
          width: colWidths[i] - 8,
          align: 'left'
        });
        xPos += colWidths[i];
      });

      let yPos = tableTop + rowHeight;

      data.lignes.forEach((ligne, idx) => {
        xPos = 40;
        const lineH = Math.max(
          rowHeight,
          doc.heightOfString(ligne.product_nom, { width: colWidths[1] - 8 }) + 10,
          doc.heightOfString(ligne.note_ligne || '', { width: colWidths[3] - 8 }) + 10
        );
        const bgColor = idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA';
        const rowData = [
          String(ligne.quantite),
          ligne.product_nom,
          ligne.product_unite || '',
          ligne.note_ligne || ''
        ];
        rowData.forEach((cell, i) => {
          doc.rect(xPos, yPos, colWidths[i], lineH)
            .fillAndStroke(bgColor, '#CCCCCC');
          doc.fillColor(BLACK).fontSize(9).text(cell, xPos + 4, yPos + 5, {
            width: colWidths[i] - 8,
            align: i === 0 ? 'center' : 'left'
          });
          xPos += colWidths[i];
        });
        yPos += lineH;
      });

      // ─── PIECES JOINTES (ALIGNÉES À GAUCHE) ──────────────
      if (data.pieces_jointes && data.pieces_jointes.length > 0) {
        doc.moveDown(3);
        doc.fontSize(13).fillColor(ORANGE).text('Pieces jointes', 40, doc.y, { underline: true });
        doc.moveDown(0.5);

        data.pieces_jointes.forEach((pj, index) => {
          const fileUrl = `${BASE_URL}/pieces-jointes/${pj.filename_stocke}`;
          
          const xStart = 40;
          const currentY = doc.y;
          
          // Numéro + nom du fichier
          doc.fontSize(10).fillColor(BLACK)
            .text(`${index + 1}. ${pj.filename_original}`, xStart, currentY, {
              continued: false
            });
          
          // Lien [Télécharger] en dessous
          doc.fillColor('#1a56db')
            .text(`    [Telecharger]`, xStart, doc.y, {
              link: fileUrl,
              underline: true,
              continued: false
            });

          doc.fillColor(BLACK);
          doc.moveDown(0.8);
        });

        doc.moveDown(0.5);
        doc.fontSize(9).fillColor(GRAY)
          .text(
            'Cliquez sur "Telecharger" pour acceder a chaque piece jointe.',
            40,
            doc.y,
            { align: 'left' }
          );
      }

      // ─── PIED DE PAGE (À GAUCHE) ─────────────────────────
      doc.moveDown(3);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#DDDDDD').stroke();
      doc.moveDown(0.5);
      doc.fontSize(9).fillColor(GRAY)
        .text(
          'Cette demande de prix vous est envoyee depuis Solutravo, logiciel dedie aux pros du batiment.',
          40,
          doc.y,
          { align: 'left' }
        )
        .text(
          'Rejoignez notre reseau de fournisseurs partenaires et simplifiez la vie de vos clients.',
          40,
          doc.y,
          { align: 'left' }
        );

      doc.end();
      stream.on('finish', () => resolve(filepath));
      stream.on('error', (err) => reject(err));

    } catch (error) {
      reject(error);
    }
  });
}