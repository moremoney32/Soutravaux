# 📋 Guide Complet d'Intégration - Système de Partage d'Événements avec Collaborateurs

## 🎯 Vue d'ensemble

Ce système permet aux utilisateurs de :
1. **Récupérer les collaborateurs** d'une société depuis la table `membre_poste_assignments`
2. **Inviter les collaborateurs** à des événements calendrier
3. **Envoyer des emails d'invitation** automatiquement
4. **Afficher les événements partagés** dans le calendrier des collaborateurs

---

## 📊 Structure de la Base de Données

### Table: `membre_poste_assignments`
Lie les membres aux sociétés en fonction de leurs postes.

```sql
CREATE TABLE IF NOT EXISTS `membre_poste_assignments` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `membre_id` INT(11) NOT NULL,
  `poste_id` BIGINT(20) NOT NULL,
  `societe_id` INT(11) NOT NULL,
  `assigned_by` INT(11) DEFAULT NULL,
  `assigned_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(),
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_membre_poste_societe` (`membre_id`, `poste_id`, `societe_id`),
  KEY `idx_poste_id` (`poste_id`),
  KEY `idx_societe_id` (`societe_id`),
  KEY `idx_assigned_by` (`assigned_by`),
  KEY `idx_membre_societe` (`membre_id`, `societe_id`),
  
  -- Foreign Keys
  CONSTRAINT `fk_mpa_membre_id` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mpa_societe_id` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mpa_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `membres` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔧 Backend - Services

### 1. **CollaboratorsService.ts**
Gère toutes les opérations concernant les collaborateurs.

**Fonctions principales :**
- `getCollaboratorsBySociete(societeId)` - Récupère tous les collaborateurs d'une société
- `getUniqueCollaboratorsBySociete(societeId)` - Récupère les collaborateurs uniques (sans doublons)
- `isCollaboratorOfSociete(memberId, societeId)` - Vérifie si un membre est collaborateur
- `assignCollaborator(memberId, posteId, societeId)` - Assigne un collaborateur
- `removeCollaborator(memberId, societeId)` - Retire un collaborateur
- `getSocietesByCollaborator(memberId)` - Récupère les sociétés d'un membre

**Location:** `backend/src/services/CollaboratorsService.ts`

### 2. **InvitationService.ts**
Gère les invitations aux événements calendrier.

**Fonctions principales :**
- `inviteCollaboratorsToEvent(eventId, societeId, creatorSocieteId)` - Invite les collaborateurs à un événement
- `getEventInvitations(eventId)` - Récupère le statut des invitations
- `envoyerEmailInvitation()` - Envoie l'email d'invitation

**Location:** `backend/src/services/InvitationService.ts`

### 3. **emailNotificationServices.ts** (Mise à jour)
Amélioré pour supporter les emails d'invitation.

**Nouvelle fonction :**
- `envoyerEmailNotificationInvitation(email, subject, htmlMessage)` - Envoie un email HTML personnalisé

---

## 🛣️ Backend - Routes API

### Endpoints pour les collaborateurs:

```
GET  /api/collaborators/:societeId
     - Récupère tous les collaborateurs d'une société
     - Response: { success: true, data: [...], count: number }

GET  /api/collaborators/check/:memberId/:societeId
     - Vérifie si un membre est collaborateur
     - Response: { success: true, data: { isCollaborator: boolean } }

GET  /api/collaborators/member/:memberId
     - Récupère les sociétés d'un membre
     - Response: { success: true, data: [...], count: number }

POST /api/collaborators
     - Assigne un collaborateur
     - Body: { memberId, posteId, societeId, assignedBy?, expiresAt? }
     - Response: { success: true, data: { id: number } }

DELETE /api/collaborators/:memberId/:societeId
       - Retire un collaborateur
       - Response: { success: true }
```

**Location:** `backend/src/routes/router.ts`

---

## 🏗️ Backend - Controllers

### CollaboratorsController.ts
Expose les endpoints pour les collaborateurs.

**Functions:**
- `getCollaboratorsBySocieteController()`
- `checkCollaboratorController()`
- `getSocietesByMemberController()`
- `assignCollaboratorController()`
- `removeCollaboratorController()`

