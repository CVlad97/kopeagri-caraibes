#!/bin/bash
# =============================================================================
# KopéAgri Caraïbes — Partnership Proposal Email Sender
# Generates mailto: links for 5 Martinique institutions
# =============================================================================

set -euo pipefail

SUBJECT="Kop%C3%A9Agri%20Cara%C3%AFbes%20%E2%80%94%20Proposition%20de%20partenariat%20pour%20la%20digitalisation%20du%20secteur%20agricole%20martiniquais"

BODY=$(cat <<'EOF'
Bonjour,

Je suis Vladimir Claveau, fondateur de KopéAgri Caraïbes, la première plateforme GIE agricole digitale dédiée à la Martinique et aux Caraïbes.

Notre plateforme permet aux producteurs, transporteurs, distributeurs et acheteurs de :
- Vendre et acheter des produits agricoles locaux en circuit court
- Optimiser la logistique et le transport par mutualisation
- Exporter en groupage vers les marchés caraïbes et internationaux
- Réduire le gaspillage alimentaire grâce à notre modèle anti-gaspillage inspiré de TooGoodToGo
- Accéder à la facturation électronique conforme DGFIP 2024
- Bénéficier d'un IA d'arbitrage pour optimiser les prix et les ventes

Nous cherchons des partenaires institutionnels pour :
1. Alimenter notre base de données avec les informations du secteur
2. Accompagner les agriculteurs dans la transition numérique
3. Développer des formations et ateliers sur l'agri-tech
4. Co-construire des offres adaptées aux réalités martiniquaises

Notre site : https://cvlad97.github.io/kopeagri-caraibes/

Nous serions honorés de pouvoir échanger sur les possibilités de collaboration entre nos structures.

Bien cordialement,
Vladimir Claveau
Fondateur KopéAgri Caraïbes
📧 vladimir.claveau@gmail.com
📱 +596 696 65 35 89
EOF
)

# URL-encode the body
ENCODED_BODY=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''${BODY}'''))")

# Define recipients
declare -a NAMES=(
  "Chambre d'Agriculture Martinique"
  "DAAF Martinique"
  "CCIM Martinique"
  "BPI France Martinique"
  "ADEME Martinique"
)

declare -a EMAILS=(
  "accueil@martinique.chambreagri.fr"
  "daaf-martinique@agriculture.gouv.fr"
  "accueil@ccim.mq"
  "martinique@bpifrance.fr"
  "martinique@ademe.fr"
)

echo "============================================================"
echo "  KopéAgri Caraïbes — Partnership Proposal Emails"
echo "============================================================"
echo ""

CSV_FILE="/workspace/kopeagri-caraibes/data/partnership-emails.csv"
echo "recipient_name,recipient_email,subject,body_preview,mailto_link" > "$CSV_FILE"

for i in "${!EMAILS[@]}"; do
  NAME="${NAMES[$i]}"
  EMAIL="${EMAILS[$i]}"
  MAILTO="mailto:${EMAIL}?subject=${SUBJECT}&body=${ENCODED_BODY}"
  BODY_PREVIEW=$(echo "$BODY" | head -c 80 | tr '\n' ' ')...

  echo "[$((i+1))/5] ${NAME}"
  echo "  To:      ${EMAIL}"
  echo "  Subject: KopéAgri Caraïbes — Proposition de partenariat pour la digitalisation du secteur agricole martiniquais"
  echo "  Mailto:  ${MAILTO:0:100}..."
  echo ""

  # Append to CSV (escape commas in fields)
  echo "\"${NAME}\",\"${EMAIL}\",\"KopéAgri Caraïbes — Proposition de partenariat pour la digitalisation du secteur agricole martiniquais\",\"${BODY_PREVIEW}\",\"${MAILTO}\"" >> "$CSV_FILE"
done

echo "============================================================"
echo "  CSV saved to: ${CSV_FILE}"
echo "============================================================"
echo ""
echo "To send emails, click the mailto: links above or open the CSV file."
echo "Each link will open your default email client with the pre-filled message."
