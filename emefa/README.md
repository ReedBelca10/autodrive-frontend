# emefa

Projet mobile Flutter pour la saisie et l'envoi de fiches terrain (photos, coordonnées, contact, etc.).

Ce document fournit les informations essentielles pour démarrer le développement, construire une version de production, tester et configurer les éléments critiques du projet.

## Prérequis

- Flutter (stable) installé et configuré. Vérifiez avec `flutter --version`.
- SDK Android et Android Studio (pour émulateurs et build Android).
- (Pour iOS) macOS avec Xcode installé.

## Structure importante du projet

- `lib/main.dart` : point d'entrée.
- `lib/screens/` : écrans (ex. `form_screen.dart`).
- `lib/config.dart` : configuration (endpoints, constantes).
- `lib/sheet_api.dart`, `lib/odoo_api.dart` : wrappers pour l'envoi des données.
- `android/` : configuration et code natif Android (signing, MainActivity).
- `assets/` : ressources (images, icônes, …).

## Installation et exécution (développement)

1. Récupérer les dépendances :

```powershell
flutter pub get
```

2. Lancer l'appli sur un appareil connecté ou un émulateur :

```powershell
flutter run
```

3. Analyser le projet :

```powershell
flutter analyze
```

## Build de production (Android)

1. Vérifiez `versionCode` / `versionName` dans `android/app/build.gradle.kts` ou `build.gradle`.
2. Assurez-vous que `key.properties` contient les bonnes valeurs et que le `keystore` est accessible (ne le commitez pas dans un repo public).
3. Générer l'AAB :

```powershell
flutter build appbundle --release
```

Le bundle sera produit dans `build/app/outputs/bundle/release/`.

### Publier sur Google Play (Internal testing)

- Uploader l'AAB sur la Console Play – Track Internal testing.
- Inviter vos testeurs (e-mails) et installer depuis le Play Store sur l'appareil de test.
- Important : pour tester les fonctionnalités Play (ex. in-app update immediate), l'application doit être installée depuis le Play Store (Internal testing), pas via `adb install`.

## Configuration / Endpoints

- Les endpoints et constantes principales se trouvent dans `lib/config.dart`.
- Si vous avez un endpoint Google Apps Script / Google Sheets pour recevoir les fiches, vérifiez l'URL et les clés dans `lib/config.dart`.

## Backend (Google Apps Script → Google Sheets)

Ce projet envoie les fiches (photos encodées, coordonnées, texte) vers un backend léger implémenté en Google Apps Script (GAS) qui écrit les données dans une feuille Google Sheets. Voici les points importants à connaître pour configurer et dépanner le backend.

- Endpoint principal : la constante `appsScriptUrl` dans `lib/config.dart` doit contenir l'URL publique `/exec` fournie par le déploiement Apps Script.
- Logging : `enableLogging` dans `lib/config.dart` active l'affichage des logs côté mobile (classe `SheetApi`).

Payload envoyé
- Le client envoie un JSON via POST contenant typiquement les champs suivants :
	- `Date`: ISO8601 (ajouté côté client)
	- `N° de chassis`: chaîne
	- `Nom de la piece`: chaîne
	- `Reference`: chaîne (optionnel)
	- `Telephone`: chaîne
	- `Email`: chaîne (optionnel)
	- `Adresse`: chaîne (issue de la géolocalisation)
	- `photoBase64`: tableau de chaînes (images encodées en base64)
	- `audioBase64`: chaîne (optionnel)
	- `audioFilename`: chaîne (optionnel)

La classe mobile qui gère l'envoi est `lib/sheet_api.dart` (méthode `createRecord`). Elle prépare l'objet JSON, effectue le POST et gère intelligemment les redirections 302 en tentant un POST vers la `location` puis, en fallback, un GET.

Réponses attendues
- Le backend doit renvoyer un JSON (ex. `{ "status": "ok", ... }`) avec un code HTTP 200 pour être considéré comme un succès par le client.
- Si le serveur renvoie une redirection 302, `SheetApi` suit la redirection (POST→POST puis GET en fallback).

Timeouts et robustesse
- `SheetApi` a un timeout par défaut (20s). En cas de timeout, une exception est remontée au client.

Déployer un Apps Script minimal (exemple)
1. Dans Google Drive, Créez un nouveau projet Apps Script.
2. Coller un handler minimal `doPost(e)` (exemple ci-dessous) et ajustez-le pour écrire dans votre feuille.

