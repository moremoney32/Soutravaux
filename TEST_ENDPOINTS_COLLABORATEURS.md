# 🧪 Test des Endpoints API - Collaborateurs

## 📋 Liste complète des endpoints

### 1. GET `/api/collaborators/:societeId`
**Description:** Récupérer tous les collaborateurs uniques d'une société

**Curl:**
```bash
curl -X GET "http://localhost:3000/api/collaborators/2" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "membre_id": 1,
      "email": "member@example.com",
      "nom": "NGONGANG",
      "prenom": "FRANCK",
      "poste_id": 22,
      "societe_id": 2,
      "assigned_at": "2026-01-12T14:29:27.000Z",
      "expires_at": null
    }
  ],
  "count": 1
}
```

---

### 2. GET `/api/collaborators/check/:memberId/:societeId`
**Description:** Vérifier si un membre est collaborateur d'une société

**Curl:**
```bash
curl -X GET "http://localhost:3000/api/collaborators/check/1/2" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "isCollaborator": true
  }
}
```

---

### 3. GET `/api/collaborators/member/:memberId`
**Description:** Récupérer les sociétés pour lesquelles un membre est collaborateur

**Curl:**
```bash
curl -X GET "http://localhost:3000/api/collaborators/member/1" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "societe_id": 2,
      "nomsociete": "FRANCK LIONEL"
    },
    {
      "societe_id": 5,
      "nomsociete": "Autre Societe"
    }
  ],
  "count": 2
}
```

---

### 4. POST `/api/collaborators`
**Description:** Assigner un collaborateur à une société

**Curl:**
```bash
curl -X POST "http://localhost:3000/api/collaborators" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": 1,
    "posteId": 25,
    "societeId": 3,
    "assignedBy": 2,
    "expiresAt": "2027-01-13"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 39
  },
  "message": "Collaborateur assigné avec succès"
}
```

---

### 5. DELETE `/api/collaborators/:memberId/:societeId`
**Description:** Retirer l'assignation d'un collaborateur

**Curl:**
```bash
curl -X DELETE "http://localhost:3000/api/collaborators/1/3" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Collaborateur retiré avec succès"
}
```

---

### 6. POST `/api/calendar/events/:eventId/invite`
**Description:** Inviter les collaborateurs/membres à un événement

**Curl:**
```bash
curl -X POST "http://localhost:3000/api/calendar/events/5/invite" \
  -H "Content-Type: application/json" \
  -d '{
    "member_ids": [1, 12, 13],
    "invite_method": "email"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "invited": 3
  },
  "message": "Invitations envoyées avec succès"
}
```

---

## 🧪 Scénario de Test Complet

### Préparation
```bash
# Variables pour faciliter les tests
SOCIETE_ID=2
MEMBER_ID=1
EVENT_ID=5
API_URL="http://localhost:3000/api"
```

### Test 1: Récupérer les collaborateurs
```bash
curl -X GET "$API_URL/collaborators/$SOCIETE_ID"
# Devrait retourner au moins 1 collaborateur
```

### Test 2: Vérifier un collaborateur
```bash
curl -X GET "$API_URL/collaborators/check/$MEMBER_ID/$SOCIETE_ID"
# Devrait retourner { "isCollaborator": true }
```

### Test 3: Récupérer les sociétés d'un membre
```bash
curl -X GET "$API_URL/collaborators/member/$MEMBER_ID"
# Devrait retourner la liste des sociétés
```

### Test 4: Créer un événement calendrier
```bash
curl -X POST "$API_URL/calendar/events" \
  -H "Content-Type: application/json" \
  -d '{
    "societe_id": '$SOCIETE_ID',
    "title": "Test Événement Collaboratif",
    "event_date": "2026-02-15",
    "start_time": "10:00",
    "end_time": "11:00",
    "scope": "collaborative"
  }'
# Note le event_id de la réponse
```

### Test 5: Inviter des collaborateurs à l'événement
```bash
curl -X POST "$API_URL/calendar/events/$EVENT_ID/invite" \
  -H "Content-Type: application/json" \
  -d '{
    "member_ids": [1, 12],
    "invite_method": "email"
  }'
# Devrait retourner { "success": true, "data": { "invited": 2 } }
```

### Test 6: Vérifier les invitations
```bash
curl -X GET "$API_URL/calendar/events/$EVENT_ID/attendees"
# Devrait afficher les participants invités
```

---

## 📊 Cas de Test - Erreurs Attendues

### ❌ Erreur 1: Societe non trouvée
```bash
curl -X GET "$API_URL/collaborators/99999"
# Response: { "success": false, "message": "..." }
```

### ❌ Erreur 2: Paramètres manquants
```bash
curl -X POST "$API_URL/collaborators" \
  -H "Content-Type: application/json" \
  -d '{}'
# Response: { "success": false, "message": "memberId, posteId et societeId sont requis" }
```

