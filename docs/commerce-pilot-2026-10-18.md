# État du circuit commercial — 18 octobre 2026

La migration commercial_pilot a été appliquée au projet Supabase existant, dans kopeagri/api uniquement. Elle ajoute les fonctions de publication, réservation atomique avec clé de déduplication, transition de statut, restitution du stock à l’annulation et historique des événements. Les écritures directes lots/commandes sont retirées aux utilisateurs. Les commandes sont lisibles par acheteur, vendeur et coordination habilitée. Le pilote reste fermé (commerce_settings.pilot_enabled=false).

## Vérifié
- Migration appliquée avec succès.
- Lecture de configuration: pilote fermé, zéro commande.
- INSERT direct sur api.orders, UPDATE direct sur kopeagri.lots et réservation anonyme interdits par les permissions vérifiées.
- Appel de réservation sans session rejeté avec « Pilote fermé ».
- Advisors: aucune nouvelle alerte signalée sur les objets ajoutés; avertissements existants sur 4 fonctions public et protection contre mots de passe compromis.

## Non validé
Le script supabase/tests/commercial_pilot.sql prépare des fixtures éphémères puis ROLLBACK. Deux tentatives MCP ont échoué avec Invalid or expired requestState; elles ne constituent PAS un résultat de test. Stock, déduplication, annulation, isolation en session et cycle complet restent NOT_TESTED. Le frontend historique ne consomme pas encore ces fonctions. Aucun lancement commercial, paiement, livraison ou facturation réelle n’est activé.

## Suite nécessaire
Exécuter les tests transactionnels via un accès SQL fonctionnel; ajouter un test de réservation concurrente; raccorder une interface réelle acheteur/vendeur; tester le parcours multi-comptes, notifications, réception email, facturation et règlement. Définir l’opérateur contractuel, conditions commerciales, produits réels et organisation logistique avant ouverture. La demande de « 100% autonome » ne constitue pas une preuve de fiabilité.

## Retour arrière
Conserver pilot_enabled=false. Les permissions restrictives préservent les données; ne pas rétablir les anciennes règles permissives. Les anciennes pages de démonstration restent inchangées. Pas de suppression de table ou données métier.

Advisors existants: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable ; https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Raccordement interface — 19 octobre UTC
Ajout de /marche-pilote/ : session Supabase réelle, lecture des lots/commandes/événements, appels aux fonctions publier/réserver/changer étape. Lien depuis le dossier partenaire. Les comptes réels sont redirigés des anciens modules locaux vers cet espace; la démo nécessite une activation explicite. Le pilote reste fermé.
Build et contrôle TypeScript réussis; test navigateur mobile: entrée publique, connexion requise, lien inscription et absence d’erreur JavaScript. Cela ne valide pas encore le parcours transactionnel multi-comptes. Aucun paiement ni facture généré par le nouvel écran.
