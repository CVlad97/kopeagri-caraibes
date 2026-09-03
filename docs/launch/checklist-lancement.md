# Checklist lancement société — KopéAgri Caraïbes

> Document de travail — chaque étape cochée doit avoir une preuve (numéro, récépissé, URL).

## Phase 0 — Décisions fondatrices (Vladimir seul)
- [ ] **Forme juridique choisie** : GIE (filière, plusieurs membres) ou SAS (contrôle seul, levée d'argent plus tard)
  - GIE = coûts mutualisés, crédibilité filière, chaque membre redevable solidairement
  - SAS = gouvernance simple, actions, mais pas de mutualisation
- [ ] **Nom commercial confirmé** : « KopéAgri Caraïbes » (vérifier INPI marque + SIRENE doublon)
- [ ] **Siège social** : adresse réelle (domiciliation acceptable au départ)
- [ ] **Membres fondateurs** (si GIE) : noms + apports de chacun

## Phase 1 — Immatriculation (obligatoire avant tout encaissement)
- [ ] Rédaction des statuts (modèle prêt : `statuts-gie-modele.md`)
- [ ] **Guichet unique INPI** : immatriculation (RNE) → récépissé SIREN/SIRET
  - https://procedures.inpi.fr
- [ ] Déclaration bénéficiaires effectifs (RBE)
- [ ] Compte bancaire pro au nom de l'entité
- [ ] Assurance RC Pro + cyber (Mutualité/MAIF pro, ~300-600 €/an)
- [ ] TVA : régime applicable (franchise en base possible au démarrage)
- [ ] Numéro télédéclarant + espace impots.gouv

## Phase 2 — Plateforme conforme
- [ ] Exécuter le schéma SQL backend : `scripts/supabase/schema-production.sql`
  - SQL Editor : https://supabase.com/dashboard/project/boihlgodmclljtckhmgz/sql/new
- [ ] Activer Auth Email/Password dans Supabase (Authentication → Providers)
- [ ] Bucket photos Storage (nom: `photos`, privé)
- [ ] Vraies mentions légales avec SIRET + forme sociale (page /legal à mettre à jour)
- [ ] CGV version définitive (base : `cgv-modele.md`) — à valider par avocat
- [ ] Registre RGPD + politique de confidentialité finalisée
- [ ] Domaine propre (kopeagri.mq / kopeagri-caraibes.com) + DNS → GitHub Pages
- [ ] Emails pro sur le domaine (contact@, dpo@)

## Phase 3 — Encaissement
- [ ] Stripe (ou Sumup/GoCardless) au nom de l'entité — nécessite SIRET + IBAN
- [ ] CGV de paiement (délais, litiges) reliées à Stripe
- [ ] Facturation conforme (numérotation séquentielle, TVA locale)

## Phase 4 — Go-to-market
- [ ] 10 producteurs pilotes réels inscrits (contact WhatsApp Vladimir)
- [ ] 5 acheteurs B2B pilotes (hôtels/restaurants)
- [ ] 2 transporteurs partenaires
- [ ] Présentation institutionnelle : CMA Martinique, Région, DEAL
- [ ] Photos terrain réelles pour le site (fournies par Vladimir — zéro placeholder)

## Coûts estimatifs au lancement (ordre de grandeur, à confirmer)
| Poste | Estimation |
|---|---|
| Immatriculation GIE (greffe) | ~70 € |
| Avocat validation statuts + CGV | 500–1 500 € |
| RC Pro + cyber | 300–600 €/an |
| Domaine .mq/.com | 15–60 €/an |
| Supabase (actuel) | 0 € (gratuit) |
| Stripe | % par transaction uniquement |