**Location:** `backend/src/controllers/CollaboratorsController.ts`

---

## 🎨 Frontend - Services API

### calendarApi.ts (Mise à jour)

**Nouvelle fonction :**
```typescript
inviteCollaborators(eventId: number, memberIds: number[]): Promise<void>
  - Invite les collaborateurs sélectionnés
  - Envoie member_ids au backend
  
fetchCollaborators(societeId: number): Promise<any[]>
  - Récupère les collaborateurs depuis le backend
```

**Location:** `frontend/solu/src/services/calendarApi.ts`

---

## 🎯 Frontend - Composants

### InvitesAttentesModal.tsx (Mise à jour)
Modal pour inviter les collaborateurs.

**Props:**
```typescript
interface InviteAttendeesModalProps {
  isOpen: boolean;
  eventId: string;
  onClose: () => void;
  onInvite: (collaboratorIds: number[]) => Promise<void>;
  initialSelectedIds?: number[];
}
```

**Features:**
- ✅ Affiche la liste des collaborateurs avec checkboxes
- ✅ Recherche/filtrage par nom, prénom ou email
- ✅ Sélectionner tout / désélectionner tout
- ✅ Affichage du nombre de sélections
- ✅ Interface utilisateur moderne et responsive

**Location:** `frontend/solu/src/components/InvitesAttentesModal.tsx`

---

## 📊 Flux d'Utilisation Complet

### 1️⃣ Créer un événement collaboratif
```
User créates event → scope = 'collaborative' → event saved
```

### 2️⃣ Inviter les collaborateurs
```
User clicks "Inviter" → Modal opens
→ Load collaborators from /api/collaborators/:societeId
→ User selects collaborators with checkboxes
→ User clicks "Inviter"
→ POST /api/calendar/events/:eventId/invite
   {
     member_ids: [1, 12, 13],
     invite_method: 'email'
   }
```

### 3️⃣ Backend traite l'invitation
```
Backend receives invitation request
→ For each member_id:
   - Create entry in event_attendees
   - Call inviteCollaboratorsToEvent()
   - Send email via envoyerEmailInvitation()
→ Response: { success: true, data: { invited: 3 } }
```

### 4️⃣ Email d'invitation est envoyé
```
Email reçu par le collaborateur
→ Titre: "📅 Invitation à l'événement: [titre]"
→ Affiche: Date, Heure, Lieu, Description
→ Lien: "Voir l'événement"
```

### 5️⃣ Collaborateur voit l'événement
```
Collaborator logs in
→ getEvents() query checks event_attendees table
→ Événement apparaît dans le calendrier
→ Collaborator can see all details
→ Collaborator can accept/decline invitation
```

---

## 🔑 Points Clés de l'Intégration

### ✅ Côté Backend

1. **Importer CollaboratorsService dans l'endroit approprié:**
```typescript
import { getUniqueCollaboratorsBySociete } from '../services/CollaboratorsService';
```

2. **Utiliser le service d'invitation:**
```typescript
import { inviteCollaboratorsToEvent } from '../services/InvitationService';
```

3. **Configurer les routes:**
- Les routes sont déjà ajoutées dans `router.ts`
- Vérifier l'import du controller

4. **Tester les endpoints:**
```bash
# Récupérer collaborateurs
curl http://localhost:3000/api/collaborators/2

# Vérifier un collaborateur
curl http://localhost:3000/api/collaborators/check/1/2

# Récupérer sociétés d'un membre
curl http://localhost:3000/api/collaborators/member/1
```

### ✅ Côté Frontend

1. **Importer les nouvelles fonctions:**
```typescript
import { 
  inviteCollaborators, 
  fetchCollaborators 
} from '../services/calendarApi';
```

2. **Utiliser le composant modal:**
```typescript
<InviteAttendeesModal
  isOpen={showInviteModal}
  eventId={selectedEventId}
  onClose={() => setShowInviteModal(false)}
  onInvite={handleInviteCollaborators}
/>
```

