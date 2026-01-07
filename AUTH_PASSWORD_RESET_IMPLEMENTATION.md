# Implémentation - Réinitialisation de Mot de Passe par Email

## Vue d'ensemble

La fonctionnalité de réinitialisation de mot de passe par email a été complètement implémentée. Cela permet aux utilisateurs d'AutoDrive de réinitialiser leur mot de passe s'ils l'oublient.

## Modifications Effectuées

### Backend (NestJS/MongoDB)

#### 1. Schéma Utilisateur - `src/users/schemas/user.schema.ts`
- ✅ Ajout de `resetPasswordToken?: string` - Token haché pour la réinitialisation
- ✅ Ajout de `resetPasswordExpires?: Date` - Date d'expiration du token

#### 2. Service Email - `src/common/services/email.service.ts` (NOUVEAU)
- ✅ Création du service EmailService avec nodemailer
- ✅ Méthode `sendPasswordResetEmail()` - Envoie le lien de réinitialisation
- ✅ Méthode `sendPasswordChangeConfirmation()` - Confirmation après changement
- ✅ Emails HTML formatés et professionnels

#### 3. Service d'Authentification - `src/auth/auth.service.ts`
- ✅ Ajout de `requestPasswordReset(email)` - Génère un token et envoie l'email
- ✅ Ajout de `resetPassword(token, newPassword)` - Valide le token et change le mot de passe
- ✅ Import du EmailService

#### 4. Service Utilisateurs - `src/users/users.service.ts`
- ✅ Ajout de `setPasswordResetToken()` - Sauvegarde le token haché
- ✅ Ajout de `findByResetToken()` - Cherche l'utilisateur par token
- ✅ Ajout de `updatePassword()` - Met à jour le mot de passe et supprime le token

#### 5. Contrôleur d'Authentification - `src/auth/auth.controller.ts`
- ✅ Endpoint POST `/auth/forgot-password` - Demande une réinitialisation
- ✅ Endpoint POST `/auth/reset-password` - Complète la réinitialisation
- ✅ Validation des entrées

#### 6. Module d'Authentification - `src/auth/auth.module.ts`
- ✅ Import du EmailService dans les providers

### Frontend (Next.js/React)

#### 1. Page "Mot de Passe Oublié" - `app/auth/forgot-password/page.tsx` (NOUVEAU)
- ✅ Formulaire pour demander une réinitialisation
- ✅ Validation de l'email
- ✅ Affichage de succès avec instructions
- ✅ Gestion des erreurs
- ✅ Design cohérent avec AutoDrive

#### 2. Page "Réinitialiser le Mot de Passe" - `app/auth/reset-password/page.tsx` (NOUVEAU)
- ✅ Récupération du token depuis l'URL
- ✅ Formulaire pour définir un nouveau mot de passe
- ✅ Validation des mots de passe
- ✅ Affichage/masquage du mot de passe
- ✅ Indicateurs de sécurité
- ✅ Affichage de succès
- ✅ Gestion des erreurs et tokens expirés

#### 3. Page Connexion Mise à Jour - `app/login/LoginForm.tsx`
- ✅ Lien "Mot de passe oublié?" mis à jour vers `/auth/forgot-password`

## Flux Utilisateur

```
1. Utilisateur sur page /login
   ↓
2. Clique sur "Mot de passe oublié?"
   ↓
3. Redirigé vers /auth/forgot-password
   ↓
4. Entre son email → POST /auth/forgot-password
   ↓
5. Reçoit un email avec lien de réinitialisation
   ↓
6. Clique sur le lien (URL contient le token)
   ↓
7. Redirigé vers /auth/reset-password?token=xxx
   ↓
8. Entre nouveau mot de passe → POST /auth/reset-password
   ↓
9. Mot de passe réinitialisé avec succès
   ↓
10. Peut se connecter avec le nouveau mot de passe
```

## Sécurité

- ✅ Tokens hashés avant stockage (SHA-256)
- ✅ Tokens à usage unique (supprimés après utilisation)
- ✅ Expiration après 1 heure
- ✅ Validation du mot de passe (minimum 6 caractères)
- ✅ Information disclosure prevention (pas de révélation si email existe)
- ✅ Confirmation par email après changement

## Configuration Requise

### Variables d'Environnement Backend

```env
# Email (Gmail ou autre service)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Mot de passe d'application
FRONTEND_ORIGIN=http://localhost:3000
```

### Installation

`nodemailer` est déjà dans les dépendances du projet.

## Tests

Deux fichiers de test ont été créés:

1. **test-password-reset.sh** - Script bash pour Linux/Mac
2. **test-password-reset.ps1** - Script PowerShell pour Windows

Utilisez-les pour tester l'API manuellement.

## Fichiers Documentations

- **PASSWORD_RESET_GUIDE.md** - Guide complet de configuration et utilisation

## Endpoints API

### Demander une réinitialisation
```
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "utilisateur@example.com"
}

Response (200):
{
  "message": "Email de réinitialisation envoyé"
}
```

### Réinitialiser le mot de passe
```
POST /auth/reset-password
Content-Type: application/json

{
  "token": "token-du-lien-email",
  "password": "nouveau-mot-de-passe"
}

Response (200):
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

## Prochaines Étapes (Optionnel)

- Ajouter un système de 2FA (Two-Factor Authentication)
- Ajouter des limites de débit (rate limiting) sur les endpoints
- Ajouter des logs d'audit pour les changements de mot de passe
- Implémenter un système de récupération via SMS
- Ajouter un code de vérification par SMS en plus de l'email

## Résumé

✅ Fonctionnalité complètement implémentée et testable
✅ Pages frontend créées et stylisées
✅ Backend avec endpoints sécurisés
✅ Emails avec design professionnel
✅ Documentation complète fournie
