


// import PDFDocument from 'pdfkit';
// import fs from 'fs';
// import path from 'path';
// import { DemandePrixPDFData } from '../types/demandesPrix';

// export async function generateDemandePrixPDF(
//   data: DemandePrixPDFData
// ): Promise<string> {
//   return new Promise((resolve, reject) => {
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

//       const doc = new PDFDocument({ margin: 50 });
//       const stream = fs.createWriteStream(filepath);
//       doc.pipe(stream);

//       const ORANGE = '#E77131';
//       const GRAY = '#666666';
//       const BLACK = '#333333';

//       // ─── EN-TÊTE ─────────────────────────────────────────
//       doc.fontSize(22).fillColor(ORANGE)
//         .text('DEMANDE DE PRIX', { align: 'center' });
//       doc.moveDown(0.5);
//       doc.fontSize(11).fillColor(GRAY)
//         .text(`Référence : ${data.demande.reference}`, { align: 'center' })
//         .text(
//           `Date : ${new Date(data.demande.date_creation).toLocaleDateString('fr-FR')}`,
//           { align: 'center' }
//         );

//       if (data.demande.date_limite_retour) {
//         doc.fontSize(11).fillColor('#DC2626')
//           .text(
//             `Date limite de retour : ${new Date(data.demande.date_limite_retour)
//               .toLocaleDateString('fr-FR')}`,
//             { align: 'center' }
//           );
//       }

//       doc.moveDown(1.5);

//       // ─── URGENCE ─────────────────────────────────────────
//       if (data.demande.urgence !== 'normal') {
//         const urgenceText =
//           data.demande.urgence === 'tres_urgent' ? '🔴 TRÈS URGENT' : '⚠️ URGENT';
//         doc.fontSize(13).fillColor(
//           data.demande.urgence === 'tres_urgent' ? '#DC2626' : '#F59E0B'
//         ).text(urgenceText, { align: 'center' });
//         doc.moveDown(1);
//       }

//       doc.fillColor(BLACK);

//       // ─── ÉMETTEUR ────────────────────────────────────────
//       doc.fontSize(13).fillColor(ORANGE).text('Émetteur', { underline: true });
//       doc.moveDown(0.4);
//       doc.fontSize(10).fillColor(BLACK)
//         .text(`Société : ${data.societe.name}`)
//         .text(`Contact : ${data.membre.prenom} ${data.membre.nom}`)
//         .text(`Email : ${data.membre.email}`);
//       if (data.societe.telephone)
//         doc.text(`Téléphone : ${data.societe.telephone}`);
//       if (data.societe.adresse)
//         doc.text(`Adresse : ${data.societe.adresse}`);
//       doc.moveDown(1.2);

//       // ─── LIVRAISON ───────────────────────────────────────
//       doc.fontSize(13).fillColor(ORANGE).text('Adresse de livraison', { underline: true });
//       doc.moveDown(0.4);
//       doc.fontSize(10).fillColor(BLACK);

//       if (data.demande.adresse_livraison_type === 'retrait_point_vente') {
//         doc.text('Retrait en point de vente');
//       } else if (
//         data.demande.adresse_livraison_type === 'nouvelle_adresse' &&
//         data.demande.adresse_livraison
//       ) {
//         doc.text(data.demande.adresse_livraison);
//       } else {
//         doc.text(data.societe.adresse || 'À mon siège');
//       }
//       doc.moveDown(1.2);

//       // ─── NOTE GÉNÉRALE ───────────────────────────────────
//       if (data.demande.note_generale) {
//         doc.fontSize(13).fillColor(ORANGE).text('Note générale', { underline: true });
//         doc.moveDown(0.4);
//         doc.fontSize(10).fillColor(BLACK).text(data.demande.note_generale);
//         doc.moveDown(1.2);
//       }

//       // ─── TABLEAU DES PRODUITS ────────────────────────────
//       doc.fontSize(13).fillColor(ORANGE).text('Produits demandés', { underline: true });
//       doc.moveDown(0.8);

//       const tableTop = doc.y;
//       // Colonnes : Qté | Produit | Unité | Note/Spécifications | Prix Unit. HT | Total HT
//       const headers = ['Qté', 'Produit', 'Unité', 'Spécifications / Note', 'Prix Unit. HT', 'Total HT'];
//       const colWidths = [40, 150, 45, 150, 80, 80];
//       const rowHeight = 20;
//       let xPos = 50;

