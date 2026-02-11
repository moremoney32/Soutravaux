// ============================================================
// FICHIER 3 : src/cron/relancesCron.ts
// 
// Ce CRON vérifie chaque jour à 8h00 les relances à envoyer
// et expédie les emails correspondants.
//
// INSTALLATION : npm install node-cron
// ENREGISTREMENT dans app.ts ou server.ts :
//   import './cron/relancesCron';
// ============================================================

import cron from 'node-cron';
import { getRelancesAEnvoyer, marquerRelanceEnvoyee, getDemandeForPDF } from '../services/DemandesPrixServices';
import { sendDemandePrixEmail } from '../helpers/emailSender';
import { generateDemandePrixPDF } from '../helpers/pdfGenerator';

// ── Fonction principale de traitement des relances ──────────
export async function traiterRelances(): Promise<void> {
  console.log('⏰ CRON relances — démarrage:', new Date().toISOString());

  try {
    const relances = await getRelancesAEnvoyer();

    if (relances.length === 0) {
      console.log('✅ Aucune relance à envoyer aujourd\'hui');
      return;
    }

    console.log(`📋 ${relances.length} relance(s) à traiter`);

    for (const relance of relances) {
      try {
        // Récupérer les données PDF de la demande
        const pdfData = await getDemandeForPDF(relance.demande_prix_id);
        const pdfPath = await generateDemandePrixPDF(pdfData);

        // Envoyer à chaque destinataire qui n'a pas encore répondu
        let nbEnvoyes = 0;
        for (const dest of relance.destinataires) {
          if (!dest.email_envoye_a) continue;

          const ok = await sendDemandePrixEmail({
            to: dest.email_envoye_a,
            recipientName: dest.nom_affiche || 'Fournisseur',
            reference: relance.reference,
            pdfPath,
            societe: {
              name: relance.societe_name,
              email: relance.societe_email
            },
            membre: {
              prenom: relance.membre_prenom,
              nom: relance.membre_nom,
              email: relance.membre_email
            },
            urgence: relance.urgence,
            date_limite_retour: pdfData.demande.date_limite_retour,
            isRelance: true   // ← indique que c'est une relance → template différent
          });

          if (ok) nbEnvoyes++;
        }

        // Marquer la relance comme envoyée en BDD
        await marquerRelanceEnvoyee(relance.id);

        console.log(`✅ Relance #${relance.id} — demande "${relance.reference}" — ${nbEnvoyes} email(s) envoyé(s)`);

      } catch (err: any) {
        // Ne pas bloquer les autres relances si une échoue
        console.error(`❌ Échec relance #${relance.id}:`, err.message);
      }
    }

  } catch (err: any) {
    console.error('❌ Erreur CRON relances:', err.message);
  }
}

// ── Planification : tous les jours à 8h00 ───────────────────
// Format cron : seconde(opt) minute heure jour mois jourSemaine
cron.schedule('0 8 * * *', async () => {
  await traiterRelances();
}, {
  timezone: 'Europe/Paris'
});

console.log('🕐 CRON relances planifié — exécution quotidienne à 8h00 (Paris)');

// // ── Export pour test manuel depuis une route admin ───────────
// export { traiterRelances };