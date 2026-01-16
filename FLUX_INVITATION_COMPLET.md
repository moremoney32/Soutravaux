# 📧 Flux d'Invitation Collaborateurs - COMPLET AVEC LOGS

## 🎯 Votre Question Répondue

**❓ "Dans InviteAttentesModal je ne vois pas le endpoint pour envoyer des mails à plusieurs collaborateurs?"**

### ✅ **LA RÉPONSE : C'est dans `calendarApi.ts` ligne 214**

```typescript
// 📍 c:\Users\Ngongang Franck\Desktop\Tchouta\solutravaux\frontend\solu\src\services\calendarApi.ts
// Ligne 214-229

export async function inviteCollaborators(
  eventId: number,
  memberIds: number[]
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      member_ids: memberIds,
      invite_method: 'email'
    })
  });

  const result = await response.json();
  console.log('📨 Invitation collaborateurs réponse API:', result);

  if (!result.success) {
    throw new Error(result.message || 'Erreur envoi invitations aux collaborateurs');
  }
}
```

---

## 🔗 Flux Complet avec Console.logs

### **ÉTAPE 1️⃣ : USER CLIQUE "INVITER" DANS LE MODAL**

**Fichier:** `InvitesAttentesModal.tsx`

```tsx
// Le modal est COMMENTÉ mais voici ce qu'il fait:

const handleInvite = async () => {
  console.log('🚀 [Modal] Bouton "Inviter" cliqué');
  console.log('🔢 [Modal] Collaborateurs sélectionnés:', selectedCollaborators);
  
  if (selectedCollaborators.length === 0) {
    alert('Sélectionnez au moins un collaborateur');
    return;
  }

  setIsLoading(true);
  console.log('⏳ [Modal] État loading: true');
  
  try {
    // ← C'EST ICI QUE C'APPELLE onInvite() callback
    console.log('📤 [Modal] Appel onInvite() avec memberIds:', selectedCollaborators);
    await onInvite(selectedCollaborators);  
    
    console.log('✅ [Modal] Invitation réussie!');
    setSelectedCollaborators([]);
    onClose();
  } catch (error) {
    console.error('❌ [Modal] Erreur:', error);
    alert('Erreur lors de l\'envoi des invitations');
  } finally {
    setIsLoading(false);
    console.log('⏳ [Modal] État loading: false');
  }
};
```

---

### **ÉTAPE 2️⃣ : LE CALLBACK onInvite() REÇOIT LES IDS**

**Fichier:** Le composant parent (GoogleCalendar.tsx ou CalendarEventModal.tsx)

```tsx
// Le parent a passé ce callback:

const handleInviteCollaborators = async (memberIds: number[]) => {
  console.log('📲 [Parent] handleInviteCollaborators appelé');
  console.log('🔢 [Parent] memberIds reçus:', memberIds);
  
  try {
    // eventId est l'ID de l'événement créé
    console.log('🎯 [Parent] Appel inviteCollaborators() avec:');
    console.log('   - eventId:', eventId);
    console.log('   - memberIds:', memberIds);
    
    // ← APPEL À LA FONCTION calendarApi
    await inviteCollaborators(eventId, memberIds);
    
    console.log('✅ [Parent] inviteCollaborators() terminé');
    alert('Collaborateurs invités avec succès!');
  } catch (error) {
    console.error('❌ [Parent] Erreur invitation:', error);
    alert('Erreur: ' + error.message);
  }
};
```

---

### **ÉTAPE 3️⃣ : APPEL API VERS LE BACKEND**

**Fichier:** `calendarApi.ts` ligne 214

```typescript
// 📍 Frontend → Backend

export async function inviteCollaborators(
  eventId: number,
  memberIds: number[]
): Promise<void> {
  // ← CECI EST LE ENDPOINT POUR ENVOYER LES MAILS!
  
  console.log('🌐 [API] inviteCollaborators() appelée');
  console.log('   - URL:', `http://localhost:3000/api/calendar/events/${eventId}/invite`);
  console.log('   - Method: POST');
  console.log('   - Body:', { member_ids: memberIds, invite_method: 'email' });

  const response = await fetch(
    `${API_BASE_URL}/calendar/events/${eventId}/invite`,  // ← LE ENDPOINT!
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        member_ids: memberIds,  // [1, 12, 13]
        invite_method: 'email'
      })
    }
  );

  console.log('⏳ [API] En attente de la réponse du backend...');
  
  const result = await response.json();
  
  // ← LA RÉPONSE DU BACKEND
  console.log('📨 [API] Réponse du backend reçue:', result);
  console.log('   - success:', result.success);
  console.log('   - message:', result.message);
  console.log('   - invited count:', result.data?.invited);

  if (!result.success) {
    console.error('❌ [API] L\'API a retourné un erreur:', result.message);
    throw new Error(result.message || 'Erreur envoi invitations aux collaborateurs');
  }
  
  console.log('✅ [API] inviteCollaborators() SUCCÈS!');
}
```

---

## 🛠️ FLUX BACKEND (Suite de l'envoi des emails)

**Endpoint:** `POST /api/calendar/events/:eventId/invite`

**Fichier Backend:** `backend/src/controllers/CalendarController.ts`

```typescript
// Le backend reçoit la requête

