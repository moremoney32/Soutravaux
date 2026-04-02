# CLAUDE.md — Contexte projet Solutravo

> Ce fichier grandit au fur et à mesure des sessions de travail. Il permet à Claude de retrouver instantanément le contexte même après perte de session.

---

## Qu'est-ce que Solutravo ?

Plateforme SaaS de gestion d'entreprise pour les **entreprises du BTP** (artisans, sous-traitants, fournisseurs). Elle regroupe plusieurs modules métier :

- **Calendrier collaboratif** — gestion d'événements personnels et partagés entre sociétés
- **Gestion de contacts** — import et segmentation de prospects
- **Campagnes SMS/Email** — envoi en masse avec métriques
- **Demandes de prix** — devis et génération PDF
- **Scraping** — collecte de données de prospects en ligne
- **Abonnements** — plans, features, rôles, accès

---

## Stack technique

### Backend
- **Runtime :** Node.js + TypeScript
- **Framework :** Express.js 5.1
- **Base de données :** MySQL 8+ (driver `mysql2`)
- **Auth :** JWT (`jsonwebtoken`)
- **Notifs :** `node-cron` pour les rappels planifiés, `web-push` pour push notifications
- **Email :** envoi direct depuis le backend
- **Autres :** `pdfkit`, `sharp`, `axios`, `swagger`

### Frontend
- **Framework :** React 19 + React Router 7
- **Build :** Vite 7
- **Langage :** TypeScript 5.8
- **Style :** CSS custom + FontAwesome + `lucide-react`
- **Formulaires :** `react-hook-form`
- **Animations :** `framer-motion`

---

## Architecture générale

```
solutravaux/
├── backend/
│   └── src/
│       ├── controllers/       # Handlers HTTP (validation entrée)
│       ├── services/          # Logique métier
│       ├── routes/            # Définition des routes Express
│       └── types/             # Interfaces TypeScript partagées
└── frontend/
    └── solu/
        └── src/
            ├── components/    # Composants React
            ├── services/      # Clients API (axios)
            ├── types/         # Types TS frontend
            └── helpers/       # Utilitaires (layout, formatage)
```

---

## Module Calendrier (focus actuel)

C'est le module sur lequel on travaille le plus. Il a été significativement refondu.

### Modèle de données (tables MySQL clés)
| Table | Rôle |
|-------|------|
| `calendar_events` | Événements (scope: personal/collaborative) |
| `event_categories` | Catégories système + custom par société |
| `event_reminders` | Rappels configurables (minutes_before, email/notif) |
| `event_invitations` | Invitations membres internes (par email) |
| `event_societe_invitations` | Invitations d'autres sociétés Solutravo |
| `event_externe_invitations` | Invitations emails externes |
| `membres` | Collaborateurs d'une société |
| `societes` | Sociétés/entreprises |

### Fichiers clés du module
| Fichier | Rôle |
|---------|------|
| `backend/src/services/CalendarService.ts` | CRUD événements + autorisation + invitations + rappels |
| `backend/src/controllers/CalendarController.ts` | Routes HTTP calendar |
| `backend/src/services/notificationMemberScheduler.ts` | Rappels pour les créateurs |
| `backend/src/services/invitationNotificationScheduler.ts` | Rappels pour les invités |
| `frontend/solu/src/types/calendar.ts` | Types TS: CalendarEvent, EventScope, EventStatus... |
| `frontend/solu/src/services/calendarApi.ts` | Client API: fetch/create/update/delete + invitations |
| `frontend/solu/src/components/GoogleCalendar.tsx` | Conteneur principal (en refacto, actuellement commenté) |
| `frontend/solu/src/components/CalendarWeekView.tsx` | Vue semaine avec multi-day events + auto-scroll |
| `frontend/solu/src/components/CalendarEventModal.tsx` | Modal création/édition avec reminders, scope, catégories |
| `frontend/solu/src/components/InvitesAttentesModal.tsx` | Modal sélection collaborateurs à inviter (par email) |
| `frontend/solu/src/helpers/eventLayoutHelper.ts` | Calcul positionnement et chevauchements |

### Fonctionnalités récemment implémentées
1. **Tracking membre_id** — chaque action lie le créateur via `membre_id`
2. **Invitations flexibles** — membres internes (email), autres sociétés Solutravo, emails externes
3. **Rappels personnalisés** — 0, 5, 10, 15, 30, 60+ minutes avant l'événement
4. **Catégories d'événements** — système + custom par société (icône, couleur, lieu requis)
5. **Événements multi-jours** — via champ `end_date`
6. **Collaboration inter-sociétés** — inviter d'autres entreprises à un événement
7. **Autorisation backend** — vérification rôle (admin/collaborateur) avant toute opération

### Logique d'autorisation
- `verifyAccess()` valide l'identité et le rôle du membre avant chaque opération
- Les admins voient tous les événements de leur société
- Les collaborateurs voient leurs propres événements + ceux où ils sont invités

### Pipeline de conversion de données
- API : formats string (`YYYY-MM-DD`, `HH:MM`)
- Frontend : objets JavaScript `Date`
- Fonctions de conversion : `convertAPIEventToFrontend()` / `convertFrontendEventToAPI()`

---

## État du refacto en cours (au 02/04/2026)

- `GoogleCalendar.tsx` est entièrement commenté — l'implémentation originale est remplacée par des composants modulaires (`CalendarWeekView`, `CalendarEventModal`, etc.)
- `InvitesAttentesModal.tsx` migré de IDs → emails pour les invitations
- Toutes les fonctions API requièrent maintenant `membreId` en paramètre

---

## Conventions de code

- Backend : services séparés par domaine, controllers valident les inputs
- Frontend : composants React avec hooks, types stricts TypeScript
- API : REST, JSON, token JWT dans les headers
- Pas de mocks dans les tests — on touche la vraie DB (retour d'expérience passé)

---

## À compléter au fil des sessions

*(Les sections suivantes seront enrichies au fur et à mesure)*

### Décisions techniques notables
- *(à documenter)*

### Bugs connus / en cours
- *(à documenter)*

### Prochaines features prévues
- *(à documenter)*
