# 🎨 Diagrammes et Architectures Visuelles

## 1. Flux de Données Global

```
┌────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/TypeScript)                │
│                                                                │
│  GoogleCalendar.tsx                                           │
│      │                                                         │
│      ├─→ create event (collaborative)                         │
│      │      │                                                  │
│      │      └─→ CalendarEventModal.tsx                       │
│      │             │                                           │
│      │             └─→ onInvite() callback                   │
│      │                   │                                     │
│      └─→ click "Inviter"                                      │
│             │                                                  │
│             └─→ InvitesAttentesModal.tsx                    │
│                    │                                           │
│                    ├─→ GET /api/collaborators/:societeId     │
│                    │   (fetch collaborators)                  │
│                    │                                           │
│                    ├─→ Show checkboxes + search               │
│                    │                                           │
│                    └─→ onInvite(memberIds)                   │
│                        │                                       │
│                        └─→ inviteCollaborators(eventId, memberIds)
│                            │                                   │
│                            └─→ POST /api/calendar/events/:eventId/invite
│                                │                               │
└────────────────────────────────┼───────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node/Express)                      │
│                                                                │
│  router.ts                                                    │
│      │                                                         │
│      └─→ POST /calendar/events/:eventId/invite               │
│             │                                                  │
│             └─→ CalendarController.inviteAttendeesController │
│                    │                                           │
│                    └─→ CalendarService.inviteAttendees()     │
│                        │                                       │
│                        └─→ For each member_id:               │
│                            │                                   │
│                            ├─→ INSERT event_attendees        │
│                            │                                   │
│                            └─→ inviteCollaborators()          │
│                                │                               │
│                                └─→ InvitationService.js     │
│                                    │                           │
│                                    ├─→ getCollaborators()     │
│                                    │                           │
│                                    └─→ envoyerEmail()         │
│                                        │                       │
│                                        └─→ EMAIL API        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │   EMAIL      │
                          │   SERVICE    │
                          │ (External)   │
                          └──────┬───────┘
                                 │
                                 ▼
                        ┌────────────────────┐
                        │ Collaborator Email │
                        │  (Inbox)           │
                        └────────┬───────────┘
                                 │
                                 ▼
                        ┌────────────────────┐
                        │ Click link in email│
                        └────────┬───────────┘
                                 │
                                 ▼
                        ┌────────────────────┐
                        │ Open calendar      │
                        │ See shared event   │
                        └────────────────────┘
```

---

## 2. Schéma Base de Données

```
┌─────────────────────────────────────┐
│         membres                      │
├─────────────────────────────────────┤
│ id (PK)                             │
│ email                               │
│ nom                                 │
│ prenom                              │
│ statut (actif/bloque)               │
│ ...                                 │
└────────────────────┬────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    (FK)│                    (FK)│
┌──────────────────────────────────────┐
│ membre_poste_assignments  (NEW)      │
├──────────────────────────────────────┤
│ id (PK)                              │
│ membre_id (FK → membres.id)          │
│ poste_id                             │
│ societe_id (FK → societes.id)        │
│ assigned_by (FK → membres.id)        │
│ assigned_at (timestamp)              │
│ expires_at (timestamp, nullable)     │
│                                      │
│ Unique: (membre_id, poste_id,        │
│          societe_id)                 │
│                                      │
│ Indexes:                             │
│ - idx_societe_id                     │
│ - idx_membre_societe                 │
│ - idx_assigned_by                    │
└──────────────────────────────────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
        ┌─────────────────────┐
        │     societes        │
        ├─────────────────────┤
        │ id (PK)             │
        │ nomsociete          │
        │ email               │
        │ ...                 │
        └─────────────────────┘


┌──────────────────────────────────┐
│    calendar_events (EXISTANT)    │
├──────────────────────────────────┤
│ id (PK)                          │
│ societe_id (créateur)            │
│ title                            │
│ event_date                       │
│ start_time                       │
│ end_time                         │
│ ...                              │
└────────────────┬─────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│   event_attendees (EXISTANT)      │
├────────────────────────────────────┤
│ id (PK)                            │
│ event_id (FK → calendar_events)    │
│ societe_id ou contact_email        │
│ status (pending/accepted/declined)  │
│ created_at                         │
│ responded_at                       │
└────────────────────────────────────┘
```

---

## 3. Flux d'Invitation Détaillé

