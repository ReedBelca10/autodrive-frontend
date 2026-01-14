# 🚗 AutoDrive Frontend - Documentation Complète

## Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation & Configuration](#installation--configuration)
4. [Structure du Projet](#structure-du-projet)
5. [Pages et Routes](#pages-et-routes)
6. [Composants Réutilisables](#composants-réutilisables)
7. [Hooks Personnalisés](#hooks-personnalisés)
8. [Gestion de l'État](#gestion-de-létat)
9. [Authentification](#authentification)
10. [Intégration API](#intégration-api)
11. [Paiements](#paiements)
12. [Upload de Fichiers](#upload-de-fichiers)
13. [Déploiement](#déploiement)
14. [Dépannage](#dépannage)

---

## Vue d'ensemble

**AutoDrive Frontend** est une application Next.js 15 pour une plateforme de location de véhicules en ligne. Elle offre :

- ✅ Interface responsive (mobile-first)
- ✅ Authentification JWT
- ✅ Listing de véhicules avec filtres
- ✅ Système de réservation en plusieurs étapes
- ✅ Paiements sécurisés (Stripe + FedaPay)
- ✅ Gestion des favoris
- ✅ Upload d'avatars et médias
- ✅ Dashboard admin complet
- ✅ Dashboard manager avec gestion véhicules
- ✅ Profil utilisateur
- ✅ Blog avec articles
- ✅ FAQ (Page publique + Admin)
- ✅ Newsletter (Inscription + Admin)
- ✅ Formulaire de contact
- ✅ Responsif sur tous les appareils

**Version**: 1.0.0
**Next.js**: v15.5.7
**React**: v19.1.0
**Node**: v18+

---

## Architecture

### Stack Technologique

```
Frontend
├── Framework: Next.js 15 (App Router)
├── Language: TypeScript 5
├── Styling: Tailwind CSS 4
├── Components: Shadcn UI + Custom
├── Payment: @stripe/react-stripe-js
├── HTTP Client: Native Fetch API
├── State: React Hooks (useState, useContext)
├── Icons: lucide-react
├── Forms: HTML5 + Custom validation
└── Storage: Supabase client
```

### Diagramme d'Architecture

```
┌──────────────────────────────────────────────────┐
│         Browser (Client-side)                     │
├──────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────┐  │
│ │    Next.js Frontend (Port 3000)            │  │
│ │                                            │  │
│ │  ┌──────────────────────────────────────┐ │  │
│ │  │  Pages (20+ routes)                  │ │  │
│ │  │  ├── Auth: login, register, reset    │ │  │
│ │  │  ├── Public: vehicles, blog, contact │ │  │
│ │  │  ├── Private: reservation, profile   │ │  │
│ │  │  ├── Admin: dashboard, management    │ │  │
│ │  │  └── Manager: dashboard, vehicles    │ │  │
│ │  └──────────────────────────────────────┘ │  │
│ │                                            │  │
│ │  ┌──────────────────────────────────────┐ │  │
│ │  │  Composants Réutilisables           │ │  │
│ │  │  ├── Navbar, Footer, Card           │ │  │
│ │  │  ├── Forms, Buttons, Modals         │ │  │
│ │  │  ├── PaymentMethodSelector          │ │  │
│ │  │  └── VehicleImage, AvatarDisplay    │ │  │
│ │  └──────────────────────────────────────┘ │  │
│ │                                            │  │
│ │  ┌──────────────────────────────────────┐ │  │
│ │  │  Hooks Personnalisés                 │ │  │
│ │  │  ├── useAvatarUpload                 │ │  │
│ │  │  └── useAuth (context)               │ │  │
│ │  └──────────────────────────────────────┘ │  │
│ │                                            │  │
│ │  ┌──────────────────────────────────────┐ │  │
│ │  │  Libraries                           │ │  │
│ │  │  ├── Supabase Storage Client         │ │  │
│ │  │  ├── Stripe Elements                 │ │  │
│ │  │  └── Utils & Helpers                 │ │  │
│ │  └──────────────────────────────────────┘ │  │
│ │                                            │  │
│ └────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────┤
│              HTTPS / API Calls                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  Backend (port 3001)   Stripe API   Supabase    │
│  MongoDB                FedaPay API  Payment API │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Flux de Navigation

```
Landing Page (/)
    ├── Navbar visible sur toutes les pages
    ├── Login → Auth pages
    ├── Vehicles → Listing + Détails
    ├── Blog → Articles
    ├── Contact → Formulaire
    └── Footer
    
Utilisateur Authentifié
    ├── Profile → Infos + Favoris + Réservations
    ├── Reservation → Multi-step form → Paiement
    ├── Dashboard Client → Mes réservations
    └── Logout
    
Manager Authentifié
    ├── Manager Dashboard → Liste véhicules
    ├── Vehicles Management → CRUD véhicules
    └── Reservations → Gerer ses réservations
    
Admin Authentifié
    ├── Admin Dashboard → Stats globales
    ├── Users Management → CRUD utilisateurs
    ├── Vehicles Management → Tous les véhicules
    ├── Agencies Management → Agences & managers
    ├── Reservations Management → Toutes les réservations
    ├── Blog Management → Articles
    ├── FAQ Management → Gérer les questions
    └── Newsletter Management → Liste des abonnés
```

---

## Installation & Configuration

### Prérequis

- Node.js >= 18
- npm ou pnpm
- Compte Supabase
- Clés Stripe

### Installation

```bash
# Cloner le repository
git clone <repo-url>
cd AutoDrive-Frontend

# Installer les dépendances
npm install
# ou
pnpm install

# Créer le fichier .env.local
cp .env.example .env.local

# Configurer les variables
nano .env.local
```

### Variables d'Environnement

```env
# Backend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_DOMAIN=localhost:3001

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: FedaPay (si applicable)
NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY=pk_live_...

# Environment
NODE_ENV=development
```

### Démarrage

```bash
# Développement
npm run dev

# Production build
npm run build
npm run start

# Lint
npm run lint

# Type checking
npm run type-check
```

---

## Structure du Projet

```
app/
├── layout.tsx              # Layout global avec Navbar/Footer
├── page.tsx                # Landing page
├── globals.css             # Styles globaux
│
├── auth/
│   ├── login/              # Page de connexion
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── register/           # Page d'inscription
│   ├── reset-password/     # Reset du mot de passe
│   └── forgot-password/    # Oublier mot de passe
│
├── faq/                    # Page FAQ publique
│   └── page.tsx
│
├── vehicles/               # Listing public des véhicules
│   ├── page.tsx            # Tous les véhicules avec filtres
│   ├── [id]/
│   │   └── page.tsx        # Détail d'un véhicule
│   └── layout.tsx
│
├── reservation/            # Réservation (multi-step)
│   ├── layout.tsx
│   ├── page.tsx            # Infos de réservation
│   ├── [id]/
│   │   ├── page.tsx        # Détails réservation
│   │   └── layout.tsx
│   └── checkout/
│       └── page.tsx        # Paiement (Stripe/FedaPay)
│
├── profile/                # Profil utilisateur
│   ├── layout.tsx
│   ├── page.tsx            # Infos personnelles + avatar
│   ├── favorites/          # Mes favoris
│   ├── reservations/       # Mes réservations
│   └── settings/           # Paramètres
│
├── admin/                  # Panel admin (protégé)
│   ├── layout.tsx
│   ├── page.tsx            # Dashboard admin
│   ├── users/
│   │   ├── page.tsx        # Gestion des utilisateurs
│   │   └── [id]/
│   │       └── page.tsx    # Détails utilisateur
│   ├── vehicles/
│   │   ├── page.tsx        # Gestion des véhicules
│   │   ├── new/
│   │   │   └── page.tsx    # Créer véhicule
│   │   └── [id]/
│   │       └── page.tsx    # Modifier véhicule
│   ├── agencies/           # Gestion des agences
│   ├── reservations/       # Gestion des réservations
│   ├── blog/               # Gestion du blog
│   └── messages/           # Messages de contact
│
├── manager/                # Panel manager (protégé)
│   ├── layout.tsx
│   ├── page.tsx            # Dashboard manager
│   └── vehicles/
│       ├── page.tsx        # Liste mes véhicules
│       ├── new/
│       │   └── page.tsx    # Créer véhicule
│       └── [id]/
│           └── page.tsx    # Modifier véhicule (NEW)
│
├── blog/                   # Blog public
│   ├── page.tsx            # Liste des articles
│   └── [slug]/
│       └── page.tsx        # Détail article
│
├── contact/                # Page de contact
│   └── page.tsx
│
├── about/                  # À propos
│   └── page.tsx
│
├── components/             # Composants réutilisables
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Card.tsx
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── VehicleImage.tsx    # Image optimisée
│   ├── AvatarDisplay.tsx   # Avatar utilisateur
│   ├── PaymentMethodSelector.tsx
│   ├── CheckoutForm.tsx    # Formulaire de paiement
│   ├── FedapayCheckout.tsx # Widget FedaPay
│   └── ui/                 # Shadcn UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Textarea.tsx
│       ├── Checkbox.tsx
│       ├── Dialog.tsx
│       └── ...
│
├── hooks/                  # Hooks personnalisés
│   └── useAvatarUpload.tsx
│
├── lib/                    # Utilitaires
│   ├── supabase.ts         # Client Supabase
│   └── utils.ts            # Fonctions utilitaires
│
└── public/                 # Fichiers statiques
    └── assets/

components/                # Composants root level
components.json           # Shadcn config
```

---

## Pages et Routes

### Pages Publiques

#### 1. **Landing Page** (`/`)
```tsx
// app/page.tsx
- Hero section avec CTA
- Véhicules en vedette
- Avantages du service
- Appel à l'action
```

#### 2. **Listing Véhicules** (`/vehicles`)
```tsx
// app/vehicles/page.tsx
- Grid de tous les véhicules
- Filtres:
  - City (auto-complété)
  - DateRange (checkout)
  - DailyRate (prix par jour)
  - BodyType (berline, suv, etc.)
  - Transmission
  - Fuel
- Pagination (20 véhicules/page)
- Recherche par nom/marque
```

#### 3. **Détail Véhicule** (`/vehicles/[id]`)
```tsx
// app/vehicles/[id]/page.tsx
- Galerie d'images (Supabase)
- Infos complètes:
  - Marque, modèle, année
  - Transmission, carburant
  - Équipements
  - Agence de location
- Avis utilisateurs (future feature)
- Bouton "Réserver maintenant"
- Favorite button (si connecté)
```

#### 4. **Blog** (`/blog`)
```tsx
// app/blog/page.tsx
- Liste des articles publiés
- Pagination
- Filtres par catégorie/tag
```

#### 5. **Détail Article** (`/blog/[slug]`)
```tsx
// app/blog/[slug]/page.tsx
- Contenu article complet
- Meta infos (auteur, date)
- Articles connexes
- Système de navigation
```

#### 6. **Contact** (`/contact`)
```tsx
// app/contact/page.tsx
- Formulaire avec champs:
  - Nom, Email, Téléphone
  - Sujet, Message
- Validation client-side
- Success/error messages
```

#### 7. **À Propos** (`/about`)
```tsx
// app/about/page.tsx
- Informations sur AutoDrive
- Historique
- Équipe
- Valeurs
```

#### 8. **FAQ** (`/faq`)
```tsx
// app/faq/page.tsx
- Accordéon de questions/réponses
- Filtres par catégorie
- Barre de recherche
- Section "Encore des questions?"
```

### Pages Authentifiées

#### 8. **Login** (`/auth/login`)
```tsx
// app/auth/login/page.tsx
- Formulaire:
  - Email
  - Password
- "Oublié le mot de passe" link
- "Créer compte" link
- Option OAuth (Google, Facebook)
- Validation errors
```

#### 9. **Register** (`/auth/register`)
```tsx
// app/auth/register/page.tsx
- Formulaire:
  - FirstName, LastName
  - Email, Phone
  - Password, ConfirmPassword
- Password strength indicator
- Conditions d'utilisation
- Déjà un compte? link
```

#### 10. **Profil Utilisateur** (`/profile`)
```tsx
// app/profile/page.tsx
- Avatar:
  - Upload via Supabase
  - Preview + Crop
  - Validation (jpg, png, max 5MB)
- Infos personnelles:
  - Éditable (firstName, lastName, phone)
  - Save changes
- Rôle et status
```

#### 11. **Favoris** (`/profile/favorites`)
```tsx
// app/profile/favorites/page.tsx
- Grid de mes favoris
- Bouton retirer
- Vide state avec CTA
```

#### 12. **Mes Réservations** (`/profile/reservations`)
```tsx
// app/profile/reservations/page.tsx
- Liste des réservations:
  - Confirmées
  - En attente
  - Annulées
- Filtres par status
- Détails réservation
- Bouton annuler (si pending)
```

#### 13. **Réservation** (`/reservation`)
```tsx
// app/reservation/page.tsx
Multi-step form (4 étapes):

1. Sélection du véhicule
   - Date début/fin
   - Agence récupération
   - Agence retour

2. Options
   - Assurance (basic/premium)
   - Services additionnels

3. Infos personnelles
   - FirstName, LastName
   - Email, Phone
   - DrivingLicense

4. Paiement
   - Récapitulatif prix
   - Sélection méthode (Stripe/FedaPay)
   - Bouttons Stripe/FedaPay
```

#### 14. **Checkout Stripe** (`/reservation/checkout`)
```tsx
// app/reservation/checkout/page.tsx
- Récapitulatif réservation
- Stripe Elements:
  - Card Element
  - Billing details
- Bouton "Payer avec Stripe"
- Success/Error handling
```

### Pages Manager

#### 15. **Dashboard Manager** (`/manager`)
```tsx
// app/manager/page.tsx
- Stats:
  - Total véhicules
  - Véhicules disponibles
  - Réservations ce mois
  - Revenus ce mois

- Liste mes véhicules:
  - Avec status (disponible/réservé/maintenance)
  - Bouton "Masquer" (remove from listing)
  - Bouton "Éditer"
  - Bouton "Ajouter un véhicule"

- Actions rapides
```

#### 16. **Mes Véhicules** (`/manager/vehicles`)
```tsx
// app/manager/vehicles/page.tsx
- Même que dashboard mais pour le CRUD
```

#### 17. **Modifier Véhicule** (`/manager/vehicles/[id]`)
```tsx
// app/manager/vehicles/[id]/page.tsx
- Formulaire complet:
  - Name, Brand, Model, Year
  - DailyRate
  - Transmission, Fuel, BodyType
  - Passengers
  - Description
  - Equipment (checkboxes)
  
- Media Management:
  - Upload jusqu'à 5 fichiers
  - Preview
  - Delete
  - Validation (jpg/png, max 10MB)

- Boutons: Save, Delete, Cancel
- Confirmation avant delete
```

#### 18. **Créer Véhicule** (`/manager/vehicles/new`)
```tsx
// app/manager/vehicles/new/page.tsx
- Même formulaire que modifier
- Pre-filled avec agencyId
```

### Pages Admin

#### 19. **Dashboard Admin** (`/admin`)
```tsx
// app/admin/page.tsx
- Analytics:
  - Total utilisateurs
  - Total réservations
  - Chiffre d'affaires
  - Ratio réservations confirmées

- Charts:
  - Revenue par mois
  - Véhicules les plus réservés
  - Users par rôle

- Quick actions
- Alertes importantes
```

#### 20. **Gestion Utilisateurs** (`/admin/users`)
```tsx
// app/admin/users/page.tsx
- Table avec colonnes:
  - Nom, Email, Rôle
  - Status, Créé le
  - Actions (voir, modifier, bloquer)

- Pagination
- Search
- Filtres par rôle
```

#### 21. **Gestion Véhicules** (`/admin/vehicles`)
```tsx
// app/admin/vehicles/page.tsx
- Table ou grid
- Colonnes:
  - Nom, Agence, Status
  - Daily Rate, Actions

- Bouton "Ajouter"
- Filtres par agence/status
```

#### 22. **Gestion Agences** (`/admin/agencies`)
```tsx
// app/admin/agencies/page.tsx
- Table:
  - Nom, Ville, Manager
  - Actions (éditer, supprimer)

- Bouton "Ajouter"
```

#### 23. **Gestion Réservations** (`/admin/reservations`)
```tsx
// app/admin/reservations/page.tsx
- Table:
  - ID, Client, Véhicule
  - Dates, Status, Paiement
  - Actions

- Filtres par status
- Export CSV
```

#### 24. **Gestion Blog** (`/admin/blog`)
```tsx
// app/admin/blog/page.tsx
- Table:
  - Titre, Auteur
  - Publié?, Status
  - Actions

- Créer/éditer/supprimer
- Publish workflow
```

#### 25. **Messages** (`/admin/messages`)
```tsx
// app/admin/messages/page.tsx
- Inbox des contacts
- Marquer comme lu
- Répondre par email
```

---

## Composants Réutilisables

### Layout Components

#### Navbar
```tsx
// components/Navbar.tsx
- Logo + Brand
- Navigation links
- Condition d'affichage par rôle:
  - Public: Login, Register, Vehicles, Blog, Contact
  - Authenticated: Profile, Reservations, Logout
  - Manager: Manager Dashboard, Vehicles
  - Admin: Admin Dashboard
- Mobile menu (hamburger)
- Avatar utilisateur (si connecté)
```

#### Footer
```tsx
// components/Footer.tsx
- Colonne 1: À propos
- Colonne 2: Liens rapides
- Colonne 3: Contact
- Colonne 4: Suivez-nous (socials)
- Copyright
```

#### Card
```tsx
// components/ui/Card.tsx
- Composant wrapper pour conteneurs
- Props: className, children
- Bordures et shadows
```

### Form Components

#### Button
```tsx
// components/ui/Button.tsx
- Variants: primary, secondary, danger, ghost
- Sizes: sm, md, lg
- Loading state
- Disabled state
- Icon support
```

#### Input
```tsx
// components/ui/Input.tsx
- Styled input field
- Label support
- Error messages
- Placeholder
- Types: text, email, password, number, date
```

#### Select
```tsx
// components/ui/Select.tsx
- Dropdown select
- Label + placeholder
- Options array
- Error handling
- Multi-select support
```

#### Textarea
```tsx
// components/ui/Textarea.tsx
- Multi-line text input
- Label + placeholder
- Resizable
- Error messages
```

#### Checkbox
```tsx
// components/ui/Checkbox.tsx
- Single/multiple
- Label
- Disabled state
```

### Feature Components

#### VehicleImage
```tsx
// components/VehicleImage.tsx
- Image optimisée avec Next/Image
- Lazy loading
- Fallback placeholder
- Gallery mode
- Props: url, alt, sizes
```

#### AvatarDisplay
```tsx
// components/AvatarDisplay.tsx
- Display avatar utilisateur
- Fallback initials
- Size variants
- Click pour éditer (si own profile)
```

#### PaymentMethodSelector
```tsx
// components/PaymentMethodSelector.tsx
- Radio buttons: Stripe vs FedaPay
- Icons pour chaque méthode
- Description courte
- Price display
```

#### CheckoutForm
```tsx
// components/CheckoutForm.tsx
- Stripe Elements form:
  - Card Element (nombres, cvc, expiry)
  - Billing details fields
  - Submit button
- Loading state pendant paiement
- Error handling
- Success callback
```

#### FedapayCheckout
```tsx
// components/FedapayCheckout.tsx
- Widget FedaPay embeddé
- Token generation
- Redirection vers FedaPay
- Callback handling
```

#### Modal
```tsx
// components/ui/Dialog.tsx
- Overlay modal
- Title, content, actions
- Close button
- Confirmation dialog variant
```

---

## Hooks Personnalisés

### useAvatarUpload
```tsx
// hooks/useAvatarUpload.tsx

interface UseAvatarUploadReturn {
  file: File | null;
  preview: string | null;
  loading: boolean;
  error: string | null;
  handleFileSelect: (file: File) => void;
  handleUpload: () => Promise<string>;
  handleCrop: (canvas: HTMLCanvasElement) => void;
}

const useAvatarUpload = (): UseAvatarUploadReturn => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    // Validation
    if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
      setError('Format non supporté');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Fichier trop lourd (max 5MB)');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError(null);
  };

  const handleUpload = async (): Promise<string> => {
    if (!file) return '';
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/avatar`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      return data.avatarUrl;
    } catch (err) {
      setError(err.message);
      return '';
    } finally {
      setLoading(false);
    }
  };

  const handleCrop = (canvas: HTMLCanvasElement) => {
    canvas.toBlob(blob => {
      const croppedFile = new File(
        [blob], 
        'avatar.png',
        { type: 'image/png' }
      );
      handleFileSelect(croppedFile);
    }, 'image/png');
  };

  return {
    file,
    preview,
    loading,
    error,
    handleFileSelect,
    handleUpload,
    handleCrop
  };
};
```

### useAuth
```tsx
// hooks/useAuth.tsx (contexte)

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'client';
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Gestion de l'État

### Context API pour l'Authentification

```tsx
// app/contexts/AuthContext.tsx

'use client';

import React, { createContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'client';
  agencyId?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
          { credentials: 'include' }
        );
        
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### State Local avec useState

```tsx
// Exemple: Composant Réservation

const ReservationForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicleId: '',
    startDate: '',
    returnDate: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    drivingLicense: '',
    insuranceOption: 'basic'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Reservation failed');
      
      // Success handling
      router.push('/profile/reservations');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Multi-step form JSX */}
    </form>
  );
};
```

---

## Authentification

### Login Flow

```
1. Utilisateur entre email + password
2. POST /auth/login au backend
3. Backend valide + hash bcrypt
4. Backend retourne JWT tokens
5. Tokens stockés en HttpOnly cookies
6. Frontend stocke user dans context
7. Requêtes futures: cookies envoyés automatiquement
```

### Protected Routes

```tsx
// app/profile/layout.tsx

'use client';

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

export default function ProfileLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  
  if (!user) {
    redirect('/auth/login');
  }

  return <div className="profile-layout">{children}</div>;
}
```

```tsx
// app/admin/layout.tsx

'use client';

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  return <div className="admin-layout">{children}</div>;
}
```

---

## Intégration API

### Client HTTP Setup

```tsx
// lib/apiClient.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FetchOptions extends RequestInit {
  baseURL?: string;
}

export const apiClient = async (
  endpoint: string,
  options: FetchOptions = {}
) => {
  const { baseURL = API_URL, ...fetchOptions } = options;

  const url = new URL(endpoint, baseURL);

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers
    },
    credentials: 'include' // Pour les cookies JWT
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};
```

### Utilisation dans les composants

```tsx
// app/vehicles/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    priceMax: 100000,
    bodyType: ''
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const query = new URLSearchParams();
        if (filters.city) query.append('city', filters.city);
        if (filters.priceMax) query.append('priceMax', filters.priceMax);
        if (filters.bodyType) query.append('bodyType', filters.bodyType);

        const data = await apiClient(`/vehicles?${query}`);
        setVehicles(data);
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [filters]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="vehicles-grid">
      {vehicles.map(vehicle => (
        <VehicleCard key={vehicle._id} vehicle={vehicle} />
      ))}
    </div>
  );
}
```

---

## Paiements

### Intégration Stripe

```tsx
// components/CheckoutForm.tsx

'use client';

import { useState } from 'react';
import {
  useStripe,
  useElements,
  CardElement
} from '@stripe/react-stripe-js';
import { apiClient } from '@/lib/apiClient';

export const CheckoutForm = ({ reservationId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // 1. Créer le PaymentIntent
      const paymentIntentData = await apiClient(
        `/reservations/${reservationId}/payment-intent`,
        {
          method: 'POST',
          body: JSON.stringify({ gateway: 'stripe' })
        }
      );

      // 2. Confirmer le paiement
      const result = await stripe.confirmCardPayment(
        paymentIntentData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: document.querySelector('[name="cardName"]')?.value,
              email: document.querySelector('[name="cardEmail"]')?.value
            }
          }
        }
      );

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // 3. Confirmer au backend
        await apiClient(
          `/reservations/${reservationId}/confirm-payment`,
          { method: 'POST' }
        );
        
        // Success!
        router.push(`/profile/reservations/${reservationId}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="form-group">
        <label>Numéro de carte</label>
        <CardElement />
      </div>

      <input
        type="text"
        name="cardName"
        placeholder="Nom sur la carte"
        required
      />

      <input
        type="email"
        name="cardEmail"
        placeholder="Email"
        required
      />

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Traitement...' : `Payer ${amount}XOF`}
      </button>
    </form>
  );
};
```

### Intégration FedaPay

```tsx
// components/FedapayCheckout.tsx

'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';

declare global {
  interface Window {
    FedaPay: any;
  }
}

export const FedapayCheckout = ({ reservationId, amount }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFedapayClick = async () => {
    setLoading(true);

    try {
      // 1. Créer la transaction FedaPay
      const transaction = await apiClient(
        `/reservations/${reservationId}/payment-intent`,
        {
          method: 'POST',
          body: JSON.stringify({ gateway: 'fedapay' })
        }
      );

      // 2. Ouvrir le checkout FedaPay
      window.FedaPay.checkout({
        publicKey: process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY,
        transaction: {
          id: transaction.transactionId
        },
        onComplete: async (transaction) => {
          // 3. Confirmer au backend
          await apiClient(
            `/reservations/${reservationId}/confirm-fedapay`,
            {
              method: 'POST',
              body: JSON.stringify({ transactionId: transaction.id })
            }
          );

          router.push(`/profile/reservations/${reservationId}`);
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.fedapay.com/checkout.js';
    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }, []);

  return (
    <div className="fedapay-checkout">
      {error && <div className="error">{error}</div>}
      
      <button
        onClick={handleFedapayClick}
        disabled={loading}
        className="fedapay-button"
      >
        {loading ? 'Traitement...' : `Payer ${amount}XOF avec FedaPay`}
      </button>
    </div>
  );
};
```

---

## Upload de Fichiers

### Avatar Upload

```tsx
// app/profile/page.tsx

'use client';

import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useState } from 'react';

export default function ProfilePage() {
  const {
    preview,
    loading,
    error,
    handleFileSelect,
    handleUpload
  } = useAvatarUpload();

  const handleSaveAvatar = async () => {
    const avatarUrl = await handleUpload();
    
    if (avatarUrl) {
      // Mettre à jour le contexte auth
      toast.success('Avatar mise à jour');
    }
  };

  return (
    <div className="profile-page">
      <section className="avatar-section">
        <h2>Avatar</h2>
        
        {preview && (
          <div className="preview">
            <img src={preview} alt="Aperçu" />
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />

        {error && <p className="error">{error}</p>}

        <button
          onClick={handleSaveAvatar}
          disabled={!preview || loading}
        >
          {loading ? 'Upload...' : 'Sauvegarder'}
        </button>
      </section>
    </div>
  );
}
```

### Véhicule Media Upload

```tsx
// app/manager/vehicles/[id]/page.tsx

const [mediaFiles, setMediaFiles] = useState<File[]>([]);
const [uploadError, setUploadError] = useState<string | null>(null);

const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);

  // Validation
  if (mediaFiles.length + files.length > 5) {
    setUploadError('Maximum 5 fichiers');
    return;
  }

  files.forEach(file => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setUploadError('Format non supporté');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Fichier trop lourd (max 10MB)');
      return;
    }
  });

  setMediaFiles([...mediaFiles, ...files]);
  setUploadError(null);
};

const handleUploadMedia = async () => {
  const formData = new FormData();
  mediaFiles.forEach((file, index) => {
    formData.append(`files`, file);
  });

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/vehicles/${vehicleId}/add-media`,
      {
        method: 'POST',
        body: formData,
        credentials: 'include'
      }
    );

    if (!response.ok) throw new Error('Upload failed');
    
    // Rafraîchir le véhicule
    const updated = await response.json();
    setVehicle(updated);
    setMediaFiles([]);
  } catch (error) {
    setUploadError(error.message);
  }
};
```

---

## Déploiement

### Vercel Deployment

```bash
# 1. Pousser le code vers GitHub
git push origin main

# 2. Connecter via Vercel Dashboard
# https://vercel.com/new

# 3. Configurer les variables d'environnement:
NEXT_PUBLIC_API_URL=https://api.autodrive.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 4. Deploy automatique à chaque push
```

### Environment Variables Production

```env
# Vercel .env.production
NEXT_PUBLIC_API_URL=https://api.autodrive.tg
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Performance Optimization

```tsx
// 1. Image optimization
import Image from 'next/image';

<Image
  src={vehicle.mediaUrl}
  alt={vehicle.name}
  width={400}
  height={300}
  quality={75}
  priority={false}
/>

// 2. Dynamic imports
const AdminDashboard = dynamic(() => import('@/app/admin/page'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

// 3. Font optimization
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
});

// 4. Metadata
export const metadata: Metadata = {
  title: 'AutoDrive - Location de véhicules',
  description: 'Louez un véhicule en ligne',
  keywords: 'location, voiture, togo',
  openGraph: {
    title: 'AutoDrive',
    description: 'Location de véhicules en ligne'
  }
};
```

---

## Dépannage

### Erreurs Communes

#### 1. CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Vérifier `NEXT_PUBLIC_API_URL` pointe vers le backend correct
- S'assurer que `credentials: 'include'` dans les fetch
- Vérifier CORS configuré au backend

```tsx
const response = await fetch(url, {
  credentials: 'include' // Important!
});
```

#### 2. JWT Token Invalid
```
Error: Invalid token
```

**Solution:**
- Vérifier que les cookies sont sauvegardés
- Vérifier pas de token expiré
- Rafraîchir le token si nécessaire

```tsx
const checkAuth = async () => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    credentials: 'include'
  });
  
  if (response.status === 401) {
    // Token expiré, redirect login
    router.push('/auth/login');
  }
};
```

#### 3. Image Not Loading
```
Error: Image failed to load
```

**Solution:**
- Vérifier URL de l'image
- Vérifier les permissions Supabase
- Vérifier le bucket public

```tsx
const [imageError, setImageError] = useState(false);

<Image
  src={url}
  onError={() => setImageError(true)}
/>

{imageError && <p>Image indisponible</p>}
```

#### 4. Form Submit Failed
```
Error: Submission failed
```

**Solution:**
- Vérifier la validation
- Vérifier la réponse API
- Afficher erreur détaillée

```tsx
try {
  const response = await apiClient('/endpoint', { method: 'POST' });
} catch (error) {
  console.error('Full error:', error);
  setError(error.message);
}
```

### Debug Tips

```bash
# Vérifier les cookies
Application > Cookies > localhost

# Vérifier les requêtes API
Network > XHR/Fetch > Regarder status + response

# Vérifier les erreurs console
F12 > Console > Erreurs

# Vérifier les variables d'env
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Logs Utiles

```tsx
// App layout
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Environment:', process.env.NODE_ENV);

// Auth context
console.log('Auth check result:', user);
console.log('Loading:', loading);

// Fetch calls
console.log('Fetching from:', url);
console.log('Response status:', response.status);
```

---

## Ressources & Documentation

- **Next.js Docs**: https://nextjs.org/docs
- **React 19 Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Stripe React**: https://stripe.com/docs/stripe-js/react
- **Supabase**: https://supabase.com/docs
- **Shadcn UI**: https://ui.shadcn.com

## Support

Pour toute question:
- Issues: GitHub issues
- Email: support@autodrive.tg
- Chat: Discord channel

## License

MIT
