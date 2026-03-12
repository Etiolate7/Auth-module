# 🔐 Secure Auth Module

Un module d'authentification robuste et sécurisé pour applications SaaS, conçu pour protéger contre les attaques courantes tout en offrant une expérience utilisateur optimale.

## 🏗️ Architecture

![Flux d'authentification](./docs/auth-flow.png)

### Vue d'ensemble du flux
1. **Inscription/Connexion** → Création d'une session
2. **Génération de tokens** → Access token (JWT) + Refresh token
3. **Stockage sécurisé** → Refresh token hashé en DB, cookie httpOnly
4. **Validation** → Middleware JWT pour routes protégées
5. **Rotation** → Nouveau refresh token à chaque utilisation
6. **Révocation** → Suppression de session au logout

## 🛡️ Menaces & Mitigations

| Menace | Mitigation implémentée |
|--------|------------------------|
| **Vol de JWT** | Access tokens courts (15min) + rotation des refresh tokens |
| **XSS (Cross-Site Scripting)** | Refresh token en cookie httpOnly (inaccessible au JS) |
| **CSRF** | Cookie avec SameSite=Strict/Lax |
| **Reuse de token** | Rotation + détection + purge des sessions |
| **Brute force** | Rate limiting (5 tentatives/minute) |
| **Session hijacking** | Fingerprint (userAgent, IP) + rotation |

## 🔧 Choix Techniques

### Pourquoi deux tokens ?
- **Access token court (15min)** : Réduit la fenêtre de tir en cas de vol
- **Refresh token long (7 jours)** : Maintient la session utilisateur
- **Séparation** : On peut révoquer le refresh sans toucher à l'access

### Pourquoi des cookies httpOnly ?
- **Protection XSS** : Le JavaScript ne peut pas lire le refresh token
- **Envoi automatique** : Le navigateur gère l'envoi
- **Configuration fine** : Path, secure, sameSite paramétrables

### Pourquoi la rotation des refresh tokens ?
- **Détection de vol** : Si un ancien token est réutilisé → alerte
- **Inviolabilité** : Chaque utilisation invalide le précédent
- **Sécurité proactive** : Purge automatique en cas de compromission

### Pourquoi un modèle de sessions multi-devices ?
- **Visibilité** : L'utilisateur voit ses connexions actives
- **Contrôle** : Possibilité de révoquer des sessions individuelles
- **Audit** : Traçabilité (IP, userAgent, dates)

## Instalation
### Étapes
# 1. Cloner le repository
git clone https://github.com/votre-repo/secure-auth-module.git
cd secure-auth-module

# 2. Installer les dépendances
yarn install

# 3. Configurer vos variables d'environnement
JWT_SECRET=votre_secret_très_long_et_aléatoire
MONGODB_URI=mongodb://localhost:27017/auth_db
NODE_ENV=development

# 4. Démarrer le serveur
yarn dev

### Authentification publique

| Méthode | Route | Description | Rate Limit |
|:-------:|------|-------------|:----------:|
| **POST** | `/users/inscription` | Créer un compte | 3/heure |
| **POST** | `/users/connexion` | Se connecter | 5/minute |
| **POST** | `/users/refresh` | Rafraîchir l'access token | 10/minute |

### Routes protégées (JWT requis)

| Méthode | Route | Description |
|:-------:|------|-------------|
| **GET** | `/users/profil` | Infos utilisateur |
| **GET** | `/users/sessions` | Lister les sessions |
| **POST** | `/users/logout` | Déconnexion (session courante) |
| **POST** | `/users/logout/all` | Déconnexion globale |
| **DELETE** | `/users/sessions/:id` | Révoquer une session |

## Structure de la base de données
# Collection users

{ _id: ObjectId,
  email: String (unique),
  password: String (hashé),
  created: Date }
  
# Collection sessions

{ _id: ObjectId,
  userId: ObjectId (ref: users),
  refreshTokenHash: String (unique),
  expiresAt: Date,
  createdAt: Date,
  lastUsedAt: Date,
  userAgent: String,
  ipAddress: String,
  revokedAt: Date (null si active) }
  
# Collection usedtokens (pour détection de reuse)

{ _id: ObjectId,
  tokenHash: String (unique),
  userId: ObjectId,
  usedAt: Date,
  expiresAt: Date (TTL index) }
  
### Limites connues
Ce projet est volontairement concentré sur le cœur de l'authentification. Il ne gère pas :

❌ Confirmation d'email
❌ Reset de mot de passe
❌ OAuth (Google, GitHub, etc.)
❌ Interface utilisateur avancée
❌ 2FA (Double authentification)

Ces fonctionnalités pourraient être ajoutées dans une version future, mais l'objectif principal était de démontrer une architecture d'authentification robuste et sécurisée !
