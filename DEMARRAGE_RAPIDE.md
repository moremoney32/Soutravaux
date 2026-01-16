# 🚀 DÉMARRAGE RAPIDE - Système Collaborateurs

## ⚡ 5 Minutes Setup

### 1. Base de Données (1 min)
```bash
# Localiser et exécuter le script SQL
cd backend/src/models/
mysql -u user -p database < membre_poste_assignments.sql

# Vérifier
mysql -u user -p database
SELECT COUNT(*) FROM membre_poste_assignments;
# Doit retourner: 36
```

### 2. Backend - Services (2 min)
```bash
# Copier les fichiers
cp CHEMIN/CollaboratorsService.ts backend/src/services/
cp CHEMIN/InvitationService.ts backend/src/services/
cp CHEMIN/CollaboratorsController.ts backend/src/controllers/

# Le reste est déjà fait dans les fichiers modifiés
```

### 3. Frontend - Component (1 min)
```bash
# Remplacer le composant
cp CHEMIN/InvitesAttentesModal.tsx frontend/solu/src/components/

# Les mises à jour de calendarApi.ts sont déjà appliquées
```

### 4. Tester (1 min)
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Tester un endpoint
curl http://localhost:3000/api/collaborators/2

# Doit retourner: { success: true, data: [...], count: N }
```

---

## 📦 Files à Copier

### ✅ Copier depuis la documentation vers votre projet:

1. **backend/src/models/membre_poste_assignments.sql**
2. **backend/src/services/CollaboratorsService.ts**
3. **backend/src/services/InvitationService.ts**
4. **backend/src/controllers/CollaboratorsController.ts**
5. **frontend/solu/src/components/InvitesAttentesModal.tsx**

### ✅ Modifier les fichiers existants:

1. **backend/src/routes/router.ts**
   - Ajouter l'import du controller
   - Ajouter les 5 routes

2. **backend/src/services/emailNotificationServices.ts**
   - Ajouter la fonction `envoyerEmailNotificationInvitation()`

3. **frontend/solu/src/services/calendarApi.ts**
   - Ajouter `inviteCollaborators()`
   - Ajouter `fetchCollaborators()`

4. **frontend/solu/src/components/GoogleCalendar.tsx**
   - Importer et utiliser InviteAttendeesModal
   - Ajouter le handler d'invitation

---

## 🧪 Test Immédiat

### Tester l'API
```bash
# 1. Récupérer collaborateurs
curl http://localhost:3000/api/collaborators/2

# Résultat attendu:
# {
#   "success": true,
#   "data": [
#     { "id": 1, "email": "...", "nom": "...", "prenom": "...", ... }
#   ],
#   "count": 1
# }

# 2. Tester une invitaiton (nécessite eventId existant)
curl -X POST http://localhost:3000/api/calendar/events/5/invite \
  -H "Content-Type: application/json" \
  -d '{"member_ids": [1, 12], "invite_method": "email"}'

# Résultat attendu:
# {
#   "success": true,
#   "data": { "invited": 2 }
# }
```

### Tester le Frontend
```bash
# 1. Démarrer le dev server
cd frontend/solu
npm run dev

# 2. Aller à http://localhost:5173
# 3. Créer un événement
# 4. Cliquer "Inviter"
# 5. Le modal doit charger les collaborateurs
# 6. Sélectionner et inviter
```

---

## 🔍 Vérification Rapide

### Base de Données
```sql
-- Voir les collaborateurs
SELECT m.id, m.email, m.nom, m.prenom
FROM membre_poste_assignments mpa
JOIN membres m ON mpa.membre_id = m.id
WHERE mpa.societe_id = 2;

-- Voir les invitations
SELECT * FROM event_attendees WHERE event_id = 5;
```

### Logs
```bash
# Terminal backend
# Chercher: "✅ 2 invitations envoyées"

# Browser console (frontend)
# Chercher: "Collaborators loaded: 3"
```

---

## 📊 Architecture Simple

```
User créates event
    ↓
User clicks "Inviter"
    ↓
InviteAttendeesModal loads
    ↓
GET /api/collaborators/:societeId
    ↓
CollaboratorsService gets data from DB
    ↓
Modal affiche checkboxes
    ↓
User sélectionne et clique "Inviter"
    ↓
POST /api/calendar/events/:eventId/invite
    ↓