```javascript
function doPost(e) {
	try {
		var payload = JSON.parse(e.postData.contents);
		// Ouvrir la feuille par ID
		var ss = SpreadsheetApp.openById('VOTRE_SHEET_ID');
		var sheet = ss.getSheetByName('Sheet1');
		// Construire une ligne (exemple : Date / Chassis / Nom / Reference / Telephone / Adresse)
		var row = [payload.Date || new Date().toISOString(), payload['N° de chassis'] || '', payload['Nom de la piece'] || '', payload.Reference || '', payload.Telephone || '', payload.Adresse || ''];
		sheet.appendRow(row);
		return ContentService
			.createTextOutput(JSON.stringify({status: 'ok'}))
			.setMimeType(ContentService.MimeType.JSON);
	} catch (err) {
		return ContentService
			.createTextOutput(JSON.stringify({status: 'error', message: err.toString()}))
			.setMimeType(ContentService.MimeType.JSON);
	}
}
```

3. Déployer → `Deploy` → `New deployment` → choisissez `Web app`.
4. Définir l'accès : **Anyone** (ou `Anyone, even anonymous`) selon vos besoins (pour que l'application mobile puisse appeler sans authentification OAuth pour un prototype). Copier l'URL `/exec` et la coller dans `lib/config.dart` comme valeur de `appsScriptUrl`.

Sécurité
- Pour un prototype, `Anyone` simplifie les appels. En production, préférez une solution authentifiée (API Cloud Functions + IAM, backend protégé, ou mise en place d'une clé partagée) pour éviter l'abus public.

Tester le endpoint (exemple `curl`)

```powershell
curl -X POST -H "Content-Type: application/json" -d "@payload.json" "https://script.google.com/macros/s/XXXXX/exec"
```

`payload.json` peut contenir le JSON de test correspondant au schéma ci-dessus.

Conseils de débogage
- Si vous obtenez des réponses non-JSON ou des erreurs HTTP : vérifiez les logs Apps Script (View → Logs) et activez `enableLogging` côté mobile pour voir les payloads et statuts.
- Si le script renvoie 302 : `SheetApi` suit la redirection, mais vérifiez la `location` renvoyée et que l'URL finale accepte la même méthode (POST/GET).
- Timeout : augmentez temporairement `timeout` dans `SheetApi` ou optimisez la logique côté serveur (éviter de traiter des fichiers lourds synchrones).
- Problèmes CORS ne sont généralement pas bloquants pour Apps Script (Apps Script gère directement la réponse). Si vous hébergez ailleurs (Cloud Functions), vérifiez les en-têtes CORS.

Configurer le client (`lib/config.dart`)
- Exemple :

```dart
// URL publique /exec de ton déploiement Apps Script
const String appsScriptUrl = 'https://script.google.com/macros/s/AKfy.../exec';

// Active/désactive les logs côté mobile
const bool enableLogging = true;
```

Après modification de `lib/config.dart`, relancer l'application (`flutter run`) pour prendre en compte la nouvelle URL.

Si vous voulez, je peux :
- ajouter un script Apps Script complet et commentaire pour gérer l'enregistrement des photos (stockage dans Drive + lien dans la feuille),
- ou préparer un petit endpoint Cloud Functions + instruction d'authentification si vous préférez un backend plus sécurisé.


## Permissions

- L'application demande des permissions runtime : `camera`, `storage`, `location`, `microphone`.
- Sur Android, vérifiez `AndroidManifest.xml` et la gestion des permissions runtime (ex. via `permission_handler`).

## Tests

- Lancer les tests unitaires (si présents) :

```powershell
flutter test
```

## Dépannage rapide

- Erreur de dépendances : exécuter `flutter pub get`.
- Erreur de signing Android : vérifier `key.properties` et le chemin du `storeFile`.
- In-app update ne fonctionne pas : vérifier que la version installée est distribuée via Play Internal testing et que le `versionCode` du nouvel AAB est supérieur.

## Bonnes pratiques

- Testez les fonctionnalités liées au matériel (caméra, micro, GPS) sur un appareil réel.
- Ne commitez jamais vos keystore ou mots de passe dans un dépôt public.

## Contribuer

- Forkez le dépôt, créez une branche `feature/` ou `fix/`, ouvrez une PR avec description et captures si nécessaire.

## Contacts / Maintien

- Pour des questions sur l'API, l'intégration Play Core, ou la publication, fournissez les logs et étapes reproduites.

---

Besoin d'aide supplémentaire ? Je peux :

- ajuster automatiquement `lib/config.dart` pour pointer vers un endpoint de test ;
- préparer les commandes précises pour signer et uploader l'AAB ;
- rédiger une checklist de publication détaillée pour la Console Play.

Dites-moi laquelle de ces actions vous voulez que j'effectue ensuite.