```
┌─────────────────────────────────────────────────────────┐
│ 1. Utilisateur crée un événement collaboratif          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ scope:          │
        │ 'collaborative' │
        └────────┬────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Utilisateur clique "Inviter des collaborateurs"    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
        ┌─────────────────────────────────────┐
        │ InvitesAttentesModal.tsx s'ouvre    │
        │                                     │
        │ - Charge collaborateurs             │
        │   GET /api/collaborators/2          │
        │                                     │
        │ - Affiche checkboxes                │
        │   (nom, prenom, email)              │
        │                                     │
        │ - User sélectionne 3 collaborateurs │
        └────────────┬────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │ Click "Inviter (3)"      │
        │                          │
        │ onInvite([1, 12, 13])   │
        └────────────┬─────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. POST /api/calendar/events/5/invite                  │
│    Body: {                                              │
│      member_ids: [1, 12, 13],                          │
│      invite_method: 'email'                             │
│    }                                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────────────┐
        │ inviteCollaboratorsToEvent │
        │ (InvitationService.ts)     │
        └────────────┬───────────────┘
                     │
         ┌───────────┴───────────────┐
         ▼                           ▼
    For member 1            For member 12
    │                       │
    ├─→ INSERT              ├─→ INSERT
    │   event_attendees     │   event_attendees
    │   id=1,status=pending │   id=12,status=pending
    │                       │
    └─→ getCollaborators()  └─→ getCollaborators()
        │                       │
        ├─→ Get email            ├─→ Get email
        │                        │
        ├─→ Get details          ├─→ Get details
        │                        │
        └─→ Send Email           └─→ Send Email
            │                       │
            ├─→ Subject:            ├─→ Subject:
            │   "📅 Invitation      │   "📅 Invitation
            │   à l'événement:      │   à l'événement:
            │   Meeting"            │   Meeting"
            │                       │
            ├─→ HTML Body           ├─→ HTML Body
            │   - Title             │   - Title
            │   - Date              │   - Date
            │   - Time              │   - Time
            │   - Location          │   - Location
            │   - Button link       │   - Button link
            │                       │
            └─→ EMAIL API → SMTP    └─→ EMAIL API → SMTP
                │                       │
                ▼                       ▼
            INBOX of                INBOX of
            member@1.com            member@12.com
            │                       │
            └───────┬───────────────┘
                    │
                    ▼
        ┌─────────────────────┐
        │ User receives email │
        │ & clicks link       │
        │ Opens calendar      │
        │                     │
        │ Event is visible!   │
        └─────────────────────┘
```

---

## 4. Structure des Réponses API

```
GET /api/collaborators/2
├─ success: true
├─ data: [
│   {
│     id: 1,
│     membre_id: 1,
│     email: "john@example.com",
│     nom: "DOE",
│     prenom: "John",
│     poste_id: 22,
│     societe_id: 2,
│     assigned_at: "2026-01-12T14:29:27Z",
│     expires_at: null
│   },
│   {
│     id: 12,
│     membre_id: 12,
│     email: "jane@example.com",
│     nom: "SMITH",
│     prenom: "Jane",
│     ...
│   }
│ ]
└─ count: 2


POST /api/calendar/events/5/invite
├─ success: true
├─ data: {
│   invited: 3
│ }
└─ message: "Invitations envoyées avec succès"


GET /api/collaborators/check/1/2
├─ success: true
└─ data: {
    isCollaborator: true
  }
```

---

## 5. Hiérarchie des Composants React

```
GoogleCalendar.tsx (parent)
├── State:
│   ├── selectedEventId
│   ├── showInviteModal
│   └── ...
│
├── CalendarEventModal.tsx (créer événement)
│   ├── Props:
│   │   ├── isOpen
│   │   ├── onSave
│   │   └── onInvite (callback)
│   │
│   └── showInviteModal button
│       └── triggers setShowInviteModal(true)
│
└── InvitesAttentesModal.tsx (inviter collaborateurs)
    ├── Props:
    │   ├── isOpen
    │   ├── eventId
    │   ├── onClose
    │   └── onInvite (callback)
    │
    ├── State:
    │   ├── collaborators
    │   ├── selectedCollaborators (checkboxes)
    │   ├── searchTerm
    │   └── isLoading
    │
    ├── Effects:
    │   └── useEffect: load collaborators on open
    │
    └── Handlers:
        ├── handleToggleCollaborator
        ├── handleSelectAll
        └── handleInvite
            └── calls onInvite(memberIds)
                └── frontend calls inviteCollaborators() API
```

---

## 6. Timeline d'une Invitation Complète