//       // En-têtes du tableau
//       doc.fontSize(9).fillColor(BLACK);
//       headers.forEach((header, i) => {
//         doc
//           .rect(xPos, tableTop, colWidths[i], rowHeight)
//           .fillAndStroke('#F0F0F0', '#CCCCCC');
//         doc.fillColor(BLACK).text(
//           header,
//           xPos + 4,
//           tableTop + 6,
//           { width: colWidths[i] - 8, align: 'left' }
//         );
//         xPos += colWidths[i];
//       });

//       let yPos = tableTop + rowHeight;

//       // Lignes produits - SANS PRIX (colonnes vides)
//       data.lignes.forEach((ligne, idx) => {
//         xPos = 50;

//         // Calculer hauteur dynamique
//         const lineH = Math.max(
//           rowHeight,
//           doc.heightOfString(ligne.product_nom, { width: colWidths[1] - 8 }) + 10,
//           doc.heightOfString(ligne.note_ligne || '', { width: colWidths[3] - 8 }) + 10
//         );

//         // Fond alterné
//         const bgColor = idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA';

//         const rowData = [
//           ligne.quantite.toString(),
//           ligne.product_nom,
//           ligne.product_unite || '',
//           ligne.note_ligne || '',
//           '',  // Prix vide → à remplir par le fournisseur
//           ''   // Total vide → à remplir par le fournisseur
//         ];

//         rowData.forEach((cell, i) => {
//           doc.rect(xPos, yPos, colWidths[i], lineH)
//             .fillAndStroke(bgColor, '#CCCCCC');
//           doc.fillColor(BLACK).fontSize(9).text(
//             cell,
//             xPos + 4,
//             yPos + 5,
//             { width: colWidths[i] - 8, align: i === 0 ? 'center' : 'left' }
//           );
//           xPos += colWidths[i];
//         });

//         yPos += lineH;
//       });

//       // Ligne total
//       doc.moveDown(0.5);
//       doc.fontSize(10).fillColor(GRAY).text(
//         '⚠️ Les colonnes Prix Unit. HT et Total HT sont à compléter par le fournisseur.',
//         50,
//         yPos + 10
//       );

//       // ─── PIÈCES JOINTES ──────────────────────────────────
//       if (data.pieces_jointes && data.pieces_jointes.length > 0) {
//         doc.moveDown(2);
//         doc.fontSize(13).fillColor(ORANGE).text('Pièces jointes', { underline: true });
//         doc.moveDown(0.4);
//         data.pieces_jointes.forEach(pj => {
//           doc.fontSize(10).fillColor(BLACK)
//             .text(`📎 ${pj.filename_original}`);
//         });
//       }

//       // ─── PIED DE PAGE SOLUTRAVO ──────────────────────────
//       doc.moveDown(3);
//       doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#DDDDDD').stroke();
//       doc.moveDown(0.5);
//       doc.fontSize(9).fillColor(GRAY)
//         .text(
//           'Cette demande de prix vous est envoyée depuis Solutravo, logiciel dédié aux pros du bâtiment.',
//           { align: 'center' }
//         )
//         .text(
//           'Rejoignez notre réseau de fournisseurs partenaires et simplifiez la vie de vos clients.',
//           { align: 'center' }
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
import { DemandePrixPDFData } from '../types/demandesPrix';


//const BASE_URL = process.env.PDF_BASE_URL || 'http://localhost:3000';
const BASE_URL = process.env.PDF_BASE_URL || 'https://staging.solutravo.zeta-app.fr';

