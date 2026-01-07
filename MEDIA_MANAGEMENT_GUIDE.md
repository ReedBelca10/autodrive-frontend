# Guide de Configuration des Médias des Véhicules

## Overview

Ce guide explique comment configurer et utiliser le système de gestion des médias (images) des véhicules via Supabase.

## Architecture

### Frontend
- **Components**: `components/VehicleImage.tsx` - Composant réutilisable pour afficher les images avec gestion d'erreur
- **Pages**: 
  - `app/vehicles/page.tsx` - Liste des véhicules avec images
  - `app/vehicles/[id]/page.tsx` - Page de détail du véhicule avec galerie d'images
- **Utils**: `lib/supabase.ts` - Helper pour générer les URLs Supabase

### Backend
- **Service**: `src/vehicles/vehicles.service.ts` - Gère les opérations CRUD des véhicules
- **Upload**: `src/vehicles/vehicles-upload.service.ts` - Gère l'upload vers Supabase
- **Controller**: `src/vehicles/vehicles.controller.ts` - Endpoints API

## Flux de Téléchargement d'Images

### 1. Upload d'une Image (Admin)

```bash
curl -X POST http://localhost:3001/vehicles/upload/media \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@path/to/image.jpg"
```

**Réponse:**
```json
{
  "publicUrl": "https://[supabase-url]/storage/v1/object/public/vehicle_medias/vehicles/[timestamp]_[random]_[filename].jpg"
}
```

### 2. Associer l'Image à un Véhicule

```bash
curl -X POST http://localhost:3001/vehicles/{vehicleId}/add-media \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"mediaUrl": "https://[supabase-url]/storage/v1/object/public/vehicle_medias/vehicles/[path]"}'
```

## Structure des Données

### Schéma Vehicle (MongoDB)
```typescript
{
  _id: ObjectId,
  name: string,
  dailyRate: number,
  passengers: number,
  year: number,
  transmission: string, // 'automatique' | 'manuelle' | 'semi-automatique'
  fuel: string, // 'essence' | 'diesel' | 'électrique' | 'hybride'
  city: string,
  agencyId: ObjectId,
  bodyType: string, // 'berline' | 'suv' | 'camionnette' | 'monospace' | 'cabriolet' | 'coupé' | 'break'
  description: string,
  equipment: string[],
  mediaUrls: string[], // URLs Supabase des images
  reviews: {
    totalRatings: number,
    averageRating: number,
    reviews: Array<{...}>
  },
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Configuration Supabase

### Bucket: `vehicle_medias`

Assurez-vous que:
1. Le bucket est **PUBLIC** (readable by everyone)
2. La structure des dossiers est: `vehicle_medias/vehicles/{filename}`
3. Les CORS sont configurés correctement

### Variables d'Environnement Frontend
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

### Variables d'Environnement Backend
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

## Endpoints API

### GET /vehicles
Récupère tous les véhicules actifs avec leurs médias.

**Réponse:**
```json
[
  {
    "_id": "...",
    "name": "Ford Néo 6",
    "dailyRate": 209,
    "passengers": 2,
    "year": 2022,
    "transmission": "Semi-automatique",
    "fuel": "Diesel",
    "city": "Abidjan",
    "bodyType": "berline",
    "description": "...",
    "equipment": ["climatisation", "gps", ...],
    "mediaUrls": [
      "https://[supabase-url]/storage/v1/object/public/vehicle_medias/vehicles/[path]"
    ],
    "isActive": true,
    ...
  }
]
```

### GET /vehicles/:id
Récupère un véhicule spécifique avec tous ses détails et médias.

### POST /vehicles/upload/media (Admin)
Upload un fichier image vers Supabase.

**Request:**
```
POST /vehicles/upload/media
Headers: Authorization: Bearer <JWT_TOKEN>
Body: multipart/form-data avec field "file"
```

### POST /vehicles/:id/add-media (Admin)
Associe une URL de média à un véhicule.

**Request:**
```json
{
  "mediaUrl": "https://[supabase-url]/storage/v1/object/public/vehicle_medias/vehicles/[path]"
}
```

## Dépannage

### 1. Les images ne s'affichent pas

**Symptômes:** Les véhicules s'affichent mais sans images.

**Solutions:**
1. Vérifier que `mediaUrls` n'est pas vide dans la base de données
2. Vérifier que les URLs dans `mediaUrls` sont valides
3. Vérifier que le bucket `vehicle_medias` est PUBLIC
4. Ouvrir la console du navigateur (F12) pour voir les erreurs de chargement d'images

### 2. CORS Error sur Supabase

**Solutions:**
1. Aller dans Supabase Dashboard
2. Aller dans Storage > vehicle_medias > Configuration
3. Vérifier que les CORS sont configurés avec le domaine du frontend

### 3. Les URLs ne sont pas générées lors de l'upload

**Solutions:**
1. Vérifier que le service `VehiclesUploadService` est correctement configuré
2. Vérifier les variables d'environnement `SUPABASE_URL` et `SUPABASE_KEY`
3. Vérifier les logs du backend avec `console.log`

## Gestion d'Erreur Frontend

Le composant `VehicleImage` affiche automatiquement:
- Un skeleton loader pendant le chargement
- Une icône "Pas d'image" si l'URL est invalide ou le chargement échoue
- L'image une fois chargée

## Normalisation des URLs

Les URLs des médias sont normalisées (trimmed et validées) lors de:
1. La récupération depuis la base de données (`findAll`, `findById`)
2. L'ajout d'une nouvelle URL (`addMediaUrl`)

Cela garantit que les URLs sont toujours propres et valides.

## Prochaines Étapes

1. **Suppression de médias**: Implémenter une endpoint pour supprimer les images
2. **Compression d'images**: Ajouter une compression avant l'upload
3. **Mise en cache**: Implémenter une mise en cache côté client
4. **Watermark**: Ajouter un watermark aux images uploadées
5. **CDN**: Utiliser un CDN pour optimiser la livraison des images