3. **Implémenter le handler d'invitation:**
```typescript
const handleInviteCollaborators = async (memberIds: number[]) => {
  try {
    await inviteCollaborators(eventId, memberIds);
    alert('Invitations envoyées avec succès!');
    // Refresh events
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

---

## 🧪 Tests Recommandés

### Test 1: Récupérer les collaborateurs
```bash
GET /api/collaborators/2
Expected: 
{
  success: true,
  data: [
    { id: 1, membre_id: 1, email: "...", nom: "...", prenom: "...", ... }
  ],
  count: 1
}
```

### Test 2: Inviter un collaborateur
```bash
POST /api/calendar/events/1/invite
Body: { member_ids: [1, 12], invite_method: 'email' }
Expected: 
{
  success: true,
  data: { invited: 2 }
}
```

### Test 3: Vérifier email d'invitation
- Vérifier que l'email a été envoyé au collaborateur
- Vérifier le contenu HTML de l'email
- Vérifier le lien "Voir l'événement"

### Test 4: Affichage dans le calendrier
- Créer événement collaboratif
- Inviter collaborateur
- Se connecter avec compte collaborateur
- Vérifier que l'événement apparaît dans le calendrier

---

## 🔐 Sécurité & Validation

### Points importants:

1. **Vérification des droits:**
   - Un utilisateur ne peut inviter que les collaborateurs de sa propre société
   - Un collaborateur reçoit un email pour confirmer

2. **Validation des données:**
   - Vérifier que societeId existe
   - Vérifier que memberId existe dans la table membres
   - Vérifier que la relation existe dans membre_poste_assignments

3. **Rate limiting:**
   - Limiter le nombre d'invitations par événement
   - Implémenter un rate limiter sur l'envoi d'emails

---

## 📝 Files Créés/Modifiés

### ✅ Créés:
- `backend/src/models/membre_poste_assignments.sql`
- `backend/src/services/CollaboratorsService.ts`
- `backend/src/services/InvitationService.ts`
- `backend/src/controllers/CollaboratorsController.ts`
- `frontend/solu/src/components/InvitesAttentesModal.tsx` (remplacé)

### ✅ Modifiés:
- `backend/src/routes/router.ts` - Ajout des routes collaborateurs
- `backend/src/services/emailNotificationServices.ts` - Ajout envoyerEmailNotificationInvitation()
- `frontend/solu/src/services/calendarApi.ts` - Ajout inviteCollaborators() et fetchCollaborators()

---

## 🚀 Prochaines Étapes

1. **Déployer la table en base de données:**
   ```bash
   mysql -u user -p database < backend/src/models/membre_poste_assignments.sql
   ```

2. **Tester chaque endpoint avec Postman/cURL**

3. **Intégrer le modal dans GoogleCalendar.tsx**

4. **Tester le flux complet:**
   - Créer événement
   - Inviter collaborateurs
   - Vérifier emails
   - Vérifier affichage dans calendrier

5. **Ajouter validations supplémentaires:**
   - Spam prevention
   - Double invitation protection
   - Audit logging

---

## 📚 Ressources Utiles

- Table `membres`: ID, email, nom, prenom, statut, etc.
- Table `societes`: id, nomsociete, email, etc.
- Table `event_attendees`: Gère les participants aux événements
- Table `calendar_events`: Les événements principaux

---

## ❓ Dépannage Courant

### Erreur: "Collaborateurs non trouvés"
- ✓ Vérifier que la société existe
- ✓ Vérifier que membre_poste_assignments contient des données
- ✓ Vérifier que les membres sont actifs (statut = 'actif')

### Erreur: "Email non envoyé"
- ✓ Vérifier la configuration de l'API d'email
- ✓ Vérifier que le email du collaborateur est valide
- ✓ Vérifier les logs du serveur

### Modal ne charge pas les collaborateurs
- ✓ Vérifier que societeId est accessible
- ✓ Vérifier les logs du navigateur (console)
- ✓ Vérifier que l'endpoint retourne les bonnes données

---

**Version:** 1.0  
**Date:** 2026-01-13  
**Auteur:** Système d'Intégration
