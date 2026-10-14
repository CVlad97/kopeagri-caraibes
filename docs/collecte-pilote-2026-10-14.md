# Collecte pilote KopéAgri — 14 octobre 2026

## Résultat

La route publique `/collecte/`, accessible depuis `/partenariat/`, lit le classeur de collecte XLSX sur l’appareil et présente un rapport. Aucun enregistrement métier, paiement ou publication produit n’est déclenché. Le classeur utilisateur reste privé et n’est pas committé.

10 tables de collecte : Partenaires, Produits, Offres, Lots, Peche, Evenements, Commandes, Logistique, Administratif, Besoins_acheteurs. Les en-têtes figurent dans `src/services/collectionSchema.json` (157 champs).

Contrôles : présence des onglets/en-têtes, champs requis, identifiants uniques, références croisées, types numériques/dates, unités, prix, quantités disponibles et quelques obligations conditionnelles. Ces contrôles ne constituent pas une validation sanitaire ou exhaustive de toutes les règles métier. Les fichiers sont limités à 5 Mo et 2 000 lignes par table ; les 200 premières erreurs sont affichées. Un modèle vide est explicitement signalé.

## Validation effectuée

- Build TypeScript + Vite réussi.
- ESLint ciblé sur les nouveaux fichiers réussi.
- Tests `node --experimental-strip-types scripts/test-collection.mjs` : 8 scénarios réussis.
- Lecture du classeur livré avec read-excel-file : 10 tables reconnues, zéro erreur et aucune fausse fiche.
- Navigateur Chromium desktop et mobile 390 px : import XLSX, téléchargement du bilan, effacement, fichier invalide, lien partenariat, absence de débordement horizontal et absence d’erreur JavaScript vérifiés.
- Aucune requête d’envoi après sélection du classeur lors du test.

## Avant ouverture commerciale

La couche dataService utilise localStorage ; une passerelle syncService existe. La persistance partagée, les droits multi-comptes et la couverture du modèle de collecte ne sont pas validés par cette intervention. Le chargement du classeur est une préparation locale uniquement. Prévoir une importation transactionnelle côté serveur, un mapping du modèle, l’idempotence, les droits et une sauvegarde/restauration testée avant enregistrement métier.

L’audit npm signale huit dépendances existantes (une modérée, sept hautes). Aucune ne concerne read-excel-file ou ses nouvelles dépendances dans ce résultat. La portée/exploitabilité des alertes existantes nécessite une analyse distincte avant GO commercial.

## Retour arrière

Référence antérieure : 80b0b6a. Branche de sauvegarde locale : backup/avant-import-20261013. En cas de problème, annuler le commit de cette fonctionnalité via git revert et laisser la chaîne Pages publier la version de retour.
