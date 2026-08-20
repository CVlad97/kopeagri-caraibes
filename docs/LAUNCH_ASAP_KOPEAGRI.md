# KopéAgri & Pêche — Dossier lancement ASAP (Martinique)

## 1) Audit technique (état réel)

### Stack et infra
- Frontend: React + Vite + TypeScript
- Routing: BrowserRouter avec `basename = import.meta.env.BASE_URL`
- Hébergement: GitHub Pages (`/kopeagri-caraibes/`)
- Backend: Supabase (mode réel si variables présentes, fallback local sinon)
- Build: ✅ `npm run build` passe
- Typecheck: ✅ `npm run typecheck` passe
- Lint: ✅ 0 erreur (warnings restants)

### Contrôles P0 exécutés
- ✅ Rôle `pecheur` présent dans enum SQL
- ✅ Suppression du mot de passe fixe `kopeagri2024`
- ✅ Ajout lien magique (magic link) côté connexion et onboarding
- ✅ Mode démo bloqué en production sauf `VITE_ENABLE_DEMO=true`
- ✅ Service worker corrigé: `import.meta.env.BASE_URL + sw.js`
- ✅ `user-scalable=no` supprimé du viewport
- ✅ Vue publique limitée des profils ajoutée (sans données sensibles)
- ✅ Migration traçabilité créée (events/documents/source checks)
- ✅ Route publique lot/QR ajoutée: `/lot/:lotId`
- ✅ CI renforcée: lint + typecheck + build
- ✅ Refresh direct routes: testées en preview, HTTP 200

## 2) Bugs / risques priorisés

### P0 (corrigés)
1. Auth onboarding avec mot de passe fixe hardcodé
2. SW non compatible GitHub Pages subpath
3. Mode démo exposé sans garde prod
4. Politique publique profils risquant exposition de champs sensibles

### P1 (à traiter semaine 1-2)
1. Warnings lint techniques (dette non bloquante)
2. Uniformisation UX login (password vs magic link)
3. Consolidation des flows localStorage vs Supabase
4. Clarification juridique sur pages publiques (démo/pilote)

### P2 (après pilote)
1. Optimisation bundle (code splitting ciblé)
2. Monitoring erreurs front + analytics produit
3. Internationalisation (Guadeloupe / DROM)

## 3) Plan de correction opérationnel

### Semaine 1
- Stabiliser auth magique (email) + QA mobile
- Activer migration SQL P0 sur Supabase
- Vérifier RLS table par table
- Hardening pages publiques (zéro donnée sensible)

### Semaine 2
- Parcours "Je vends" en < 90 secondes
- Génération automatique WhatsApp + QR à publication lot
- Catalogue public simple acheteur

### Semaine 3
- Pilote fermé terrain
- 10 producteurs + 5 pêcheurs + 3 acheteurs
- Corrections quotidiennes basées usage réel

### Semaine 4
- Lancement public Martinique
- Campagnes Facebook / WhatsApp
- Dossier institutionnel + KPI hebdo

## 4) UX cible (terrain)

## Menu principal (5 boutons)
1. Vendre aujourd’hui
2. Mes commandes
3. Collecte / Livraison
4. Mes lots & QR
5. Mon argent

## Parcours principal
Ouvrir app → Je vends → produit/espèce → quantité → prix (ou aide prix) → dispo → photo optionnelle → publier → lien WhatsApp + QR.

## 5) Traçabilité Kopé Trace

Niveaux:
- D0: déclaré par opérateur
- D1: recoupé source publique
- D2: document ajouté
- D3: validé tiers

Tables P0 livrées (migration):
- `trace_events`
- `trace_documents`
- `trace_source_checks`

Extension lot livrée:
- `lot_code`, `type`, `species_fao_code`, `scientific_name`, `harvest_or_capture_date`, `declared_origin`, `public_trace_level`

## 6) Landing officielle (message)

> Kopé Agri & Pêche aide les petits producteurs et pêcheurs à vendre plus simplement, organiser la collecte, prouver l’origine des produits et sécuriser les commandes locales.

Sections:
- Producteurs
- Pêcheurs
- Acheteurs
- Transporteurs
- Institutions
- CTA pilote Martinique

## 7) Stratégie pub rapide

### Campagne 1 — Producteurs / pêcheurs
Message: « Tu as des produits à vendre ? Publie ton lot, trouve un acheteur et génère ta preuve d’origine. »

### Campagne 2 — Acheteurs B2B
Message: « Trouvez des produits locaux disponibles, traçables et commandables. »

### Campagne 3 — Institutions
Message: « Structuration circuits courts avec traçabilité et données terrain. »

## 8) Communiqué (version courte)

**Titre**: Kopé Agri & Pêche lance un pilote pour simplifier la vente, la collecte et la traçabilité des produits locaux en Martinique.

**Corps**:
Kopé Agri & Pêche ouvre un pilote terrain en Martinique pour faciliter la mise en vente des lots agricoles et halieutiques, l’organisation logistique, et la diffusion de preuves d’origine via QR code. Le pilote s’adresse aux producteurs, pêcheurs, acheteurs, transporteurs et structures d’accompagnement du territoire.

## 9) Pitch court

Kopé Agri & Pêche est une plateforme mobile qui aide les petits producteurs et pêcheurs à vendre leurs produits, organiser la collecte et générer une preuve de traçabilité simple via QR code.

## 10) Backlog priorisé

### P0
- Activer migration Supabase P0
- Finaliser auth magique sur tous parcours
- Bloquer démo en prod par défaut
- Vérification sécurité données publiques

### P1
- UX "Je vends" ultra-court
- Aide prix intelligente
- Flux commande collecteur

### P2
- Dashboard KPI avancé
- Automatisation campagnes
- Extension Guadeloupe

## 11) Checklist publication officielle

- [ ] Build/typecheck/lint OK en CI
- [ ] Variables Supabase prod renseignées
- [ ] Migration P0 exécutée
- [ ] RLS revues sur tables sensibles
- [ ] Pages publiques validées (sans données privées)
- [ ] Parcours Je vends testé sur mobile faible réseau
- [ ] Lot + QR + WhatsApp testés terrain
- [ ] Communiqué + pack partenaire validés
- [ ] KPI semaine 1 instrumentés

## 12) GO / NO-GO

### GO si:
- Auth réelle opérationnelle
- QR lot public sans fuite
- Publication lot < 5 minutes
- Routes stables mobile

### NO-GO si:
- mot de passe hardcodé actif en prod
- données privées visibles publiquement
- flux lot/commande cassé en mobile
- migration traçabilité non appliquée
