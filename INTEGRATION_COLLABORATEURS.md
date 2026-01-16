// INTÉGRATION DANS GoogleCalendar.tsx

/**
 * ÉTAPES POUR INTÉGRER LE SYSTÈME DE COLLABORATEURS
 */

// 1. IMPORTER LES NOUVELLES FONCTIONS
import { 
  inviteCollaborators,  // ← NOUVELLE
  fetchCollaborators     // ← NOUVELLE
} from '../services/calendarApi';
import InviteAttendeesModal from './InvitesAttentesModal';

// 2. AJOUTER UN STATE POUR LE MODE INVITATION (si pas déjà présent)
const [invitationMode, setInvitationMode] = useState<'societes' | 'collaborators'>('collaborators');

// 3. HANDLER POUR INVITER LES COLLABORATEURS
const handleInviteCollaborators = async (memberIds: number[]): Promise<void> => {
  try {
    if (!selectedEventId) {
      alert('Veuillez sélectionner un événement');
      return;
    }

    const eventIdNum = parseInt(selectedEventId, 10);
    
    // Appeler l'API pour inviter les collaborateurs
    await inviteCollaborators(eventIdNum, memberIds);
    
    console.log(`✅ ${memberIds.length} collaborateurs invités`);
    alert(`${memberIds.length} collaborateurs invités avec succès!`);
    
    // Fermer la modal
    setShowInviteModal(false);
    
    // Optionnel: Rafraîchir les événements
    // await loadEvents();
  } catch (error) {
    console.error('❌ Erreur invitation collaborateurs:', error);
    alert('Erreur lors de l\'envoi des invitations aux collaborateurs');
  }
};

// 4. UTILISER LE COMPOSANT MODAL POUR LES COLLABORATEURS
{showInviteModal && selectedEventId && (
  <InviteAttendeesModal
    isOpen={showInviteModal}
    eventId={selectedEventId}
    onClose={() => setShowInviteModal(false)}
    onInvite={handleInviteCollaborators}  // ← Passer le handler pour collaborateurs
  />
)}

/**
 * REMARQUES IMPORTANTES:
 * 
 * 1. Le modal charge automatiquement les collaborateurs 
 *    depuis /api/collaborators/:societeId
 * 
 * 2. L'utilisateur sélectionne les collaborateurs avec des checkboxes
 * 
 * 3. Quand on clique "Inviter", ça appelle:
 *    POST /api/calendar/events/:eventId/invite
 *    avec { member_ids: [...], invite_method: 'email' }
 * 
 * 4. Le backend:
 *    - Crée les entrées dans event_attendees
 *    - Envoie les emails d'invitation
 *    - Retourne le nombre d'invitations envoyées
 * 
 * 5. Les collaborateurs reçoivent un email et voient l'événement
 *    dans leur calendrier (si linked par event_attendees)
 * 
 * OPTIONS ADDITIONNELLES:
 * 
 * - Remplacer handleInviteFromModal existant
 * - Ou créer un toggle pour choisir inviter sociétés vs collaborateurs
 * - Ou utiliser toujours les collaborateurs (recommandé)
 */

/**
 * EXEMPLE D'IMPLÉMENTATION COMPLÈTE:
 */

// Option 1: Remplacer complètement par les collaborateurs
const handleInvite = async (memberIds: number[]): Promise<void> => {
  try {
    const eventIdNum = parseInt(selectedEventId, 10);
    await inviteCollaborators(eventIdNum, memberIds);
    console.log('✅ Invitations envoyées');
    setShowInviteModal(false);
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Option 2: Toggle entre sociétés et collaborateurs
const [useCollaborators, setUseCollaborators] = useState(true);

const handleInvite = async (ids: number[]): Promise<void> => {
  try {
    const eventIdNum = parseInt(selectedEventId, 10);
    
    if (useCollaborators) {
      await inviteCollaborators(eventIdNum, ids);
    } else {
      await inviteArtisans(eventIdNum, ids, 'email');
    }
    
    setShowInviteModal(false);
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Option 3: Afficher les collaborateurs avec plus d'infos
// Modifier le modal pour afficher aussi le poste et la date d'assignation
// si nécessaire

/**
 * FLUX DANS GoogleCalendar.tsx:
 * 
 * User crée événement → Event modal opens
 *   ↓
 * User sélectionne scope = 'collaborative'
 *   ↓
 * User clique "Inviter des collaborateurs"
 *   ↓
 * InviteAttendeesModal opens
 *   ↓
 * Modal charge collaborateurs de la société
 *   ↓
 * User sélectionne collaborateurs avec checkboxes
 *   ↓
 * User clique "Inviter (N)"
 *   ↓
 * handleInviteCollaborators est appelé
 *   ↓
 * inviteCollaborators() envoie la requête au backend
 *   ↓
 * Backend:
 *   - Crée event_attendees pour chaque collaborateur
 *   - Envoie email à chaque collaborateur
 *   - Retourne { success: true, data: { invited: N } }
 *   ↓
 * Frontend montre alert de succès
 *   ↓
 * Modal se ferme
 *   ↓
 * Collaborateurs reçoivent email d'invitation
 * Collaborateurs voient événement dans leur calendrier
 */

/**
 * TESTING:
 * 
 * 1. Créer un événement avec scope = 'collaborative'
 * 2. Cliquer sur "Inviter des collaborateurs"
 * 3. Le modal doit montrer la liste des collaborateurs
 * 4. Sélectionner 1-2 collaborateurs
 * 5. Cliquer "Inviter (2)"
 * 6. Vérifier que:
 *    - Une requête POST a été faite à /api/calendar/events/{id}/invite
 *    - Le body contient { member_ids: [...], invite_method: 'email' }
 *    - La réponse est { success: true }
 *    - Un email a été envoyé aux collaborateurs
 *    - Les collaborateurs voient l'événement quand ils se connectent
 */