### ❌ Erreur 3: Inviter sans événement
```bash
curl -X POST "$API_URL/calendar/events/99999/invite" \
  -H "Content-Type: application/json" \
  -d '{"member_ids": [1]}'
# Response: { "success": false, "message": "..." }
```

---

## 🔍 Vérifications de Base de Données

### Vérifier les données dans `membre_poste_assignments`
```sql
-- Voir tous les collaborateurs d'une société
SELECT m.id, m.email, m.nom, m.prenom, mpa.poste_id, mpa.assigned_at
FROM membre_poste_assignments mpa
JOIN membres m ON mpa.membre_id = m.id
WHERE mpa.societe_id = 2;

-- Voir les sociétés d'un membre
SELECT DISTINCT s.id, s.nomsociete
FROM membre_poste_assignments mpa
JOIN societes s ON mpa.societe_id = s.id
WHERE mpa.membre_id = 1;

-- Vérifier une assignation spécifique
SELECT * FROM membre_poste_assignments 
WHERE membre_id = 1 AND societe_id = 2;

-- Compter les collaborateurs par société
SELECT societe_id, COUNT(DISTINCT membre_id) as count
FROM membre_poste_assignments
WHERE expires_at IS NULL OR expires_at > NOW()
GROUP BY societe_id;
```

---

## 📧 Vérifier les Emails

### Après une invitation, vérifier:
1. **Email reçu dans la boîte du collaborateur**
2. **Contenu de l'email:**
   - Sujet: "📅 Invitation à l'événement: [titre]"
   - Titre de l'événement
   - Date formatée (ex: "Lundi 15 février 2026")
   - Heure (ex: "10:00")
   - Lieu
   - Description (si fournie)

3. **Lien dans l'email:**
   - Doit pointer vers `/calendar?event=[eventTitle]`

### Vérifier dans la base de données:
```sql
-- Vérifier les invitations
SELECT ea.id, ea.event_id, ea.contact_email, ea.status, ea.created_at
FROM event_attendees ea
WHERE ea.event_id = 5;

-- Vérifier les notifications
SELECT * FROM event_notifications
WHERE event_id = 5
ORDER BY trigger_at DESC;
```

---

## 🎯 Points de Vérification Critiques

### Frontend
- [ ] Le modal charge les collaborateurs correctement
- [ ] Les checkboxes fonctionnent
- [ ] Le bouton "Sélectionner tout" fonctionne
- [ ] Le compteur de sélections se met à jour
- [ ] L'envoi génère une requête POST correcte
- [ ] La modal se ferme après succès

### Backend
- [ ] La requête POST reçoit les `member_ids` correctement
- [ ] Les entrées sont créées dans `event_attendees`
- [ ] Les emails sont envoyés
- [ ] La réponse contient le nombre d'invitations envoyées

### Base de Données
- [ ] `membre_poste_assignments` contient les données correctes
- [ ] `event_attendees` contient les nouvelles invitations
- [ ] `event_notifications` contient les notifications (si utilisé)

### Email
- [ ] Les emails arrivent dans les bonnes boîtes
- [ ] Le contenu HTML est correct
- [ ] Les liens fonctionnent

---

## 🚨 Troubleshooting

### Le endpoint retourne 400
```bash
# Vérifier que tous les paramètres requis sont présents
# et du bon type
curl -X POST "$API_URL/collaborators" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": 1,
    "posteId": 25,
    "societeId": 2
  }'
```

### Aucun collaborateur ne s'affiche
```bash
# Vérifier qu'il existe des données en base
SELECT COUNT(*) FROM membre_poste_assignments 
WHERE societe_id = 2;

# Vérifier que les membres sont actifs
SELECT m.statut FROM membres m
JOIN membre_poste_assignments mpa ON m.id = mpa.membre_id
WHERE mpa.societe_id = 2;
```

### Email n'est pas envoyé
```bash
# Vérifier la configuration de l'API d'email
# Vérifier les logs du serveur
# Vérifier que le email est valide

# En base de données:
SELECT * FROM event_notifications 
WHERE event_id = $EVENT_ID
AND sent_at IS NULL;
```

---

## 📝 Templates de Requête

### JavaScript/Fetch
```javascript
// Récupérer collaborateurs
fetch('/api/collaborators/2')
  .then(r => r.json())
  .then(d => console.log(d));

// Inviter collaborateurs
fetch('/api/calendar/events/5/invite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    member_ids: [1, 12, 13],
    invite_method: 'email'
  })
})
.then(r => r.json())
.then(d => console.log(d));
```

### Python/Requests
```python
import requests

# Récupérer collaborateurs
response = requests.get('http://localhost:3000/api/collaborators/2')
print(response.json())

# Inviter collaborateurs
response = requests.post(
    'http://localhost:3000/api/calendar/events/5/invite',
    json={
        'member_ids': [1, 12, 13],
        'invite_method': 'email'
    }
)
print(response.json())
```

---

**Version:** 1.0  
**Date:** 2026-01-13
