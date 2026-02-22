# BuddyCoach

Application de coaching sportif personnel. Gère les profils utilisateurs, les programmes d'entraînement, le suivi alimentaire, les records, les classements et les événements communautaires.

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclut Docker Compose)
- [Git](https://git-scm.com/)

C'est tout. Node.js **n'est pas nécessaire** pour lancer l'application via Docker.

---

## Lancement rapide (recommandé)

### 1. Cloner le projet

```bash
git clone https://github.com/Sam89-61/sae601
cd BuddyCoach
```

### 2. Configurer les variables d'environnement du backend

```bash
cp backend/.env.example backend/.env
```

Éditer `backend/.env` et remplir au minimum ces valeurs :

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://appuser:apppassword@postgres:5432/appdb
JWT_SECRET=une-clé-secrète-longue-et-aléatoire
API_KEY=une-clé-api-quelconque
GROQ_API_KEY=            # Laisser vide si pas de clé (fonctionnalités IA désactivées)
FRONTEND_URL=http://localhost:5173
```

### 3. Démarrer tous les services

```bash
docker compose up --build
```

> Le premier lancement prend quelques minutes (téléchargement des images, installation des dépendances). Les suivants sont beaucoup plus rapides.

### 4. Initialiser la base de données

Dans un **nouveau terminal** (laisser le premier tourner) :

```bash
# Créer les tables
docker exec app_backend_a node initDb.js

# Insérer les données de test
docker exec app_backend_a node insertTest.js
```

### 5. Accéder à l'application

| Service       | URL                        |
|---------------|----------------------------|
| **Frontend**  | http://localhost:5173       |
| **Backend**   | http://localhost:5001       |
| **Adminer**   | http://localhost:8081       |

---

## Compte de test

```
Email     : johndoe@test.com
Mot de passe : 12345678
```

---

## Option A — Tester sur navigateur web (le plus simple)

Ouvrir http://localhost:5173 dans un navigateur, **utiliser la vue mobile** (F12 > icône téléphone dans Chrome/Firefox).

Aucune configuration supplémentaire nécessaire.

---

## Option B — Tester sur Android

### Sur émulateur Android (Android Studio)

L'émulateur utilise `10.0.2.2` pour accéder à la machine hôte. Le fichier `front/.env.android` est déjà configuré pour ça :

```env
VITE_API_URL=http://10.0.2.2:5001/api
VITE_SOCKET_URL=http://10.0.2.2:5001
```

Aucune modification nécessaire, passer directement au build.

### Sur un vrai appareil Android (même réseau Wi-Fi)

> L'appareil et l'ordinateur doivent être connectés au **même réseau Wi-Fi**.

**1. Trouver l'IP locale de l'ordinateur**

- Windows : `ipconfig` → chercher `Adresse IPv4` (ex: `192.168.1.42`)
- Linux/Mac : `ip a` ou `ifconfig`

**2. Modifier `front/.env.android`**

```env
VITE_API_URL=http://192.168.1.42:5001/api
VITE_SOCKET_URL=http://192.168.1.42:5001
VITE_NODE_ENV=development
```

Remplacer `192.168.1.42` par votre IP réelle.

**3. Modifier `front/capacitor.config.json`**

Ajouter le champ `url` dans `server` :

```json
{
  "appId": "com.buddycoach.app",
  "appName": "BuddyCoach",
  "webDir": "dist",
  "server": {
    "url": "http://192.168.1.42:5173",
    "cleartext": true,
    "allowNavigation": ["192.168.*.*"]
  }
}
```

Remplacer `192.168.1.42` par votre IP réelle.

**4. Builder et déployer sur l'appareil**

```bash
cd front

# Installer les dépendances (si pas encore fait)
npm install

# Builder pour Android
npm run build:android

# Synchroniser avec le projet Android
npx cap sync android

# Ouvrir dans Android Studio pour déployer
npx cap open android
```

Dans Android Studio : brancher l'appareil en USB (avec le débogage USB activé) puis cliquer sur **Run**.

---

## Commandes utiles

### Arrêter les services
```bash
docker compose down
```

### Tout remettre à zéro (base de données incluse)
```bash
docker compose down -v
docker compose up --build
# Puis relancer initDb.js et insertTest.js
```

### Voir les logs en temps réel
```bash
# Tous les services
docker compose logs -f

# Un service spécifique
docker compose logs -f backend
docker compose logs -f frontend
```

### Réinitialiser uniquement la base de données
```bash
docker exec app_backend_a node resetDb.js
docker exec app_backend_a node initDb.js
docker exec app_backend_a node insertTest.js
```

### Accéder à la base de données via Adminer

1. Ouvrir http://localhost:8081
2. Se connecter avec :
   - **Système** : PostgreSQL
   - **Serveur** : postgres
   - **Utilisateur** : appuser
   - **Mot de passe** : apppassword
   - **Base de données** : appdb

---

## Architecture

```
BuddyCoach/
├── compose.yml          # Orchestration Docker (postgres, backend, frontend, adminer)
├── backend/             # API Express.js (port 5001)
│   ├── Dockerfile
│   ├── server.js
│   └── ...
└── front/               # React + Vite (port 5173)
    ├── Dockerfile
    ├── .env.android     # Config pour build Android
    └── ...
```
Samuel, Paul, Mateo