export const inviteAttendeesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { eventId } = req.params;
  const { member_ids, invite_method } = req.body;
  
  console.log('📥 [Backend] Requête reçue à /calendar/events/:eventId/invite');
  console.log('   - eventId:', eventId);
  console.log('   - member_ids:', member_ids);
  console.log('   - invite_method:', invite_method);

  try {
    // Appel au service qui fait le travail
    console.log('🔧 [Backend] Appel CalendarService.inviteAttendees()');
    
    const result = await CalendarService.inviteAttendees(
      parseInt(eventId),
      member_ids,
      invite_method
    );

    console.log('✅ [Backend] inviteAttendees() retourné:', result);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Invitations envoyées avec succès'
    });
  } catch (error) {
    console.error('❌ [Backend] Erreur:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'envoi des invitations'
    });
  }
};
```

---

## 📨 ENVOIE RÉEL DES EMAILS

**Fichier:** `backend/src/services/InvitationService.ts`

```typescript
export async function inviteCollaboratorsToEvent(
  eventId: number,
  societeId: number,
  creatorSocieteId: number
) {
  console.log('📧 [InvitationService] inviteCollaboratorsToEvent() appelée');
  console.log('   - eventId:', eventId);
  console.log('   - societeId:', societeId);

  try {
    // 1. Récupérer tous les collaborateurs de cette société
    console.log('🔍 [InvitationService] Récupération des collaborateurs...');
    
    const collaborators = await getUniqueCollaboratorsBySociete(societeId);
    
    console.log(`✅ [InvitationService] ${collaborators.length} collaborateurs trouvés:`, 
      collaborators.map(c => c.email));

    // 2. Pour CHAQUE collaborateur, envoyer un email
    for (const collaborator of collaborators) {
      console.log(`📨 [InvitationService] Envoi email à: ${collaborator.email}`);
      
      await envoyerEmailInvitation(
        collaborator.email,
        eventId,
        collaborator.nom,
        collaborator.prenom
      );
      
      console.log(`✅ [InvitationService] Email envoyé à ${collaborator.email}`);
    }

    console.log('✅ [InvitationService] Tous les emails envoyés!');
    return { invited: collaborators.length };

  } catch (error) {
    console.error('❌ [InvitationService] Erreur lors de l\'envoi:', error.message);
    throw error;
  }
}
```

---

## 📊 Résumé du Flux avec Console.logs

```
1️⃣ USER CLIQUE "INVITER" DANS MODAL
   └─ 🚀 [Modal] Bouton "Inviter" cliqué
   └─ 🔢 [Modal] Collaborateurs sélectionnés: [1, 12, 13]
   └─ ⏳ [Modal] État loading: true
   
2️⃣ CALLBACK onInvite() APPELÉ
   └─ 📲 [Parent] handleInviteCollaborators appelé
   └─ 🔢 [Parent] memberIds reçus: [1, 12, 13]
   └─ 🎯 [Parent] Appel inviteCollaborators() avec eventId: 5
   
3️⃣ FONCTION API CALENDARAPI.TS (ligne 214)
   └─ 🌐 [API] inviteCollaborators() appelée
   └─ 🌐 [API] URL: http://localhost:3000/api/calendar/events/5/invite
   └─ 🌐 [API] Body: { member_ids: [1, 12, 13], invite_method: "email" }
   └─ ⏳ [API] En attente de la réponse du backend...
   
4️⃣ BACKEND REÇOIT LA REQUÊTE
   └─ 📥 [Backend] Requête reçue à /calendar/events/5/invite
   └─ 🔧 [Backend] Appel CalendarService.inviteAttendees()
   
5️⃣ SERVICE ENVOIE LES EMAILS
   └─ 📧 [InvitationService] inviteCollaboratorsToEvent() appelée
   └─ 🔍 [InvitationService] Récupération des collaborateurs...
   └─ ✅ [InvitationService] 3 collaborateurs trouvés: [john@..., jane@...]
   └─ 📨 [InvitationService] Envoi email à: john@example.com
   └─ ✅ [InvitationService] Email envoyé à john@example.com
   └─ 📨 [InvitationService] Envoi email à: jane@example.com
   └─ ✅ [InvitationService] Email envoyé à jane@example.com
   └─ 📨 [InvitationService] Envoi email à: bob@example.com
   └─ ✅ [InvitationService] Email envoyé à bob@example.com
   