export async function generateDemandePrixPDF(
  data: DemandePrixPDFData
): Promise<string> {
  return new Promise((resolve, reject) => {
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

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      const ORANGE = '#E77131';
      const GRAY = '#666666';
      const BLACK = '#333333';
      const RED = '#DC2626';

      // ─── EN-TETE ─────────────────────────────────────────
      doc.fontSize(22).fillColor(ORANGE)
        .text('DEMANDE DE PRIX', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor(GRAY)
        .text(`Reference : ${data.demande.reference}`, { align: 'center' })
        .text(
          `Date : ${new Date(data.demande.date_creation).toLocaleDateString('fr-FR')}`,
          { align: 'center' }
        );

      if (data.demande.date_limite_retour) {
        doc.fontSize(11).fillColor(RED)
          .text(
            `Date limite de retour : ${new Date(data.demande.date_limite_retour).toLocaleDateString('fr-FR')}`,
            { align: 'center' }
          );
      }

      doc.moveDown(1.5);

      // ─── URGENCE ─────────────────────────────────────────
      if (data.demande.urgence && data.demande.urgence !== 'normal') {
        const urgenceText = data.demande.urgence === 'tres_urgent'
          ? '!! TRES URGENT !!'
          : '! URGENT !';
        const urgenceColor = data.demande.urgence === 'tres_urgent' ? RED : '#F59E0B';
        doc.fontSize(13).fillColor(urgenceColor)
          .text(urgenceText, { align: 'center' });
        doc.moveDown(1);
      }

      doc.fillColor(BLACK);

      // ─── EMETTEUR ────────────────────────────────────────
      doc.fontSize(13).fillColor(ORANGE).text('Emetteur', { underline: true });
      doc.moveDown(0.4);
      doc.fontSize(10).fillColor(BLACK)
        .text(`Societe : ${data.societe.name}`)
        .text(`Contact : ${data.membre.prenom} ${data.membre.nom}`)
        .text(`Email : ${data.membre.email}`);
      if (data.societe.telephone)
        doc.text(`Telephone : ${data.societe.telephone}`);
      if (data.societe.adresse)
        doc.text(`Adresse : ${data.societe.adresse}`);
      doc.moveDown(1.2);

      // ─── LIVRAISON ───────────────────────────────────────
      
            doc.fontSize(13).fillColor(ORANGE).text('Adresse de livraison', { underline: true });
      doc.moveDown(0.4);
      doc.fontSize(10).fillColor(BLACK);

      if (data.demande.adresse_livraison_type === 'retrait_point_vente') {
        doc.text('Retrait en point de vente');
      } else if (
        data.demande.adresse_livraison_type === 'nouvelle_adresse' &&
        data.demande.adresse_livraison
      ) {
        doc.text(data.demande.adresse_livraison);
      } else {
        doc.text(data.societe.adresse || 'À mon siège');
      }
      doc.moveDown(1.2);

      // ─── NOTE GENERALE ───────────────────────────────────
      if (data.demande.note_generale) {
        doc.fontSize(13).fillColor(ORANGE).text('Note generale', { underline: true });
        doc.moveDown(0.4);
        doc.fontSize(10).fillColor(BLACK).text(data.demande.note_generale);
        doc.moveDown(1.2);
      }

      // ─── TABLEAU DES PRODUITS ────────────────────────────
      doc.fontSize(13).fillColor(ORANGE).text('Produits demandes', { underline: true });
      doc.moveDown(0.8);

      const tableTop = doc.y;
      const headers = ['Qte', 'Produit', 'Unite', 'Specifications / Note', 'Prix Unit. HT', 'Total HT'];
      const colWidths = [40, 150, 45, 150, 80, 80];
      const rowHeight = 20;
      let xPos = 50;

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
        xPos = 50;
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
          ligne.note_ligne || '',
          '',
          ''
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

      // ✅ Texte sans emoji
      doc.fontSize(9).fillColor(GRAY)
        .text(
          'Note : Les colonnes Prix Unit. HT et Total HT sont a completer par le fournisseur.',
          50,
          yPos + 10
        );

      // ─── PIECES JOINTES ──────────────────────────────────
      if (data.pieces_jointes && data.pieces_jointes.length > 0) {
        doc.moveDown(3);
        doc.fontSize(13).fillColor(ORANGE).text('Pieces jointes', { underline: true });
        doc.moveDown(0.5);

        data.pieces_jointes.forEach((pj, index) => {
          // URL publique du fichier sur le serveur
          const fileUrl = `${BASE_URL}/pieces-jointes/${pj.filename_stocke}`;

          doc.fontSize(10).fillColor(BLACK)
            .text(`${index + 1}. ${pj.filename_original}`, {
              continued: true
            })
            .fillColor('#1a56db')   // bleu lien
            .text(`  [Telecharger]`, {
              link: fileUrl,
              underline: true
            });

          doc.fillColor(BLACK);
          doc.moveDown(0.3);
        });

        doc.moveDown(0.5);
        doc.fontSize(9).fillColor(GRAY)
          .text(
            'Cliquez sur "Telecharger" pour acceder a chaque piece jointe.',
            { align: 'left' }
          );
      }

      // ─── PIED DE PAGE ────────────────────────────────────
      doc.moveDown(3);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#DDDDDD').stroke();
      doc.moveDown(0.5);
      doc.fontSize(9).fillColor(GRAY)
        .text(
          'Cette demande de prix vous est envoyee depuis Solutravo, logiciel dedie aux pros du batiment.',
          { align: 'center' }
        )
        .text(
          'Rejoignez notre reseau de fournisseurs partenaires et simplifiez la vie de vos clients.',
          { align: 'center' }
        );

      doc.end();
      stream.on('finish', () => resolve(filepath));
      stream.on('error', (err) => reject(err));

    } catch (error) {
      reject(error);
    }
  });
}