```
Timeline:

T+0s    User crée événement
        ├─ Frontend: POST /api/calendar/events
        ├─ Backend: INSERT calendar_events
        └─ Response: { id: 5, ... }

T+1s    User clique "Inviter"
        ├─ Modal s'ouvre
        ├─ Frontend: GET /api/collaborators/2
        └─ Response: [ { id: 1, ... }, { id: 12, ... } ]

T+2s    Modal affiche les collaborateurs
        └─ User sélectionne 3 collaborateurs

T+3s    User clique "Inviter (3)"
        ├─ Frontend: POST /api/calendar/events/5/invite
        │            { member_ids: [1, 12, 13] }
        │
        └─ Backend reçoit requête

T+3.5s  Backend traite l'invitation
        ├─ For each member:
        │  ├─ INSERT event_attendees
        │  ├─ Send email via API
        │  └─ Log invitation
        │
        └─ Response: { success: true, data: { invited: 3 } }

T+4s    Frontend reçoit réponse
        ├─ Alert "Invitations envoyées!"
        └─ Modal se ferme

T+5-10s Emails arrivent dans les boîtes
        ├─ member1@email.com reçoit invitation
        ├─ member12@email.com reçoit invitation
        └─ member13@email.com reçoit invitation

T+30m   Member ouvre son email
        ├─ Clique sur le lien
        └─ Opens calendar

T+30m   Event apparaît dans son calendrier
        ├─ Voir tous les détails
        └─ Accepter/Refuser l'invitation
```

---

## 7. Comparaison Avant/Après

```
┌─────────────────────────────────────────┐
│          AVANT (Sans collaborateurs)    │
├─────────────────────────────────────────┤
│                                         │
│  Events créés sont personnels           │
│  ├─ Impossible de partager             │
│  ├─ Collaborateurs ne voient pas       │
│  └─ Pas d'email d'invitation           │
│                                         │
│  Inviter = inviter des sociétés        │
│  ├─ Plus compliqué à gérer             │
│  ├─ Pas de relation collaborateurs     │
│  └─ Emails génériques                  │
│                                         │
└─────────────────────────────────────────┘

                    │
                    ▼
            ✅ IMPLÉMENTATION
                    │
                    ▼

┌─────────────────────────────────────────┐
│       APRÈS (Avec collaborateurs)       │
├─────────────────────────────────────────┤
│                                         │
│  Events créés peuvent être collaboratifs│
│  ├─ Facile de partager                 │
│  ├─ Collaborateurs voient              │
│  └─ Email d'invitation HTML            │
│                                         │
│  Inviter = inviter des collaborateurs  │
│  ├─ Plus simple et intuitif            │
│  ├─ Relation clair collaborateurs      │
│  └─ Emails personnalisés par collabor. │
│                                         │
│  Synchronisation calendrier             │
│  ├─ Collaborators voient les events    │
│  ├─ Avec tous les détails              │
│  └─ Mêmes fonctionnalités              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 8. Dépendances Module

```
router.ts
  ├── require CollaboratorsController
  │   └── require CollaboratorsService
  │       └── require db (pool)
  │
  └── require CalendarController
      └── require InvitationService
          ├── require CollaboratorsService
          └── require emailNotificationServices
              └── require axios (email API)


frontend/
  ├── GoogleCalendar.tsx
  │   ├── import InvitesAttentesModal
  │   └── import calendarApi
  │       ├── inviteCollaborators()
  │       ├── fetchCollaborators()
  │       └── other functions
  │
  └── InvitesAttentesModal.tsx
      ├── import calendarApi
      │   └── fetchCollaborators()
      │   └── inviteCollaborators()
      └── React hooks (useState, useEffect)
```

---

## 9. Matrice de Responsabilité

```
                    │ Créer │ Inviter │ Email │ Display │
                    │       │         │       │  Event  │
────────────────────┼───────┼─────────┼───────┼─────────┤
Frontend (React)    │   ✓   │    ✓    │   ✗   │    ✓    │
────────────────────┼───────┼─────────┼───────┼─────────┤
Backend (API)       │   ✓   │    ✓    │   ✓   │    ✓    │
────────────────────┼───────┼─────────┼───────┼─────────┤
Database            │   ✓   │    ✓    │   ✗   │    ✓    │
────────────────────┼───────┼─────────┼───────┼─────────┤
Email Service       │   ✗   │    ✗    │   ✓   │    ✗    │
────────────────────┴───────┴─────────┴───────┴─────────┤
```

---

**Version:** 1.0  
**Créé:** 13 Janvier 2026
