# Inscription partenaires Kopé Agri — 16 octobre 2026 UTC

## Fonction livré

Formulaire `/inscription/`, également accessible par `/register/`, `/onboarding/` et `/dossier-partenaire/`. Comptes email/mot de passe, confirmation email et récupération du mot de passe via Supabase Auth existant. Dossier : identité, rôle, entreprise, immatriculation, adresse, activité, produits/capacités, logistique, pièces administratives, licences, Excel optionnel, brouillon et soumission. Vue de coordination avec contrôle et demandes de compléments.

Base existante : projet boihlgodmclljtckhmgz, schéma kopeagri et vues api security_invoker. Aucune copie des tables DELIKREOL. Bucket privé séparé kopeagri-partner-documents, fichiers PDF/JPG/PNG/XLSX de 10 Mo maximum. Les autorisations sont vérifiées côté base et stockage. Le rôle de coordination est une table restreinte, indépendant des métadonnées modifiables du profil. Le compte confirmé du propriétaire du projet est habilité. Les fiches ne sont pas automatiquement publiées dans le catalogue ; l’Excel joint est un document à examiner.

## Corrections de l’existant

Remplacement du proxy Supabase incomplet par le client officiel, schéma api explicite, clé publique uniquement, session isolée sous kopeagri-auth. Suppression des synchronisations automatiques de données locales de démonstration à la connexion. Les boutons de la vitrine et du partenariat pointent vers l’inscription. Suppression de la conservation des mots de passe dans l’ancien brouillon d’inscription. Trigger Auth limité aux inscriptions Kopé Agri avec rôle non privilégié ; il ne rejette plus les rôles des autres applications.

## Preuves recueillies

- Build TypeScript/Vite réussi.
- Navigateur desktop : connexion d’un compte de test, saisie, sauvegarde, dépôt PDF, soumission et rechargement avec données conservées.
- Mobile 390 px : formulaire accessible et sans débordement horizontal.
- Trois comptes techniques indépendants : propriétaire, autre partenaire, coordination.
- Lecture des dossiers/documents d’un autre partenaire refusée ; upload vers le dossier d’autrui refusé.
- Accès anonyme refusé ; auto-attribution du rôle de coordination et auto-validation d’un dossier refusées.
- Coordination : consultation et validation d’un dossier de test, téléchargement de sa pièce.
- Excel XLSX stocké dans le bucket privé.

Les comptes de test sont marqués qa_marker=kope-20261016, sans email envoyé, sans paiement, sans commande réelle. Ils doivent être supprimés après vérification publique. La réception réelle des emails de confirmation/récupération n’est pas prouvée par ces essais : les comptes techniques ont été préconfirmés pour isoler le test de la base et du formulaire. Ne pas présenter cela comme un test complet de nouvelle inscription avec livraison d’email.

## Limites commerciales

Ce changement ouvre le parcours de dossier partenaire ; il ne prouve pas la préparation commerciale de tous les modules historiques. Paiements, facturation, identité du vendeur, conditions de livraison, notifications externes, traçabilité opérationnelle et expéditions vers l’Hexagone doivent être validés séparément. Aucun paiement réel ni envoi de message aux partenaires n’a été déclenché.

Advisors Supabase : aucune alerte spécifique aux nouvelles tables/vues au contrôle ; avertissements préexistants sur quatre fonctions public SECURITY DEFINER et la protection contre mots de passe compromis non activée. Voir https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable et https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . Cela ne constitue pas un audit complet de sécurité.
