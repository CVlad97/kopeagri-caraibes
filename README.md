# KopéAgri Caraïbes 🌱

Plateforme coopérative agricole digitale pour la Martinique, les Caraïbes et l'export international.

## 🚀 Démo rapide

```bash
# Comptes de démonstration (mode démo intégré)
producteur@demo.fr     # 👨‍🌾 Producteur
cooperative@demo.fr    # 🤝 Coopérative / Admin
acheteur@demo.fr       # 🏪 Acheteur B2B
transporteur@demo.fr   # 🚛 Transporteur
# Mot de passe pour tous : demo1234

# Ou cliquez sur "🧪 Essai démo" sur la page d'accueil
```

## 🎯 Objectif

Mutualiser terres, productions, équipements, ressources humaines, stockage, froid, transport et volumes commerciaux pour transformer des petits lots agricoles dispersés en volumes fiables, traçables et vendables.

## 👥 Rôles utilisateurs

| Rôle | Description |
|------|-------------|
| 👨‍🌾 Producteur | Vendez vos lots, accédez aux ressources, consolidez vos volumes |
| 🏠 Propriétaire | Mettez vos terres à disposition |
| 🤝 Coopérative / Admin | Validez, pilotez, gérez les commissions |
| 🏪 Acheteur B2B | Commandez des lots tracés et certifiés |
| 🚛 Transporteur | Proposez collecte et livraison |
| 🏛️ Institution | Financez et suivez l'impact territorial |

## 🧭 Pages

| Page | Accès | Fonctionnalité |
|------|-------|----------------|
| `/` | Public | Accueil, vision, rôles |
| `/login` | Public | Connexion + comptes démo |
| `/register` | Public | Inscription |
| `/dashboard` | Tous | Stats, actions rapides, suggestions IA |
| `/plots` | Producteur, Propriétaire, Coopérative | Carte des parcelles |
| `/resources` | Producteur, Propriétaire, Coopérative, Transporteur | Bourse aux ressources |
| `/lots` | Producteur, Coopérative, Acheteur | Lots de production |
| `/orders` | Producteur, Coopérative, Acheteur | Commandes |
| `/logistics` | Transporteur, Coopérative, Producteur | Logistique mutualisée |
| `/qr-codes` | Producteur, Coopérative | QR codes traçabilité |
| `/admin` | Coopérative, Institution | Dashboard admin + export CSV |

## 🛠️ Stack technique

- **Frontend** : React 18 + TypeScript + Vite
- **Routing** : React Router v7
- **UI** : Design tropical maison (CSS pur, zéro dépendance UI)
- **Icônes** : Lucide React
- **Backend** : Supabase (PostgreSQL, RLS, Storage, Edge Functions)
- **PWA** : Cache automatique via service worker
- **Déploiement** : Vercel / Netlify

## 🔧 Installation

```bash
# Cloner
git clone https://github.com/votre-compte/kopeagri-caraibes.git
cd kopeagri-caraibes

# Installer
npm install

# Lancer en dev
npm run dev

# Builder
npm run build
```

## 🌍 Variables d'environnement

Créer un fichier `.env` :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

Le site fonctionne **sans Supabase** en mode démo intégré avec des données fictives réalistes Martinique.

## 🗄️ Schéma Supabase (17 tables)

Voir `supabase/schema.sql` pour le schéma complet :
- `profiles`, `farms`, `plots`, `resources`, `bookings`
- `crops`, `harvest_forecasts`, `lots`, `orders`, `order_items`
- `logistics_tasks`, `payments`, `commissions`, `documents`
- `notifications`, `audit_logs`

## 🎨 Design

- **Palette** : Vert agricole (#1B5E20), Or soleil (#FBC02D), Bleu mer (#0277BD), Blanc/ivoire
- **Mobile-first** : Responsive, sidebar rétractable
- **Tropical** : Ambiance caribéenne, badges colorés, animations subtiles

## 📄 Licence

Préparé pour validation juridique, agricole, fiscale et sanitaire avant mise en production.

---

**KopéAgri Caraïbes** — Martinique · Caraïbes · Export