6️⃣ BACKEND RETOURNE LA RÉPONSE
   └─ ✅ [Backend] Réponse: { success: true, data: { invited: 3 } }
   
7️⃣ FRONTEND REÇOIT LA RÉPONSE
   └─ 📨 [API] Réponse du backend reçue: { success: true, invited: 3 }
   └─ ✅ [API] inviteCollaborators() SUCCÈS!
   └─ ✅ [Parent] Collaborateurs invités avec succès!
   └─ ✅ [Modal] Invitation réussie!
   └─ ✅ [Modal] Modal fermé
```

---

## 🔴 CAS D'ERREUR - Console.logs

### Si un email échoue:
```
❌ [InvitationService] Erreur lors de l'envoi à john@example.com: 
   Email API retourne 500 (service mail down)
   
❌ [Backend] Erreur: Email API unavailable
❌ [API] L'API a retourné un erreur: Email API unavailable
❌ [Parent] Erreur invitation: Email API unavailable
❌ [Modal] Erreur: Email API unavailable
```

### Si member_ids est vide:
```
❌ [Modal] Erreur: Sélectionnez au moins un collaborateur
(le code ne contacte même pas le backend)
```

### Si eventId n'existe pas:
```
✅ [API] inviteCollaborators() appelée
✅ [Backend] Requête reçue
❌ [Backend] Erreur: Event not found
❌ [API] L'API a retourné un erreur: Event not found
❌ [Parent] Erreur invitation: Event not found
```

---

## 🔗 Lien entre les fichiers

```
Frontend/User clique
    ↓
InvitesAttentesModal.tsx (handleInvite)
    ↓
Appelle onInvite() callback (passé par parent)
    ↓
GoogleCalendar.tsx ou CalendarEventModal.tsx (handleInviteCollaborators)
    ↓
Appelle inviteCollaborators() fonction
    ↓
calendarApi.ts (LIGNE 214) ← ← ← CECI EST L'ENDPOINT!
    ↓
Envoie POST à http://localhost:3000/api/calendar/events/:eventId/invite
    ↓
Backend recçoit la requête
    ↓
CalendarController.inviteAttendeesController
    ↓
CalendarService.inviteAttendees()
    ↓
InvitationService.inviteCollaboratorsToEvent()
    ↓
Pour chaque member: envoyerEmailInvitation()
    ↓
EMAIL API externe
    ↓
Emails reçus dans les boîtes collaborateurs
```

---

## ⚠️ PROBLÈME: Le modal est COMMENTÉ!

**Regardez ligne 1-100 de InvitesAttentesModal.tsx :**

```tsx
// ❌ TOUT EST COMMENTÉ !
// import React, { useState, useEffect } from 'react';
// interface Societe { ... }
// const InviteAttendeesModal: React.FC...
// ...
```

**Solution:** Décommenter le modal OU créer une version active avec les console.logs!

---

## 📝 Code COMPLET avec console.logs à utiliser

Pour voir TOUS les logs, remplacez le contenu de `InvitesAttentesModal.tsx` par ceci:

```tsx
import React, { useState, useEffect } from 'react';
import { inviteCollaborators } from '../services/calendarApi';

interface Collaborator {
  id: number;
  membre_id: number;
  email: string;
  nom: string;
  prenom: string;
}

interface InvitesAttentesModalProps {
  isOpen: boolean;
  eventId: number;
  onClose: () => void;
  onInvite?: (memberIds: number[]) => Promise<void>;
}

