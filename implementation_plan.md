# SmartyPark – Plan de Correction et Finalisation Frontend

## Synthèse de l'analyse

### Backend – Endpoints confirmés

| Endpoint | Méthode | Rôle requis |
|---|---|---|
| `/api/auth/register` | POST | Public |
| `/api/auth/login` | POST | Public → retourne JWT String brut |
| `/api/auth/me` | GET | Tous les rôles |
| `/api/espaces-publics` | GET | Tous |
| `/api/espaces-publics/{id}` | GET | Tous |
| `/api/espaces-publics/categorie/{cat}` | GET | Tous |
| `/api/espaces-publics/recherche?nom=` | GET | Tous |
| `/api/espaces-publics/{espaceId}/affluence` | POST | MOBILE_USER |
| `/api/espaces-publics/{espaceId}/affluence` | GET | Tous |
| `/api/presences/demarrer` | POST | MOBILE_USER |
| `/api/presences/terminer` | POST | MOBILE_USER |
| `/api/presences/active` | GET | MOBILE_USER |
| `/api/presences/has-active` | GET | MOBILE_USER |
| `/api/presences/espace/{id}/count` | GET | Tous |
| `/api/signalements` | POST multipart | MOBILE_USER |
| `/api/signalements/{id}` | GET | Tous |
| `/api/signalements/{id}/photo` | GET | MOD/ADMIN seulement |
| `/api/propositions` | POST | MOBILE_USER |
| `/api/propositions/mes-propositions` | GET | MOBILE_USER |
| `/api/propositions/{id}` | GET | Tous |

### DTOs backend – DeclarationAffluenceRequest
```json
{
  "statutAffluence": "DISPONIBLE | PRESQUE_SATURE | SATURE",
  "latitude": -90..90,
  "longitude": -180..180
}
```

### DTOs backend – PresenceRequest
```json
{ "espacePublicId": 123 }
```

### DTOs backend – SignalementRequest (part JSON)
```json
{
  "type": "PROPRETE | EQUIPEMENT | SECURITE | AUTRE",
  "description": "string max 1000 chars",
  "espacePublicId": 123
}
```

---

## État actuel du frontend

**Ce qui est déjà correct et aligné avec le backend :**
- `src/types/index.ts` — Tous les types correspondent aux DTOs backend
- `src/api/authApi.ts`, `espacePublicApi.ts`, `presenceApi.ts`, `affluenceApi.ts`, `signalementApi.ts`, `propositionApi.ts` — URLs et méthodes correctes
- `AuthContext.tsx` et `PresenceContext.tsx` — Logique correcte
- `app/(auth)/login.tsx` et `register.tsx` — Fonctionnels
- `app/(tabs)/index.tsx` — Liste des espaces avec recherche et filtres
- `app/(tabs)/proposer.tsx` — Formulaire proposition
- `app/(tabs)/profil.tsx` — Profil utilisateur avec session active
- `app/espaces/[id].tsx` — Détail espace avec affluence et boutons d'action
- `app/signalements/creer.tsx` — Création signalement avec photo
- `app/propositions/mes-propositions.tsx` — Liste des propositions

**Ce qui est VIDE et doit être implémenté :**

> [!CAUTION]
> `app/presence/index.tsx` est entièrement vide (0 bytes). C'est l'écran principal de la séance active.
> `app/affluence/declarer.tsx` est entièrement vide (0 bytes). C'est l'écran de déclaration d'affluence.

**Problèmes identifiés dans le code existant :**

> [!IMPORTANT]
> `src/components/AffluenceDonut.tsx` est un stub vide. Les maquettes demandent un donut visuel qualitatif.
> `src/components/MapViewComponent.tsx` est un stub vide. Une carte interactive est requise.
> Dans `espaces/[id].tsx`, le bouton principal dit "Déclarer ma présence" → doit dire "Commencer ma séance".
> L'onglet Explorer (index.tsx) n'a pas de vue carte — seulement une liste.

---

## Proposed Changes

### Étape 1 – Composant AffluenceDonut

#### [MODIFY] [AffluenceDonut.tsx](file:///d:/4%C3%A9me%20ann%C3%A9e%20EMSI/stage/SmartyPark/smartyPark_frontend/src/components/AffluenceDonut.tsx)
Implémenter un donut qualitatif en pur React Native (View/StyleSheet, pas de lib externe).
Le donut affiche une couleur pleine basée sur le statut :
- DISPONIBLE → vert `#10B981`
- PRESQUE_SATURE → orange `#F59E0B`
- SATURE → rouge `#EF4444`
- INCONNU → gris `#94A3B8`

---

### Étape 2 – Écran Présence (Commencer ma séance)

#### [MODIFY] [presence/index.tsx](file:///d:/4%C3%A9me%20ann%C3%A9e%20EMSI/stage/SmartyPark/smartyPark_frontend/app/presence/index.tsx)
Implémenter l'écran de session active avec :
- Affichage du nom de l'espace et du timer en direct
- Donut qualitatif de l'affluence actuelle de l'espace
- Bouton **"Déclarer l'affluence"** → `/affluence/declarer?id=...&nom=...`
- Bouton **"Signaler un problème"** → `/signalements/creer?id=...&nom=...`
- Bouton **"Terminer ma séance"** → `presenceApi.terminer()`
- Si pas de présence active → afficher message + bouton retour

---

### Étape 3 – Écran Déclaration d'Affluence

#### [MODIFY] [affluence/declarer.tsx](file:///d:/4%C3%A9me%20ann%C3%A9e%20EMSI/stage/SmartyPark/smartyPark_frontend/app/affluence/declarer.tsx)
Implémenter avec :
- 3 grandes cartes cliquables : DISPONIBLE / PRESQUE_SATURE / SATURE
- Récupération GPS automatique via `expo-location`
- Appel `POST /api/espaces-publics/{espaceId}/affluence` avec `{ statutAffluence, latitude, longitude }`
- Loading + feedback succès/erreur

---

### Étape 4 – Corrections espaces/[id].tsx

#### [MODIFY] [espaces/[id].tsx](file:///d:/4%C3%A9me%20ann%C3%A9e%20EMSI/stage/SmartyPark/smartyPark_frontend/app/espaces/%5Bid%5D.tsx)
- Remplacer "Déclaration de présence" → **"Commencer ma séance"**
- Intégrer le composant `AffluenceDonut` dans la section affluence
- Ajouter le donut visuel pour rendre l'interface plus riche

---

### Étape 5 – Explorer avec vue Carte

#### [MODIFY] [index.tsx](file:///d:/4%C3%A9me%20ann%C3%A9e%20EMSI/stage/SmartyPark/smartyPark_frontend/app/%28tabs%29/index.tsx)
- Ajouter un sélecteur Vue Liste / Vue Carte (2 boutons toggle)
- En vue Carte : afficher une carte avec les marqueurs de chaque espace
- Utiliser `react-native-maps` (déjà dans les dépendances si Expo)
- Marqueur cliquable → ouvre `espaces/[id]`

---

## Verification Plan

```bash
# Depuis smartyPark_frontend/
npx tsc --noEmit
npx expo start
```

### Flux à tester
1. Register → Login → Me → Logout
2. Explorer → Liste → Recherche → Catégorie
3. Explorer → Carte → Marqueur → Détail espace
4. Détail → "Commencer ma séance" → Écran session
5. Session → Timer → Déclarer affluence
6. Session → Signaler problème
7. Session → Terminer
8. Proposer espace → Mes propositions
