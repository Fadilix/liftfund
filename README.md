# API Plateforme de Campagnes - Caleb

## Description
API REST pour une plateforme de gestion de campagnes avec système d'authentification complet pour utilisateurs et administrateurs.

## Fonctionnalités Implémentées

### 🔐 Authentification
- **Inscription utilisateur** avec vérification email (OTP)
- **Upload de fichiers** d'identité lors de l'inscription
- **Connexion utilisateur** et administrateur
- **Validation par administrateur** des inscriptions
- **JWT tokens** pour l'authentification
- **Rate limiting** pour la sécurité

### 👥 Gestion des utilisateurs
- Statut de vérification email (OTP)
- Statut d'approbation par admin
- Upload de documents d'identité
- Système de notifications email

### 🛡️ Administration
- Dashboard avec statistiques
- Gestion des utilisateurs en attente
- Approbation/rejet des inscriptions
- Création d'autres administrateurs
- Vue globale de la plateforme

## Technologies
- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM pour PostgreSQL
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **Nodemailer** - Envoi d'emails
- **Multer** - Upload de fichiers
- **Joi** - Validation des données

## Installation

### Prérequis
- Node.js 18+
- PostgreSQL
- pnpm (recommandé) ou npm

### Étapes d'installation

1. **Cloner le projet et installer les dépendances**
```bash
git clone <repo-url>
cd api-caleb
pnpm install
```

2. **Configuration de l'environnement**
```bash
cp .env.example .env
# Modifier les variables dans .env
```

3. **Configurer la base de données**
```bash
# Créer la base de données PostgreSQL
createdb api_caleb

# Générer le client Prisma
pnpm run db:generate

# Exécuter les migrations
pnpm run db:migrate
```

4. **Créer un administrateur par défaut**
```bash
npx tsx scripts/create-admin.ts
```

5. **Démarrer l'application**
```bash
# Développement
pnpm run dev

# Production
pnpm run build
pnpm start
```

## Variables d'environnement

```env
# Base
NODE_ENV=development
PORT=3000

# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/api_caleb"

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=24h

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# OTP
OTP_EXPIRES_IN=300000
```

## Endpoints API

### 🔐 Authentification (`/api/v1/auth`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/register` | Inscription utilisateur avec fichiers |
| POST | `/verify-otp` | Vérification code OTP |
| POST | `/resend-otp` | Renvoyer code OTP |
| POST | `/login` | Connexion utilisateur |
| POST | `/admin/login` | Connexion administrateur |

### 👑 Administration (`/api/v1/admin`) - Authentification requise

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard` | Statistiques du dashboard |
| GET | `/users/pending` | Utilisateurs en attente d'approbation |
| GET | `/users` | Tous les utilisateurs |
| PUT | `/users/:id/approve` | Approuver un utilisateur |
| PUT | `/users/:id/reject` | Rejeter un utilisateur |
| GET | `/admins` | Liste des administrateurs |
| POST | `/admins` | Créer un nouvel administrateur |

### 📊 Général

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/health` | Vérification santé de l'API |

## Structure du projet

```
src/
├── controllers/        # Contrôleurs
├── middleware/         # Middlewares (auth, upload)
├── routes/            # Définition des routes
├── services/          # Logique métier
├── types/             # Types TypeScript
├── utils/             # Utilitaires (auth, email, validation)
└── index.ts           # Point d'entrée

prisma/
└── schema.prisma      # Schéma de base de données

scripts/
└── create-admin.ts    # Script création admin
```

## Processus d'inscription

1. **Utilisateur** remplit le formulaire d'inscription avec fichiers d'identité
2. **Système** envoie un code OTP par email
3. **Utilisateur** vérifie son email avec le code OTP
4. **Administrateur** examine l'inscription et les documents
5. **Administrateur** approuve ou rejette l'inscription
6. **Utilisateur** reçoit un email de confirmation
7. **Utilisateur** peut se connecter si approuvé

## Sécurité

- Mots de passe hashés avec bcrypt (12 rounds)
- JWT tokens avec expiration
- Rate limiting (100 req/15min par défaut)
- Validation stricte des données avec Joi
- Headers de sécurité avec Helmet
- CORS configuré
- Upload sécurisé (types et taille limités)

## Base de données

Le schéma comprend :
- **Users** - Porteurs de campagnes
- **Admins** - Administrateurs
- **Campaigns** - Campagnes de collecte
- **Donations** - Donations
- **Transactions** - Transactions financières
- **Media** - Fichiers uploadés
- **OtpVerification** - Codes de vérification temporaires

## Scripts disponibles

```bash
pnpm run dev          # Développement avec rechargement
pnpm run build        # Compilation TypeScript
pnpm run start        # Démarrage production
pnpm run db:migrate   # Migrations Prisma
pnpm run db:generate  # Génération client Prisma
pnpm run db:reset     # Reset base de données
pnpm run db:studio    # Interface graphique Prisma
```

## Administrateur par défaut

Après installation :
- **Email**: admin@caleb.com
- **Mot de passe**: Admin123!

⚠️ **Important**: Changez ce mot de passe lors de la première connexion !

## Support

Pour toute question ou problème, consultez les logs du serveur ou contactez l'équipe de développement.
# liftfund
