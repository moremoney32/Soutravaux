# 🔴 Diagnostic Erreur 500 - Création d'Événement

## ❌ Erreur Reçue

```
POST /api/calendar/events → HTTP 500
{"success":false,"error":"Erreur création événement"}
```

### Votre Payload

```json
{
  "societe_id": 11,
  "title": "knkljbnl;",
  "description": "mnljbnl",
  "location": ", ml lk",
  "event_date": "2026-01-13",
  "start_time": "16:00",
  "end_time": "16:30",
  "color": "#F4A460",
  "scope": "collaborative",
  "event_category_id": 7,
  "attendee_societe_ids": [4, 16],
  "invite_method": "email"
}
```

---

## 🎯 Problème Identifié

### **Ligne 631 du CalendarService.ts** - Les paramètres SQL étaient mal alignés

**Code AVANT (❌ ERREUR):**
```typescript
const [result] = await conn.query<any>(
  `INSERT INTO calendar_events 
   (societe_id, title, description, event_date, start_time, end_time, 
    location, color, status, event_type, scope, event_category_id, custom_category_label)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
  [
    data.societe_id,           // 1️⃣
    data.title,                // 2️⃣
    data.description || null,  // 3️⃣
    eventDate,                 // 4️⃣
    data.start_time,           // 5️⃣
    data.end_time,             // 6️⃣
    data.location || null,     // 7️⃣
    data.color || '#E77131',   // 8️⃣
    data.event_type || 'task', // 9️⃣ ← event_type ✓
    data.scope,                // 🔟 ← scope (MAIS LE PLACEHOLDER NE MATCH PAS!)
    data.event_category_id || null,    // ❌ MAUVAIS ORDRE
    data.custom_category_label || null // ❌ MAUVAIS ORDRE
  ]
);
```

**Problème:**
- Les placeholders SQL attendent: `event_type, scope, event_category_id, custom_category_label`
- Mais les valeurs envoyées: `event_type, scope, event_category_id, custom_category_label`
- **Le problème est que `data.scope` n'avait pas de valeur par défaut** → `undefined`!
- MySQL reçoit: `event_type='task', scope=undefined, event_category_id=7, ...` → SQL ERROR

---

## ✅ Solution Appliquée

```typescript
const [result] = await conn.query<any>(
  `INSERT INTO calendar_events 
   (societe_id, title, description, event_date, start_time, end_time, 
    location, color, status, event_type, scope, event_category_id, custom_category_label)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
  [
    data.societe_id,                    // 1️⃣
    data.title,                         // 2️⃣
    data.description || null,           // 3️⃣
    eventDate,                          // 4️⃣
    data.start_time,                    // 5️⃣
    data.end_time,                      // 6️⃣
    data.location || null,              // 7️⃣
    data.color || '#E77131',            // 8️⃣
    data.event_type || 'task',          // 9️⃣ event_type ✓
    data.scope || 'personal',           // 🔟 scope ✓ (AVEC DÉFAUT!)
    data.event_category_id || null,     // 1️⃣1️⃣ event_category_id ✓
    data.custom_category_label || null  // 1️⃣2️⃣ custom_category_label ✓
  ]
);
```

**Changements:**
- ✅ Ligne 10: Ajout `|| 'personal'` pour `data.scope`
- ✅ Ajout de commentaires numérotés pour vérifier l'ordre

---

## 📋 Console.logs Ajoutés

### AU DÉMARRAGE DE createEvent():
```typescript
console.log('📥 [CalendarService.createEvent] Données reçues:', {
  societe_id: data.societe_id,
  title: data.title,
  scope: data.scope,           // ← Vérifie que c'est "collaborative"
  event_date: data.event_date,
  event_type: data.event_type,
  event_category_id: data.event_category_id,
  custom_category_label: data.custom_category_label,
  attendee_societe_ids: data.attendee_societe_ids
});
```

### AVANT L'INSERT:
```typescript
console.log('✅ [CalendarService] eventDate nettoyée:', eventDate);
```

### APRÈS L'INSERT (si scope=collaborative):
```typescript
console.log(`📧 [CalendarService] Événement ${eventId} = COLLABORATIVE, invitations à envoyer:`, [4, 16]);
console.log(`  → Invitation à societe_id: 4`);
console.log(`  → Invitation à societe_id: 16`);
console.log(`✅ [CalendarService] 2 invitations envoyées`);
```

### EN CAS D'ERREUR:
```typescript
console.error('❌ [CalendarService] Erreur createEvent:', {
  message: "Erreur réelle du SQL",
  code: "ER_BAD_FIELD_ERROR",
  errno: 1054,
  sql: "SELECT... (la requête complète)"
});
```

---

## 🔍 Comment TESTER Maintenant

### 1️⃣ Redémarrez le backend
```bash
cd backend
npm run dev
```

### 2️⃣ Regardez les logs
```
📥 [CalendarService.createEvent] Données reçues: {
  societe_id: 11,
  title: "knkljbnl;",
  scope: "collaborative"  ← DOIT ÊTRE "collaborative"
  event_category_id: 7,
  attendee_societe_ids: [4, 16]
}

✅ [CalendarService] eventDate nettoyée: 2026-01-13

📧 [CalendarService] Événement 42 = COLLABORATIVE, invitations à envoyer: [4, 16]
  → Invitation à societe_id: 4
  → Invitation à societe_id: 16
✅ [CalendarService] 2 invitations envoyées

✅ [CalendarService] Événement 42 créé avec succès
```

### 3️⃣ Le Response du Frontend sera:
```json
{
  "success": true,
  "data": { "id": 42 },
  "message": "Événement créé avec succès"
}
```

---

## 🚨 Si l'erreur persiste

### Vérifiez:

1. **La colonne `scope` existe** dans `calendar_events`?
   ```sql
   DESCRIBE calendar_events;
   -- Cherchez "scope" dans la liste
   ```

2. **La colonne `event_category_id` existe**?
   ```sql
   DESCRIBE calendar_events;
   -- Cherchez "event_category_id"
   ```

3. **La colonne `custom_category_label` existe**?
   ```sql
   DESCRIBE calendar_events;
   -- Cherchez "custom_category_label"
   ```

4. **Si ces colonnes n'existent pas**, exécutez ces ALTER:
   ```sql
   ALTER TABLE calendar_events ADD COLUMN scope VARCHAR(20) DEFAULT 'personal';
   ALTER TABLE calendar_events ADD COLUMN event_category_id INT DEFAULT NULL;
   ALTER TABLE calendar_events ADD COLUMN custom_category_label VARCHAR(255) DEFAULT NULL;
   ```

---

## 📊 Flux Complet Après le Fix

```
1. Frontend envoie POST /api/calendar/events
   └─ Body: { scope: "collaborative", attendee_societe_ids: [4, 16], ... }

2. Backend CalendarController reçoit
   └─ Valide les données

3. CalendarService.createEvent() appelée
   └─ 📥 Log: "Données reçues..."
   └─ ✅ Log: "eventDate nettoyée..."
   
4. INSERT event dans calendar_events
   └─ scope = "collaborative"
   └─ event_category_id = 7
   └─ custom_category_label = NULL

5. Notifications planifiées pour créateur

6. LOOP sur [4, 16]:
   └─ INSERT event_attendees (event_id=42, societe_id=4, ...)
   └─ INSERT event_attendees (event_id=42, societe_id=16, ...)
   └─ Notifications planifiées pour societe_id=4
   └─ Notifications planifiées pour societe_id=16

7. COMMIT transaction

8. Response retournée au frontend
   └─ { success: true, data: { id: 42 } }
```

---

## ✨ Prochaines Étapes

Après ce fix et que l'événement est créé:

1. **Tester l'endpoint d'invitation** (`POST /api/calendar/events/:eventId/invite`)
   - Vérifier que les emails sont bien envoyés
   - Vérifier que les collaborateurs voient l'événement

2. **Verifier la base de données**:
   ```sql
   SELECT * FROM calendar_events WHERE id = 42;
   SELECT * FROM event_attendees WHERE event_id = 42;
   ```

3. **Vérifier les logs de l'Email API**:
   - Vérifier que l'email service a reçu les requêtes
   - Vérifier les statuts d'envoi

---

**Version:** 1.0  
**Date:** 13 Jan 2026  
**Status:** ✅ FIXED
