#!/bin/bash
# Script pour tester et populator des véhicules avec des médias

API_BASE="http://localhost:3001"
JWT_TOKEN="${1:-your-jwt-token}"

echo "=========================================="
echo "Script de Test - Gestion des Médias"
echo "=========================================="

# Vérifier que le backend est accessible
echo ""
echo "1. Vérification de la connexion au backend..."
if curl -s "$API_BASE/health" >/dev/null 2>&1 || curl -s "$API_BASE/vehicles/config/fuels" >/dev/null 2>&1; then
    echo "✅ Backend accessible"
else
    echo "❌ Backend non accessible sur $API_BASE"
    exit 1
fi

# Récupérer tous les véhicules
echo ""
echo "2. Récupération des véhicules..."
VEHICLES=$(curl -s "$API_BASE/vehicles" | jq -r '.')
VEHICLE_COUNT=$(echo "$VEHICLES" | jq 'length')
echo "✅ $VEHICLE_COUNT véhicules trouvés"

# Vérifier les URLs des médias
echo ""
echo "3. Vérification des URLs des médias..."
echo "$VEHICLES" | jq -r '.[] | select(.mediaUrls != null and (.mediaUrls | length) > 0) | "\(.name): \(.mediaUrls[0])"' | while read -r line; do
    if [ ! -z "$line" ]; then
        echo "   ✅ $line"
    fi
done

# Résumé des véhicules sans médias
echo ""
echo "4. Véhicules sans médias:"
VEHICLES_WITHOUT_MEDIA=$(echo "$VEHICLES" | jq 'map(select(.mediaUrls == null or (.mediaUrls | length) == 0)) | length')
if [ "$VEHICLES_WITHOUT_MEDIA" -gt 0 ]; then
    echo "⚠️  $VEHICLES_WITHOUT_MEDIA véhicule(s) sans médias"
    echo "$VEHICLES" | jq -r '.[] | select(.mediaUrls == null or (.mediaUrls | length) == 0) | "\(.name) (ID: \(._id))"' | while read -r line; do
        echo "   - $line"
    done
else
    echo "✅ Tous les véhicules ont des médias"
fi

# Récupérer les configurations
echo ""
echo "5. Configurations disponibles..."
echo "   Carburants: $(curl -s "$API_BASE/vehicles/config/fuels" | jq -r '.' | tr '\n' ' ')"
echo "   Transmissions: $(curl -s "$API_BASE/vehicles/config/transmissions" | jq -r '.' | tr '\n' ' ')"

# Récupérer les détails d'un véhicule
echo ""
echo "6. Exemple de détails d'un véhicule..."
FIRST_VEHICLE_ID=$(echo "$VEHICLES" | jq -r '.[0]._id')
if [ ! -z "$FIRST_VEHICLE_ID" ] && [ "$FIRST_VEHICLE_ID" != "null" ]; then
    echo "   ID: $FIRST_VEHICLE_ID"
    curl -s "$API_BASE/vehicles/$FIRST_VEHICLE_ID" | jq '.name, .dailyRate, (.mediaUrls | length)'
else
    echo "⚠️  Aucun véhicule trouvé"
fi

echo ""
echo "=========================================="
echo "✅ Tests terminés avec succès"
echo "=========================================="

# Afficher les prochaines étapes
echo ""
echo "Prochaines étapes:"
echo ""
echo "Pour ajouter des médias à un véhicule:"
echo ""
echo "1. Télécharger une image vers Supabase:"
echo "   curl -X POST $API_BASE/vehicles/upload/media \\"
echo "     -H 'Authorization: Bearer <JWT_TOKEN>' \\"
echo "     -F 'file=@path/to/image.jpg'"
echo ""
echo "2. Associer l'image au véhicule:"
echo "   curl -X POST $API_BASE/vehicles/{VEHICLE_ID}/add-media \\"
echo "     -H 'Authorization: Bearer <JWT_TOKEN>' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"mediaUrl\": \"https://...\"}'
echo ""
echo "Pour voir les images sur le frontend:"
echo "   Ouvrir: http://localhost:3000/vehicles"
echo ""
