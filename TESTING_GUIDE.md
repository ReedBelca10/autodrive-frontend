# 🚀 Guide de Test - Fonctionnalité Médias Véhicules

## Prérequis

### 1. Vérifier les variables d'environnement

#### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

#### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
MONGODB_URI=mongodb://...
```

## Démarrage des Services

### Terminal 1: Backend
```bash
cd AutoDrive-Backend
npm install  # Si première fois
npm run start:dev
# Devrait afficher: "NestApplication successfully started"
```

### Terminal 2: Frontend
```bash
cd AutoDrive-Frontend
npm install  # Si première fois
npm run dev
# Devrait afficher: "Ready in Xms"
```

## Tests Manuels

### ✅ Test 1: Vérifier les données en BD

```bash
# Vérifier qu'au moins un véhicule existe avec mediaUrls
# Utiliser MongoDB Compass ou MongoDB Shell:

db.vehicles.findOne({}, {name: 1, mediaUrls: 1})

# Résultat attendu:
# {
#   "_id": ObjectId("..."),
#   "name": "Ford Néo 6",
#   "mediaUrls": [
#     "https://[supabase-url]/storage/v1/object/public/vehicle_medias/vehicles/..."
#   ]
# }
```

### ✅ Test 2: Appel API - Récupérer tous les véhicules

```bash
curl -s http://localhost:3001/vehicles | jq '.[0]'
```

**Résultat attendu:**
```json
{
  "_id": "...",
  "name": "Ford Néo 6",
  "dailyRate": 209,
  "mediaUrls": ["https://..."],
  ...
}
```

**Vérifications:**
- [x] `mediaUrls` n'est pas vide
- [x] Les URLs commencent par `https://`
- [x] Les URLs contiennent `/storage/v1/object/public/vehicle_medias/`

### ✅ Test 3: Appel API - Récupérer un véhicule spécifique

```bash
# Remplacer VEHICLE_ID par l'_id du véhicule
curl -s http://localhost:3001/vehicles/{VEHICLE_ID} | jq '.'
```

**Vérifications:**
- [x] Le statut est 200
- [x] `mediaUrls` est un tableau non vide
- [x] Toutes les propriétés sont présentes

### ✅ Test 4: Frontend - Liste des Véhicules

1. Ouvrir: http://localhost:3000/vehicles
2. **Vérifications:**
   - [x] Les cartes des véhicules s'affichent
   - [x] Les images de la première image s'affichent
   - [x] Si pas d'image: icône "Pas d'image" visible
   - [x] Les badges "Disponible" et prix s'affichent
   - [x] Les spécifications (places, carburant, etc.) s'affichent

3. **Console (F12):**
   ```
   Vehicle {vehicleName} media URLs: [...]
   ✓ Doit voir les URLs affichées
   ```

### ✅ Test 5: Frontend - Page Détails