// import PDFDocument from 'pdfkit';
// import fs from 'fs';
// import path from 'path';
// import https from 'https';
// import http from 'http';
// import { DemandePrixPDFData } from '../types/demandesPrix';

// const BASE_URL       = process.env.PDF_BASE_URL  || 'http://localhost:3000';
// const LOGO_BASE_URL  = process.env.LOGO_BASE_URL || 'https://staging.solutravo-compta.fr/public';
// const SOLUTRAVO_LOGO = path.join(__dirname, '../assets/solutravo.png');

// function downloadImageBuffer(url: string): Promise<Buffer> {
//   return new Promise((resolve, reject) => {
//     const client = url.startsWith('https') ? https : http;
//     client.get(url, (res) => {
//       if (res.statusCode !== 200) {
//         reject(new Error(`Image non accessible: ${res.statusCode}`));
//         return;
//       }
//       const chunks: Buffer[] = [];
//       res.on('data', (c) => chunks.push(c));
//       res.on('end',  () => resolve(Buffer.concat(chunks)));
//       res.on('error', reject);
//     }).on('error', reject);
//   });
// }

// export async function generateDemandePrixPDF(data: DemandePrixPDFData): Promise<string> {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const pdfDir = path.join(__dirname, '../../storage/pdfs');
//       if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

//       const sanitize = (n: string) =>
//         (n || '').normalize('NFKD')
//           .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
//           .replace(/\s+/g, '-').replace(/-+/g, '-').trim().slice(0, 100);

//       const filename = `demande-prix-${sanitize(data.demande.reference)}-${Date.now()}.pdf`;
//       const filepath = path.join(pdfDir, filename);

//       const doc    = new PDFDocument({ margin: 50 });
//       const stream = fs.createWriteStream(filepath);
//       doc.pipe(stream);

//       const ORANGE = '#E77131';
//       const GRAY   = '#666666';
//       const BLACK  = '#333333';
//       const RED    = '#DC2626';
//       const MARGIN = 50;

//       // ── Charger logo société (distant) ──────────────────────
//       let societeLogo: Buffer | null = null;
//       if (data.societe.logo) {
//         try {
//           societeLogo = await downloadImageBuffer(`${LOGO_BASE_URL}/${data.societe.logo}`);
//         } catch (e) {
//           console.warn('Logo societe non charge:', e);
//         }
//       }
//       const hasSolutravoLogo = fs.existsSync(SOLUTRAVO_LOGO);

//       // ────────────────────────────────────────────────────────
//       // EN-TETE : fond blanc, logos + titre orange
//       // [logo Solutravo gauche] [DEMANDE DE PRIX centre] [logo société droite]
//       // ────────────────────────────────────────────────────────
//       const LOGO_SIZE = 55;
//       const LOGO_Y    = 35;

//       // Logo Solutravo — gauche
//       if (hasSolutravoLogo) {
//         try {
//           doc.image(SOLUTRAVO_LOGO, MARGIN, LOGO_Y, { fit: [LOGO_SIZE, LOGO_SIZE] });
//         } catch (e) { console.warn('Logo Solutravo erreur:', e); }
//       }

