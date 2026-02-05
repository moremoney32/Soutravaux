

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { DemandePrixPDFData } from '../types/demandesPrix';

export async function generateDemandePrixPDF(data: DemandePrixPDFData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const pdfDir = path.join(__dirname, '../../storage/pdfs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const sanitizeFileName = (name: string) => {
        if (!name) return '';
        return name.toString().normalize('NFKD')
          .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
          .slice(0, 100);
      };

      const safeRef = sanitizeFileName(data.demande.reference || `reference`);
      const filename = `demande-prix-${safeRef}-${Date.now()}.pdf`;
      const filepath = path.join(pdfDir, filename);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // EN-TÊTE
      doc.fontSize(20).text('DEMANDE DE PRIX', { align: 'center' }).moveDown();
      doc.fontSize(12)
        .text(`Référence : ${data.demande.reference}`, { align: 'center' })
        .text(`Date : ${new Date(data.demande.date_creation).toLocaleDateString('fr-FR')}`, { align: 'center' })
        .moveDown(2);

      // ÉMETTEUR
      doc.fontSize(14).text('Émetteur :', { underline: true }).moveDown(0.5);
      doc.fontSize(10)
        .text(`Société : ${data.societe.name}`)
        .text(`Adresse : ${data.societe.adresse || 'N/A'}`)
        .text(`Email : ${data.societe.email || 'N/A'}`)
        .text(`Téléphone : ${data.societe.telephone || 'N/A'}`)
        .moveDown();

      // ✅ CORRECTION : "Nom :" au lieu de "Contact :"
      doc.text(`Nom : ${data.membre.prenom} ${data.membre.nom}`)
        .text(`Email : ${data.membre.email}`)
        .moveDown(2);

      // ADRESSE LIVRAISON
      if (data.demande.adresse_livraison_type === 'nouvelle' && data.demande.adresse_livraison) {
        doc.fontSize(14).text('Adresse de livraison :', { underline: true }).moveDown(0.5);
        doc.fontSize(10).text(data.demande.adresse_livraison).moveDown(2);
      } else {
        doc.fontSize(14).text('Adresse de livraison :', { underline: true }).moveDown(0.5);
        doc.fontSize(10).text(data.societe.adresse || 'Adresse non renseignée').moveDown(2);
      }

      // URGENCE
      if (data.demande.urgence !== 'normal') {
        const urgenceText = data.demande.urgence === 'urgent' ? 'URGENT' : 'TRÈS URGENT';
        doc.fontSize(12).fillColor('red')
          .text(`⚠️ ${urgenceText}`, { align: 'center' })
          .fillColor('black').moveDown(2);
      }

      // NOTE GÉNÉRALE
      if (data.demande.note_generale) {
        doc.fontSize(14).text('Note générale :', { underline: true }).moveDown(0.5);
        doc.fontSize(10).text(data.demande.note_generale).moveDown(2);
      }

      // TABLEAU
      doc.fontSize(14).text('Produits demandés :', { underline: true }).moveDown(1);

      const tableTop = doc.y;
      const tableHeaders = ['Qté', 'Référence', 'Produit', 'Note', 'Prix Unit.', 'Total'];
      const colWidths = [40, 100, 160, 100, 80, 80];
      let xPos = 50;

      doc.fontSize(10).fillColor('black');

      // En-têtes
      tableHeaders.forEach((header, i) => {
        doc.rect(xPos, tableTop, colWidths[i], 20)
          .fillAndStroke('#eeeeee', '#000000')
          .fillColor('black')
          .text(header, xPos + 5, tableTop + 5, { width: colWidths[i] - 10, align: 'left' });
        xPos += colWidths[i];
      });

      let yPos = tableTop + 20;

      // ✅ LIGNES DE PRODUITS CORRIGÉES
      data.lignes.forEach((ligne) => {
        xPos = 50;

        const unitPrice = Number(ligne.public_price) || 0;
        const total = Number(ligne.quantite) * unitPrice;

        // Extraction de la référence et de la note
        let referenceToDisplay = ligne.supplier_reference || '';
        let noteToDisplay = ligne.note_ligne || '';

        if (ligne.note_ligne && ligne.note_ligne.includes(' — ')) {
          const parts = ligne.note_ligne.split(' — ');
          referenceToDisplay = parts[0].trim();
          noteToDisplay = parts.slice(1).join(' — ').trim();
        }

        const row = [
          ligne.quantite.toString(),
          referenceToDisplay,
          ligne.product_name,
          noteToDisplay,
          `${unitPrice.toFixed(2)} €`,
          `${total.toFixed(2)} €`
        ];

        // Calculer la hauteur de la ligne (en cas de texte long)
        const lineHeight = Math.max(
          20,
          doc.heightOfString(ligne.product_name, { width: colWidths[2] - 10 }) + 10,
          doc.heightOfString(noteToDisplay, { width: colWidths[3] - 10 }) + 10
        );

        row.forEach((cell, i) => {
          doc.rect(xPos, yPos, colWidths[i], lineHeight).stroke();
          doc.text(cell, xPos + 5, yPos + 5, {
            width: colWidths[i] - 10,
            align: i >= 4 ? 'right' : 'left'
          });
          xPos += colWidths[i];
        });

        yPos += lineHeight;

        doc.fontSize(10).fillColor('black');
      });

      // PIED DE PAGE
      doc.moveDown(3).fontSize(9).fillColor('gray')
        .text('Ce document est une demande de prix et ne constitue pas un bon de commande.', {
          align: 'center',
          width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
          lineBreak: true
        })
        .text('Merci de nous transmettre votre devis dans les meilleurs délais.', {
          align: 'center',
          width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
          lineBreak: true
        });

      doc.end();

      stream.on('finish', () => resolve(filepath));
      stream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}