1. Cliquer sur un véhicule
2. **Vérifications:**
   - [x] La page se charge (pas d'erreur)
   - [x] L'image principale s'affiche
   - [x] Les vignettes des autres images s'affichent
   - [x] Cliquer sur une vignette change l'image principale

3. **Interactions:**
   - [x] Cliquer sur "Réserver ce véhicule" - devrait rediriger
   - [x] Cliquer sur "Ajouter aux favoris" - devrait fonctionner
   - [x] Retour aux véhicules - devrait revenir à la liste

### ✅ Test 6: Gestion d'Erreur - Image Invalide

1. Dans MongoDB, ajouter une URL invalide:
   ```bash
   db.vehicles.updateOne(
     { _id: ObjectId("...") },
     { $push: { mediaUrls: "https://example.com/invalid.jpg" } }
   )
   ```

2. Rafraîchir la page: http://localhost:3000/vehicles
3. **Vérifications:**
   - [x] Le composant `VehicleImage` affiche le fallback
   - [x] Pas d'erreur dans la console (sauf erreur réseau attendue)
   - [x] Les autres images s'affichent correctement

### ✅ Test 7: Filtrage et Recherche

1. Sur http://localhost:3000/vehicles
2. **Tester les filtres:**
   - [x] Recherche par nom
   - [x] Filtrer par type (SUV, berline, etc.)
   - [x] Filtrer par carburant
   - [x] Filtrer par transmission
   - [x] Filtrer par prix

3. **Vérifications:**
   - [x] Les images s'affichent toujours correctement
   - [x] Les filtres réduisent la liste

### ✅ Test 8: Upload de Media (Admin)

Voir [MEDIA_MANAGEMENT_GUIDE.md](./MEDIA_MANAGEMENT_GUIDE.md#1-upload-dune-image-admin)

```bash
curl -X POST http://localhost:3001/vehicles/upload/media \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@test-image.jpg"
```

**Résultat attendu:**
```json
{
  "publicUrl": "https://[supabase-url]/storage/v1/object/public/vehicle_medias/vehicles/[timestamp]_[random]_test-image.jpg"
}
```

### ✅ Test 9: Association du Media au Véhicule (Admin)

```bash
curl -X POST http://localhost:3001/vehicles/{VEHICLE_ID}/add-media \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"mediaUrl": "https://[supabase-url]/storage/v1/object/public/vehicle_medias/vehicles/..."}'
```

## Checklist Complète

- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Les véhicules s'affichent sur la page liste
- [ ] Les images s'affichent correctement
- [ ] La page détails charge les données depuis l'API
- [ ] La galerie d'images fonctionne
- [ ] Les filtres fonctionnent
- [ ] La gestion d'erreur s'affiche correctement
- [ ] Aucune erreur dans la console (sauf warnings normaux)
- [ ] Les logs de débogage s'affichent en console

## Logs de Débogage

### Frontend
Ouvrir la console (F12) et vérifier les logs:
```
"Fetching vehicles from: http://localhost:3001/vehicles"
"Response status: 200"
"Vehicles received: [...]"
"Vehicle {name} media URLs: [...]"
```

### Backend
Vérifier les logs du terminal:
```
Uploading file: {filename} to bucket: vehicle_medias
Upload successful: {...}
Public URL: https://...
Retrieved {count} vehicles
Retrieved vehicle: {name}
```

## Troubleshooting

### Les images ne s'affichent pas

1. **Vérifier la console (F12):**
   - Y a-t-il des erreurs CORS?
   - Y a-t-il une erreur 404?
   - Y a-t-il une erreur de chargement d'image?

2. **Vérifier les URLs:**
   ```bash
   curl -I "https://[supabase-url]/storage/v1/object/public/vehicle_medias/vehicles/..."
   # Doit retourner: 200 OK
   ```

3. **Vérifier Supabase:**
   - Le bucket `vehicle_medias` existe?
   - Le bucket est PUBLIC?
   - Les fichiers existent dans le dossier `vehicles/`?

### Erreur 404 sur /vehicles/:id

1. Vérifier l'ID du véhicule: `ObjectId` MongoDB valide?
2. Vérifier en MongoDB: `db.vehicles.findById("...")`
3. Vérifier les logs du backend

### Les filtres ne fonctionnent pas

1. Vérifier la console du navigateur (F12)
2. Vérifier les valeurs des filtres
3. Vérifier la casse (les filtres sont case-insensitive)

## Performance

### Optimisations en Place
- [x] Images optimisées avec Next.js `Image` component
- [x] Skeleton loader pendant le chargement
- [x] `.lean()` dans les requêtes MongoDB
- [x] URLs normalisées et cachées

### À Considérer
- [ ] Implémenter une pagination sur la liste des véhicules
- [ ] Mettre en cache les images côté client
- [ ] Compresser les images à l'upload
- [ ] Utiliser un CDN pour les images

## Support

Si vous rencontrez des problèmes:
1. Consulter [MEDIA_MANAGEMENT_GUIDE.md](./MEDIA_MANAGEMENT_GUIDE.md#dépannage)
2. Vérifier les logs (console et backend)
3. Vérifier [MEDIA_IMPLEMENTATION_CHECKLIST.md](./MEDIA_IMPLEMENTATION_CHECKLIST.md)