//       // Logo société — droite
//       if (societeLogo) {
//         try {
//           doc.image(societeLogo, doc.page.width - MARGIN - LOGO_SIZE, LOGO_Y, {
//             fit: [LOGO_SIZE, LOGO_SIZE]
//           });
//         } catch (e) { console.warn('Logo societe erreur:', e); }
//       }

//       // Titre centré
//       doc.fontSize(22).fillColor(ORANGE)
//         .text('DEMANDE DE PRIX', 0, LOGO_Y + 12, { align: 'center', width: doc.page.width });

//       doc.y = LOGO_Y + LOGO_SIZE + 15;
//       doc.moveDown(0.3);

//       // Ligne séparatrice sous l'en-tête
//       doc.moveTo(MARGIN, doc.y)
//         .lineTo(doc.page.width - MARGIN, doc.y)
//         .strokeColor('#DDDDDD').lineWidth(1).stroke();
//       doc.moveDown(0.8);

//       // ── Référence / Date / Date limite ──────────────────────
//       doc.fontSize(11).fillColor(GRAY)
//         .text(`Reference : ${data.demande.reference}`, { align: 'center' })
//         .text(`Date : ${new Date(data.demande.date_creation).toLocaleDateString('fr-FR')}`, { align: 'center' });

//       if (data.demande.date_limite_retour) {
//         doc.fontSize(11).fillColor(RED)
//           .text(
//             `Date limite de retour : ${new Date(data.demande.date_limite_retour).toLocaleDateString('fr-FR')}`,
//             { align: 'center' }
//           );
//       }
//       doc.moveDown(1.5);

//       // ── Urgence ─────────────────────────────────────────────
//       if (data.demande.urgence && data.demande.urgence !== 'normal') {
//         const urgenceText  = data.demande.urgence === 'tres_urgent' ? '!! TRES URGENT !!' : '! URGENT !';
//         const urgenceColor = data.demande.urgence === 'tres_urgent' ? RED : '#F59E0B';
//         doc.fontSize(13).fillColor(urgenceColor).text(urgenceText, { align: 'center' });
//         doc.moveDown(1);
//       }

//       doc.fillColor(BLACK);

//       // ── Emetteur ────────────────────────────────────────────
//       doc.fontSize(13).fillColor(ORANGE).text('Emetteur', { underline: true });
//       doc.moveDown(0.4);
//       doc.fontSize(10).fillColor(BLACK)
//         .text(`Societe : ${data.societe.name}`)
//         .text(`Contact : ${data.membre.prenom} ${data.membre.nom}`)
//         .text(`Email : ${data.membre.email}`);
//       if (data.societe.telephone) doc.text(`Telephone : ${data.societe.telephone}`);
//       if (data.societe.adresse)   doc.text(`Adresse : ${data.societe.adresse}`);
//       doc.moveDown(1.2);

//       // ── Adresse de livraison ─────────────────────────────────
//                   doc.fontSize(13).fillColor(ORANGE).text('Adresse de livraison', { underline: true });
//       doc.moveDown(0.4);
//       doc.fontSize(10).fillColor(BLACK);

//       if (data.demande.adresse_livraison_type === 'retrait_point_vente') {
//         doc.text('Retrait en point de vente');
//       } else if (
//         data.demande.adresse_livraison_type === 'nouvelle_adresse' &&
//         data.demande.adresse_livraison
//       ) {
//         doc.text(data.demande.adresse_livraison);
//       } else {
//         doc.text(data.societe.adresse || 'À mon siège');
//       }
//       doc.moveDown(1.2);

//       // ── Note générale ────────────────────────────────────────
//       if (data.demande.note_generale) {
//         doc.fontSize(13).fillColor(ORANGE).text('Note generale', { underline: true });
//         doc.moveDown(0.4);
//         doc.fontSize(10).fillColor(BLACK).text(data.demande.note_generale);
//         doc.moveDown(1.2);
//       }

//       // ── Tableau produits ─────────────────────────────────────
//       doc.fontSize(13).fillColor(ORANGE).text('Produits demandes', { underline: true });
//       doc.moveDown(0.8);

//       const tableTop  = doc.y;
//       const headers   = ['Qte', 'Produit', 'Unite', 'Specifications / Note', 'Prix Unit. HT', 'Total HT'];
//       const colWidths = [40, 150, 45, 150, 80, 80];
//       const rowH      = 20;
//       let xPos        = MARGIN;

