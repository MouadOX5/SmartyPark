# SmartyPark — Frontend Mobile

Application React Native + Expo + TypeScript + NativeWind pour SmartyPark.

---

## 🎯 Architecture et Respect Strict du Backend

1. **Backend Immuable** : Le backend Spring Boot est la source de vérité absolue. Aucun endpoint, DTO ou enum n'a été altéré ou inventé.
2. **Pas de carte interactive** : `react-native-maps` et tout composant de type `MapView` sont exclus. L'explorateur fonctionne en liste verticale fluide avec calcul de distance GPS local. L'itinéraire est délégué à Google Maps via deep link.
3. **Affluence Qualitative** : Aucun pourcentage, jauge ou donut SVG. L'affluence est strictement qualitative (`DISPONIBLE`, `PRESQUE_SATURE`, `SATURE`, `INCONNU`).
4. **Découpage en 3 flux étanches** :
   - **Présence** (`/presence/index`) : Gestion de session, heure d'arrivée, chronomètre temps réel, terminer session.
   - **Affluence** (`/affluence/declarer?id=`) : 3 cartes qualitatives + envoi position GPS via `expo-location`.
   - **Signalement** (`/signalements/creer?id=`) : Incident (4 types), description (1000 cars max), upload photo optionnel (`multipart/form-data`).

---

## 🚀 Installation & Lancement

```bash
cd smartyPark_frontend
npm install
npm start
```

### Configuration Backend

Dans `src/constants/config.ts` :
- **Émulateur Android** : `http://10.0.2.2:8080/api`
- **Simulateur iOS** : `http://localhost:8080/api`
- **Appareil physique** : `http://<VOTRE_IP_LOCALE>:8080/api`

---

## 📱 Structure des Écrans

```
app/
├── (auth)/
│   ├── login.tsx            # Authentification JWT
│   └── register.tsx         # Inscription
├── (tabs)/
│   ├── index.tsx            # EXPLORER : Liste verticale uniquement
│   ├── proposer.tsx         # PROPOSER : GPS auto en lecture seule
│   └── profil.tsx           # PROFIL : Informations + Déconnexion
├── espaces/
│   └── [id].tsx             # DÉTAIL : Affluence qualitative, Itinéraire, Actions
├── affluence/
│   └── declarer.tsx         # DÉCLARATION AFFLUENCE : 3 choix + GPS
├── signalements/
│   └── creer.tsx            # SIGNALEMENT : Multipart + photo
└── presence/
    └── index.tsx            # PRÉSENCE : Chronomètre session
```