InvitationService sends emails
    ↓
Collaborators get emails
    ↓
Collaborators see event in calendar
```

---

## ⚠️ Points Importants

### ✅ À faire obligatoirement:

1. **Créer la table** `membre_poste_assignments` en BD
2. **Copier les 3 fichiers** (Service, Invit Service, Controller)
3. **Modifier router.ts** pour ajouter les routes
4. **Modifier emailNotificationServices.ts** pour la fonction
5. **Remplacer InvitesAttentesModal.tsx**
6. **Modifier calendarApi.ts** pour les 2 fonctions

### ❌ À ne pas faire:

- Ne pas renommer les fichiers
- Ne pas modifier la signature des fonctions
- Ne pas oublier les imports
- Ne pas oublier les routes

---

## 🆘 Dépannage Rapide

### "Table doesn't exist"
```bash
# Vérifier que le script SQL a été exécuté
SHOW TABLES LIKE 'membre_poste_assignments';
```

### "Endpoint not found"
```bash
# Vérifier que les routes sont dans router.ts
grep -n "collaborators" backend/src/routes/router.ts
```

### "Collaborators don't load"
```bash
# Vérifier en base
SELECT COUNT(*) FROM membre_poste_assignments WHERE societe_id = 2;

# Ou vérifier l'API
curl http://localhost:3000/api/collaborators/2
```

### "Emails not sent"
```bash
# Vérifier que la fonction est dans emailNotificationServices.ts
grep -n "envoyerEmailNotificationInvitation" \
  backend/src/services/emailNotificationServices.ts
```

---

## 📱 Vérification Mobile

Le modal est responsive et fonctionne sur:
- ✅ Desktop (> 1024px)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)

---

## 🎯 Objectif Atteint Quand:

1. ✅ Les collaborateurs s'affichent dans le modal
2. ✅ Les checkboxes fonctionnent
3. ✅ Le bouton "Inviter" envoie la requête API
4. ✅ Les emails sont reçus
5. ✅ Les événements apparaissent dans le calendrier des collaborateurs

---

## 📞 Questions Fréquentes

**Q: Combien de temps pour tout mettre en place?**
A: 30-50 minutes pour un développeur familiarisé

**Q: Est-ce que ça cassera l'existant?**
A: Non, c'est 100% additionnel. Les routes existantes ne sont pas modifiées.

**Q: Faut-il redémarrer?**
A: Oui, redémarrer le serveur backend après copier les fichiers

**Q: Comment tester sans serveur email?**
A: Les erreurs email sont logées en console, pas bloquantes

**Q: Peut-on inviter plusieurs fois?**
A: Non, la table event_attendees a une unique constraint

---

## 🚀 Déployer en Production

### Avant déploiement:
```bash
# 1. Backup de la base de données
mysqldump -u user -p database > backup.sql

# 2. Exécuter le script SQL en staging
mysql -u user -p staging_db < membre_poste_assignments.sql

# 3. Tester tous les endpoints en staging
curl http://staging.api:3000/api/collaborators/2

# 4. Faire un test complet en staging
# - Créer événement
# - Inviter collaborateurs
# - Vérifier email
# - Vérifier apparition dans calendrier
```

### Déploiement:
```bash
# 1. Déployer le backend (les fichiers)
# 2. Redémarrer le serveur
# 3. Vérifier les logs: grep "collaborators" logs.txt
# 4. Déployer le frontend
# 5. Vérifier le frontend: console.log chercher "Collaborators loaded"
# 6. Tester un événement complet
# 7. Monitorer les logs pendant 2-3 heures
```

---

## 📚 Pour Plus d'Infos

| Besoin | Document |
|--------|----------|
| Vue d'ensemble | `GUIDE_COLLABORATEURS_COMPLET.md` |
| Intégration dans GoogleCalendar | `INTEGRATION_COLLABORATEURS.md` |
| Tester les endpoints | `TEST_ENDPOINTS_COLLABORATEURS.md` |
| Checklist complète | `RESUME_IMPLEMENTATION.md` |
| Liste des fichiers | `INVENTAIRE_FICHIERS.md` |

---

**Version:** Quick Start 1.0  
**Temps estimé:** 5-30 minutes  
**Difficluté:** Facile ⭐⭐☆☆☆  
**Support:** Lire la documentation fournie
