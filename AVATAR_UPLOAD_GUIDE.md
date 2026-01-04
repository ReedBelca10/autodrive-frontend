# Guide de Test - Fonctionnalité Upload d'Avatar

## Résumé des Corrections

La fonctionnalité d'upload d'avatar a été complètement optimisée pour assurer une mise à jour dynamique et instantanée de l'image. Voici ce qui a été corrigé :

### Problèmes Résolus

1. **Cache-busting amélioré** : L'image n'était pas mise à jour car le navigateur la récupérait depuis le cache
   - ✅ Solution : Ajout de timestamp unique (`v=TIMESTAMP`) à chaque upload
   - ✅ Le backend ajoute automatiquement le cache-buster
   - ✅ Le frontend force la mise à jour en utilisant un `key` qui change

2. **Re-render optimisé** : Le composant n'était pas re-rendu après l'upload
   - ✅ Solution : Utilisation d'un `useEffect` dans `AvatarDisplay` pour détecter les changements d'URL
   - ✅ Incrémentation du `imageKey` pour forcer React à recréer l'élément `<img>`

3. **Validation et gestion d'erreurs** : Meilleure validation des fichiers
   - ✅ Types MIME validés (JPEG, PNG, WebP, GIF)
   - ✅ Limite de taille (5MB maximum)
   - ✅ Messages d'erreur clairs

4. **Stockage Supabase** : Upload et stockage sécurisé
   - ✅ Les fichiers sont uploadés dans Supabase Storage
   - ✅ Les anciennes images sont supprimées automatiquement
   - ✅ Les URLs sont générées avec cache-buster

## Processus Complet d'Upload d'Avatar

```
Utilisateur sélectionne une image
           ↓
Validation du fichier (type + taille)
           ↓
Affichage de l'aperçu (preview) immédiat
           ↓
Upload vers Supabase Storage
           ↓
Réception de l'URL avec cache-buster
           ↓
Mise à jour de l'état utilisateur
           ↓
Re-render du composant avec nouvelle clé
           ↓
Navigateur force la recharge de l'image
           ↓
Image affichée et mise à jour immédiatement ✅
           ↓
Refetch du profil pour synchroniser la BD (500ms)
```

## Comment Tester

### 1. Accéder à la Page de Profil
```bash
1. Ouvrir http://localhost:3000/profile
2. La page affiche votre profil avec un avatar
3. L'avatar a un bouton "+" en bas à droite
```

### 2. Uploader une Nouvelle Image
```bash
1. Cliquer sur le bouton "+" de l'avatar
2. Sélectionner une image (JPG, PNG, WebP ou GIF)
3. L'aperçu s'affiche immédiatement
4. L'upload commence avec un spinner
5. L'image se met à jour automatiquement une fois uploadée ✅
```

### 3. Vérifier le Stockage Supabase
```bash
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans "Storage" → "avatars"
4. Vous devriez voir un dossier avec votre ID utilisateur
5. À l'intérieur, les images avec timestamps (ex: 1704326400000-photo.jpg)
```

### 4. Vérifier la Base de Données
```bash
1. Dans Supabase, aller dans "SQL Editor"
2. Exécuter :
   SELECT _id, email, avatarUrl, avatarPath FROM users WHERE email = 'votre@email.com';
3. Vous verrez :
   - avatarUrl : URL complète avec cache-buster (?v=TIMESTAMP)
   - avatarPath : Chemin du fichier dans Storage (ex: userid/1704326400000-photo.jpg)
```

### 5. Tester le Changement Dynamique
```bash
1. Upload une première image → Elle s'affiche
2. Upload une deuxième image → Elle remplace la première immédiatement
3. Rafraîchir la page → Vous voyez la deuxième image (à jour en BD)
4. L'ancienne image est supprimée de Supabase automatiquement
```

## Fichiers Modifiés

### Frontend
- ✅ `app/profile/ProfileClient.tsx` - Composant principal avec gestion du profil
- ✅ `app/components/AvatarUpload.tsx` - Composant d'upload d'avatar
- ✅ `app/components/AvatarDisplay.tsx` - Composant d'affichage avec cache-busting dynamique
- ✅ `app/hooks/useAvatarUpload.ts` - Hook personnalisé pour l'upload
- ✅ `app/lib/avatarUtils.ts` - Utilitaires (initiales, validation, cache-buster)

### Backend
- ✅ `src/users/users.controller.ts` - Endpoint POST /users/avatar amélioré
- ✅ `src/auth/auth.controller.ts` - Endpoint GET /auth/profile avec cache-buster

## Méchanisme de Cache-Busting

### Comment ça fonctionne

1. **URL originale** : `https://supabase.example.com/storage/v1/object/public/avatars/userid/1704326400000-photo.jpg`

2. **Après upload** : `https://supabase.example.com/storage/v1/object/public/avatars/userid/1704326400000-photo.jpg?v=1704326410000`

3. **Après nouvelle image** : `https://supabase.example.com/storage/v1/object/public/avatars/userid/1704326410000-photo.jpg?v=1704326410000`

Le timestamp `?v=TIMESTAMP` change à chaque upload, forçant le navigateur à ignorer le cache et télécharger l'image la plus récente.

## Dépannage

### L'image ne se met pas à jour
1. ✅ Vérifier que le cache-buster change dans l'URL (la valeur `v=` doit être différente)
2. ✅ Vérifier les logs du navigateur (F12 → Console)
3. ✅ Vérifier que Supabase Storage est bien configuré (bucket "avatars" existe)

### Erreur "Upload échoué"
1. Vérifier que le fichier est < 5MB
2. Vérifier que c'est une image (JPG, PNG, WebP, GIF)
3. Vérifier la configuration Supabase dans le backend (.env)
4. Vérifier les logs du backend

### L'image affichée est l'ancienne
1. Force refresh du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
2. Vider le cache du navigateur
3. Vérifier que l'avatarUrl dans la BD a changé (avec nouveau timestamp)

## Points Importants

✅ **Cache-buster automatique** - Pas besoin de faire quoi que ce soit, c'est géré partout
✅ **Preview immédiat** - L'utilisateur voit l'image sélectionnée avant l'upload
✅ **Mise à jour dynamique** - L'avatar se change dès que l'upload finit
✅ **Cleanup automatique** - Les anciennes images sont supprimées de Supabase
✅ **Synchronisation BD** - Le profil est mis à jour après 500ms
✅ **Gestion d'erreurs** - Les erreurs d'upload sont affichées clairement

## Commandes Utiles pour Tester

### Voir les logs Supabase
```sql
-- Vérifier la structure de la table users
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' ORDER BY ordinal_position;
```

### Tester l'endpoint manuellement
```bash
# Frontend (après authentification)
curl -X POST http://localhost:3000/users/avatar \
  -F "file=@/path/to/image.jpg" \
  --cookie "autodrive_token=YOUR_TOKEN"
```

## Résumé

La fonctionnalité d'upload d'avatar est maintenant **complètement opérationnelle** avec :
- Upload automatique vers Supabase Storage ✅
- Mise à jour dynamique et immédiate de l'image ✅
- Cache-busting intelligent ✅
- Gestion complète des erreurs ✅
- Suppression automatique des anciennes images ✅
