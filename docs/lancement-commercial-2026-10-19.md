# Préparation commerciale — 19 octobre 2026

Statut : NO-GO commercial. Pilote fermé, aucune ouverture ni paiement réel.

## Modèle décidé par le porteur
CLAVEAU VLADIMIR EI, nom commercial IKABAY Sourcing, SIRET 10312871600018. Identité reprise des informations précédemment fournies par le porteur, des dossiers SOAPP et de la configuration existante ; ce travail ne constitue pas une nouvelle vérification du registre officiel.
Vente et facturation par cette entreprise. Paiement en ligne. Transporteur partenaire, coordination Kopé.

## Vérifications de cette session
Lecture Supabase : pilot_enabled=false, 0 dossiers partenaires, 0 commandes.
Compte Stripe accessible : DELIKREOL.COM, mode réel uniquement dans le connecteur. Affectation au marchand IKABAY non vérifiée ; aucun changement effectué.
Les fonctions de paiement de la base partagée existent pour les autres projets ; leur présence ne prouve pas une intégration Kopé.

## Blocages restants
- Adapter le modèle de réservation fournisseur à la vente par IKABAY : prix de revente, taxes, livraison, acceptation coordination.
- Intégrer un compte marchand identifié et tester paiement, webhook, échec et remboursement en environnement de test.
- Facturation serveur avec numérotation et identité vendeur ; ne pas utiliser les factures de démonstration localStorage.
- Tester les transactions multi-comptes et réservations concurrentes ; précédents tests SQL non exécutés avec succès.
- Vérifier réception du courriel de confirmation et notifications opérationnelles.
- Renseigner les produits, stocks et partenaires réels, le transporteur, zones, tarifs et conditions commerciales.
- Définir CGV, régime de TVA et médiation applicable avant ouverture.

Retour arrière : branche backup/before-ikabay-20261019. Aucune migration de base dans ce correctif.