const InvitesAttentesModal: React.FC<InvitesAttentesModalProps> = ({
  isOpen,
  eventId,
  onClose,
  onInvite
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = 'http://localhost:3000/api';

  // Récupérer societeId depuis localStorage
  const getSocieteId = (): number => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.societeId || 0;
    }
    return 0;
  };

  // Charger les collaborateurs au ouverture du modal
  useEffect(() => {
    if (isOpen) {
      console.log('🎯 [Modal] Modal ouvert, eventId:', eventId);
      loadCollaborators();
    }
  }, [isOpen]);

  const loadCollaborators = async () => {
    console.log('📥 [Modal] loadCollaborators() appelée');
    setIsLoadingCollaborators(true);

    try {
      const societeId = getSocieteId();
      console.log('🔢 [Modal] societeId:', societeId);
      console.log('🌐 [Modal] Fetch vers:', `${API_BASE_URL}/collaborators/${societeId}`);

      const response = await fetch(`${API_BASE_URL}/collaborators/${societeId}`);
      console.log('📊 [Modal] Réponse status:', response.status);

      const result = await response.json();
      console.log('📦 [Modal] Données reçues:', result);

      if (result.success && result.data) {
        console.log(`✅ [Modal] ${result.data.length} collaborateurs chargés:`, 
          result.data.map((c: any) => `${c.prenom} ${c.nom} (${c.email})`));
        setCollaborators(result.data);
      } else {
        console.warn('⚠️ [Modal] Pas de données:', result);
      }
    } catch (error) {
      console.error('❌ [Modal] Erreur chargement collaborateurs:', error);
    } finally {
      setIsLoadingCollaborators(false);
      console.log('✅ [Modal] loadCollaborators() terminée');
    }
  };

  const handleToggleCollaborator = (id: number) => {
    console.log('✓ [Modal] Toggle collaborateur:', id);
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    console.log('🎯 [Modal] Select All clicked');
    if (selectedIds.length === collaborators.length) {
      console.log('   → Déselectionner tout');
      setSelectedIds([]);
    } else {
      const allIds = collaborators.map(c => c.membre_id);
      console.log('   → Sélectionner tout:', allIds);
      setSelectedIds(allIds);
    }
  };

  const handleInvite = async () => {
    console.log('🚀 [Modal] Bouton "Inviter" cliqué');
    console.log('   - selectedIds:', selectedIds);
    console.log('   - eventId:', eventId);

    if (selectedIds.length === 0) {
      console.warn('⚠️ [Modal] Aucun collaborateur sélectionné');
      alert('Sélectionnez au moins un collaborateur');
      return;
    }

    setIsLoading(true);
    console.log('⏳ [Modal] État loading: true');

    try {
      console.log('📤 [Modal] Appel inviteCollaborators() avec:');
      console.log('   - eventId:', eventId);
      console.log('   - memberIds:', selectedIds);

      // APPEL À LA FONCTION inviteCollaborators() DE calendarApi.ts
      await inviteCollaborators(eventId, selectedIds);

      console.log('✅ [Modal] inviteCollaborators() réussie!');

      // Si onInvite callback fourni, l'appeler aussi
      if (onInvite) {
        console.log('📲 [Modal] Appel onInvite() callback');
        await onInvite(selectedIds);
      }

      alert('Collaborateurs invités avec succès!');
      setSelectedIds([]);
      onClose();
    } catch (error: any) {
      console.error('❌ [Modal] Erreur lors de l\'invitation:', error.message);
      alert('Erreur: ' + error.message);
    } finally {
      setIsLoading(false);
      console.log('⏳ [Modal] État loading: false');
    }
  };

  if (!isOpen) return null;

  const filtered = collaborators.filter(c =>
    `${c.prenom} ${c.nom} ${c.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
        <h2>Inviter des Collaborateurs</h2>
        
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />

        <button 
          onClick={handleSelectAll}
          style={{ marginBottom: '10px', padding: '8px 16px', backgroundColor: '#E77131', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {selectedIds.length === collaborators.length ? 'Désélectionner tout' : 'Sélectionner tout'}
        </button>

        {isLoadingCollaborators ? (
          <p>Chargement des collaborateurs...</p>
        ) : filtered.length === 0 ? (
          <p>Aucun collaborateur trouvé</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filtered.map(collab => (
              <label key={collab.id} style={{ display: 'flex', alignItems: 'center', padding: '8px', cursor: 'pointer', backgroundColor: selectedIds.includes(collab.membre_id) ? '#ffe6cc' : 'transparent', borderRadius: '4px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(collab.membre_id)}
                  onChange={() => handleToggleCollaborator(collab.membre_id)}
                  style={{ marginRight: '10px' }}
                />
                <div>
                  <strong>{collab.prenom} {collab.nom}</strong>
                  <div style={{ fontSize: '12px', color: '#666' }}>{collab.email}</div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            disabled={isLoading}
          >
            Annuler
          </button>
          <button 
            onClick={handleInvite}
            disabled={isLoading || selectedIds.length === 0}
            style={{ padding: '8px 16px', backgroundColor: '#E77131', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? 'En cours...' : `Inviter (${selectedIds.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitesAttentesModal;
```

---

## 🎬 TESTER LE FLUX COMPLET

1. Ouvrez le modal → Voir les logs:
   ```
   🎯 [Modal] Modal ouvert, eventId: 5
   📥 [Modal] loadCollaborators() appelée
   ```

2. Sélectionnez 3 collaborateurs → Voir:
   ```
   ✓ [Modal] Toggle collaborateur: 1
   ✓ [Modal] Toggle collaborateur: 12
   ✓ [Modal] Toggle collaborateur: 13
   ```

3. Cliquez "Inviter (3)" → Voir le flux complet dans la console!

---

**Version:** 1.0
**Date:** 13 Jan 2026