//       doc.fontSize(9).fillColor(BLACK);
//       headers.forEach((h, i) => {
//         doc.rect(xPos, tableTop, colWidths[i], rowH).fillAndStroke('#F0F0F0', '#CCCCCC');
//         doc.fillColor(BLACK).text(h, xPos + 4, tableTop + 6, { width: colWidths[i] - 8 });
//         xPos += colWidths[i];
//       });

//       let yPos = tableTop + rowH;

//       data.lignes.forEach((ligne, idx) => {
//         xPos = MARGIN;
//         const lineH = Math.max(
//           rowH,
//           doc.heightOfString(ligne.product_nom,    { width: colWidths[1] - 8 }) + 10,
//           doc.heightOfString(ligne.note_ligne || '', { width: colWidths[3] - 8 }) + 10
//         );
//         const bgColor = idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA';
//         [String(ligne.quantite), ligne.product_nom, ligne.product_unite || '',
//          ligne.note_ligne || '', '', ''].forEach((cell, i) => {
//           doc.rect(xPos, yPos, colWidths[i], lineH).fillAndStroke(bgColor, '#CCCCCC');
//           doc.fillColor(BLACK).fontSize(9).text(cell, xPos + 4, yPos + 5, {
//             width: colWidths[i] - 8,
//             align: i === 0 ? 'center' : undefined
//           });
//           xPos += colWidths[i];
//         });
//         yPos += lineH;
//       });

//       doc.fontSize(9).fillColor(GRAY)
//         .text('Note : Les colonnes Prix Unit. HT et Total HT sont a completer par le fournisseur.', MARGIN, yPos + 10);
//       doc.y = yPos + 26;

//       // ── Pièces jointes ───────────────────────────────────────
//       if (data.pieces_jointes && data.pieces_jointes.length > 0) {
//         doc.moveDown(1);
//         doc.fontSize(13).fillColor(ORANGE).text('Pieces jointes', { underline: true });
//         doc.moveDown(0.5);
//         data.pieces_jointes.forEach((pj, index) => {
//           const fileUrl = `${BASE_URL}/pieces-jointes/${pj.filename_stocke}`;
//           doc.fontSize(10).fillColor(BLACK)
//             .text(`${index + 1}. ${pj.filename_original}  `, { continued: true })
//             .fillColor('#1a56db')
//             .text('[Telecharger]', { link: fileUrl, underline: true });
//           doc.fillColor(BLACK).moveDown(0.3);
//         });
//         doc.fontSize(9).fillColor(GRAY)
//           .text('Cliquez sur [Telecharger] pour acceder a chaque piece jointe.');
//         doc.moveDown(1);
//       }

//       // ── Pied de page Solutravo ───────────────────────────────
//       doc.moveDown(2);
//       doc.moveTo(MARGIN, doc.y)
//         .lineTo(doc.page.width - MARGIN, doc.y)
//         .strokeColor('#DDDDDD').lineWidth(1).stroke();
//       doc.moveDown(0.5);

//       // Bloc mise en avant Solutravo avec logo
//       const footerLogoY = doc.y;
//       if (hasSolutravoLogo) {
//         try {
//           doc.image(SOLUTRAVO_LOGO, MARGIN, footerLogoY, { fit: [35, 35] });
//         } catch (e) { /* ignore */ }
//       }

//       doc.fontSize(9).fillColor(ORANGE)
//         .text('Optimisez vos achats avec Solutravo', MARGIN + 45, footerLogoY, {
//           width: doc.page.width - 2 * MARGIN - 45
//         });
//       doc.fontSize(8).fillColor(GRAY)
//         .text(
//           'Solutravo est le logiciel dedie aux professionnels du batiment. Rejoignez notre reseau de fournisseurs partenaires.',
//           MARGIN + 45, footerLogoY + 14,
//           { width: doc.page.width - 2 * MARGIN - 45 }
//         );
//       doc.fontSize(8).fillColor('#1a56db')
//         .text('www.solutravo.fr', MARGIN + 45, footerLogoY + 26, {
//           link: 'https://www.solutravo.fr', underline: true
//         });

//       doc.end();
//       stream.on('finish', () => resolve(filepath));
//       stream.on('error',  (err) => reject(err));

//     } catch (error) {
//       reject(error);
//     }
//   });
// }