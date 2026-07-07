import React, { useState, useMemo } from 'react'
import { Calendar, Leaf, Filter, ChevronDown, ChevronUp } from 'lucide-react'

/* ===== TYPES ===== */
interface Culture {
  id: string
  emoji: string
  nom: string
  nomCreole: string
  categorie: 'fruit' | 'legume' | 'epice'
  saisonMois: number[]      /* mois de récolte (0=Jan → 11=Dec) */
  picMois: number[]         /* mois de pic */
  croissanceMois: number[]  /* mois de croissance (avant récolte) */
  description: string
}

type Filtre = 'toutes' | 'en-saison' | 'recolte' | 'fruits' | 'legumes' | 'epices'

/* ===== DONNÉES — 27 cultures de Martinique ===== */
const CULTURES: Culture[] = [
  {
    id: 'banane', emoji: '🍌', nom: 'Banane', nomCreole: 'Figue',
    categorie: 'fruit', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [5,6,7], croissanceMois: [],
    description: 'Toute l\'année — pic en été'
  },
  {
    id: 'mangue', emoji: '🥭', nom: 'Mangue', nomCreole: 'Mang',
    categorie: 'fruit', saisonMois: [2,3,4,5,6], picMois: [3,4], croissanceMois: [0,1],
    description: 'Saison mars-juillet, pic avril-mai'
  },
  {
    id: 'ananas', emoji: '🍍', nom: 'Ananas', nomCreole: 'Zanana',
    categorie: 'fruit', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [2,3,4,5], croissanceMois: [],
    description: 'Toute l\'année — pic en saison sèche'
  },
  {
    id: 'canne', emoji: '🎋', nom: 'Canne à sucre', nomCreole: 'Kann',
    categorie: 'epice', saisonMois: [1,2,3,4,5,6], picMois: [3,4,5], croissanceMois: [0,10,11],
    description: 'Récolte février-juillet'
  },
  {
    id: 'avocat', emoji: '🥑', nom: 'Avocat', nomCreole: 'Zaboka',
    categorie: 'fruit', saisonMois: [7,8,9,10,11], picMois: [8,9], croissanceMois: [5,6],
    description: 'Saison août-décembre, pic septembre-octobre'
  },
  {
    id: 'citron-vert', emoji: '🍋', nom: 'Citron vert', nomCreole: 'Sitwon',
    categorie: 'fruit', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [6,7,8], croissanceMois: [],
    description: 'Toute l\'année — pic en juillet-septembre'
  },
  {
    id: 'ignam', emoji: '🍠', nom: 'Ignam', nomCreole: 'Yam',
    categorie: 'legume', saisonMois: [10,11,0,1,2], picMois: [11,0], croissanceMois: [8,9],
    description: 'Saison novembre-mars, pic décembre-janvier'
  },
  {
    id: 'manioc', emoji: '🫚', nom: 'Manioc', nomCreole: 'Manyok',
    categorie: 'legume', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [5,6,7], croissanceMois: [],
    description: 'Toute l\'année — pic en juin-août'
  },
  {
    id: 'dachine', emoji: '🥔', nom: 'Dachine', nomCreole: 'Dachin',
    categorie: 'legume', saisonMois: [9,10,11,0,1], picMois: [10,11], croissanceMois: [7,8],
    description: 'Saison octobre-février, pic novembre-décembre'
  },
  {
    id: 'legumes-pays', emoji: '🥬', nom: 'Légumes pays', nomCreole: 'Légim péyi',
    categorie: 'legume', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [9,10,11,0,1,2], croissanceMois: [],
    description: 'Christophine, giraumon — toute l\'année, pic en saison fraîche'
  },
  {
    id: 'piment', emoji: '🌶️', nom: 'Piment', nomCreole: 'Piman',
    categorie: 'legume', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [7,8,9], croissanceMois: [],
    description: 'Toute l\'année — pic août-octobre'
  },
  {
    id: 'cacao', emoji: '🍫', nom: 'Cacao', nomCreole: 'Kakaw',
    categorie: 'epice', saisonMois: [9,10,11], picMois: [10], croissanceMois: [7,8],
    description: 'Récolte octobre-décembre, pic en novembre'
  },
  {
    id: 'vanille', emoji: '🫘', nom: 'Vanille', nomCreole: 'Vaniy',
    categorie: 'epice', saisonMois: [6,7,8], picMois: [7], croissanceMois: [4,5],
    description: 'Récolte juillet-septembre, pic en août'
  },
  {
    id: 'cafe', emoji: '☕', nom: 'Café', nomCreole: 'Kafé',
    categorie: 'epice', saisonMois: [9,10,11], picMois: [10], croissanceMois: [7,8],
    description: 'Récolte octobre-décembre, pic en novembre'
  },
  {
    id: 'fruit-a-pain', emoji: '🍞', nom: 'Fruit à pain', nomCreole: 'Fwi-a-pwen',
    categorie: 'fruit', saisonMois: [5,6,7,8], picMois: [6,7], croissanceMois: [3,4],
    description: 'Saison juin-septembre, pic juillet-août'
  },
  {
    id: 'goyave', emoji: '🍈', nom: 'Goyave', nomCreole: 'Gouyav',
    categorie: 'fruit', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [8,9,10], croissanceMois: [],
    description: 'Toute l\'année — pic septembre-novembre'
  },
  {
    id: 'papaye', emoji: '🧡', nom: 'Papaye', nomCreole: 'Papay',
    categorie: 'fruit', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [3,4,5], croissanceMois: [],
    description: 'Toute l\'année — pic avril-juin'
  },
  {
    id: 'patate-douce', emoji: '🟠', nom: 'Patate douce', nomCreole: 'Patat',
    categorie: 'legume', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [10,11,0], croissanceMois: [],
    description: 'Toute l\'année — pic novembre-janvier'
  },
  {
    id: 'tomate', emoji: '🍅', nom: 'Tomate', nomCreole: 'Tomad',
    categorie: 'legume', saisonMois: [9,10,11,0,1,2], picMois: [10,11,0], croissanceMois: [7,8],
    description: 'Saison octobre-mars, pic novembre-janvier'
  },
  {
    id: 'laitue', emoji: '🥗', nom: 'Laitue', nomCreole: 'Latwi',
    categorie: 'legume', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [10,11,0,1], croissanceMois: [],
    description: 'Toute l\'année — pic novembre-février'
  },
  {
    id: 'concombre', emoji: '🥒', nom: 'Concombre', nomCreole: 'Konkonmb',
    categorie: 'legume', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [2,3,4], croissanceMois: [],
    description: 'Toute l\'année — pic mars-mai'
  },
  {
    id: 'aubergine', emoji: '🍆', nom: 'Aubergine', nomCreole: 'Zobèjin',
    categorie: 'legume', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [5,6,7], croissanceMois: [],
    description: 'Toute l\'année — pic juin-août'
  },
  {
    id: 'chou', emoji: '🥦', nom: 'Chou', nomCreole: 'Chou',
    categorie: 'legume', saisonMois: [10,11,0,1,2], picMois: [11,0], croissanceMois: [8,9],
    description: 'Saison novembre-mars, pic décembre-janvier'
  },
  {
    id: 'carotte', emoji: '🥕', nom: 'Carotte', nomCreole: 'Karot',
    categorie: 'legume', saisonMois: [10,11,0,1,2], picMois: [11,0,1], croissanceMois: [8,9],
    description: 'Saison novembre-mars, pic décembre-février'
  },
  {
    id: 'poire', emoji: '🧅', nom: 'Poiré / Poireau', nomCreole: 'Pwaré / Pwaro',
    categorie: 'legume', saisonMois: [10,11,0,1,2], picMois: [], croissanceMois: [8,9],
    description: 'Saison novembre-mars'
  },
  {
    id: 'gingembre', emoji: '🫚', nom: 'Gingembre', nomCreole: 'Jinsanm',
    categorie: 'epice', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [8,9,10], croissanceMois: [],
    description: 'Toute l\'année — pic septembre-novembre'
  },
  {
    id: 'safran-pays', emoji: '🟡', nom: 'Safran pays', nomCreole: 'Safran péyi',
    categorie: 'epice', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [0,1,2], croissanceMois: [],
    description: 'Turmeric — toute l\'année, pic janvier-mars'
  },
]

const MOIS_NOMS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
]

const MOIS_COMPLETS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const FILTRES: { id: Filtre; label: string; emoji: string }[] = [
  { id: 'toutes', label: 'Toutes', emoji: '🌿' },
  { id: 'en-saison', label: 'En saison maintenant', emoji: '✅' },
  { id: 'recolte', label: 'Récolte ce mois', emoji: '🏆' },
  { id: 'fruits', label: 'Fruits', emoji: '🍎' },
  { id: 'legumes', label: 'Légumes', emoji: '🥬' },
  { id: 'epices', label: 'Épices', emoji: '🌶️' },
]

/* ===== COMPOSANT PRINCIPAL ===== */
const SeasonalCalendarPage: React.FC = () => {
  const [filtreActif, setFiltreActif] = useState<Filtre>('toutes')
  const [carteOuverte, setCarteOuverte] = useState<string | null>(null)

  const moisActuel = new Date().getMonth() // 0-11

  /* Filtrer les cultures selon le filtre actif */
  const culturesFiltrees = useMemo(() => {
    return CULTURES.filter(c => {
      switch (filtreActif) {
        case 'en-saison':
          return c.saisonMois.includes(moisActuel)
        case 'recolte':
          return c.picMois.includes(moisActuel)
        case 'fruits':
          return c.categorie === 'fruit'
        case 'legumes':
          return c.categorie === 'legume'
        case 'epices':
          return c.categorie === 'epice'
        default:
          return true
      }
    })
  }, [filtreActif, moisActuel])

  /* Nombre de cultures en saison ce mois */
  const nbEnSaison = useMemo(() => {
    return CULTURES.filter(c => c.saisonMois.includes(moisActuel)).length
  }, [moisActuel])

  /* Nombre de cultures en pic ce mois */
  const nbEnPic = useMemo(() => {
    return CULTURES.filter(c => c.picMois.includes(moisActuel)).length
  }, [moisActuel])

  /* Obtenir la couleur d'un mois pour une culture */
  const couleurMois = (culture: Culture, mois: number): string => {
    if (culture.picMois.includes(mois)) return 'var(--gold-500)'
    if (culture.saisonMois.includes(mois)) return 'var(--green-500)'
    if (culture.croissanceMois.includes(mois)) return 'var(--green-100)'
    return 'var(--gray-200)'
  }

  /* Obtenir la classe de badge pour la catégorie */
  const badgeCategorie = (cat: string): string => {
    switch (cat) {
      case 'fruit': return 'badge-gold'
      case 'legume': return 'badge-green'
      case 'epice': return 'badge-orange'
      default: return 'badge-blue'
    }
  }

  const labelCategorie: Record<string, string> = {
    fruit: 'Fruit',
    legume: 'Légume',
    epice: 'Épice',
  }

  return (
    <div className="page">
      {/* En-tête de page */}
      <div className="page-header">
        <h1><Calendar size={28} style={{ marginRight: 10 }} /> Calendrier Saisonnier 🌱</h1>
        <p className="page-subtitle">Récoltes et disponibilités — 27 cultures de Martinique</p>
      </div>

      {/* Bandeau mois actuel */}
      <div className="section-block saison-banner">
        <div className="saison-banner-content">
          <span className="saison-banner-emoji">📅</span>
          <div>
            <strong>Nous sommes en {MOIS_COMPLETS[moisActuel]}</strong>
            <p className="saison-banner-sub">
              {nbEnSaison} cultures en saison
              {nbEnPic > 0 && ` — ${nbEnPic} en pic de récolte`}
            </p>
          </div>
        </div>
        <div className="saison-banner-months">
          {MOIS_NOMS.map((m, i) => (
            <span
              key={i}
              className={`saison-month-pip ${i === moisActuel ? 'saison-month-current' : ''}`}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div className="saison-filters">
        <Filter size={18} style={{ color: 'var(--gray-500)', flexShrink: 0 }} />
        <div className="chip-grid">
          {FILTRES.map(f => (
            <button
              key={f.id}
              className={`chip ${filtreActif === f.id ? 'active' : ''}`}
              onClick={() => setFiltreActif(f.id)}
            >
              <span style={{ fontSize: 14 }}>{f.emoji}</span> {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Légende */}
      <div className="saison-legend">
        <div className="saison-legend-item">
          <span className="saison-legend-pip" style={{ background: 'var(--green-500)' }} />
          <span>Récolte</span>
        </div>
        <div className="saison-legend-item">
          <span className="saison-legend-pip" style={{ background: 'var(--gold-500)' }} />
          <span>Pic de récolte</span>
        </div>
        <div className="saison-legend-item">
          <span className="saison-legend-pip" style={{ background: 'var(--green-100)' }} />
          <span>Croissance</span>
        </div>
        <div className="saison-legend-item">
          <span className="saison-legend-pip" style={{ background: 'var(--gray-200)' }} />
          <span>Hors saison</span>
        </div>
        <div className="saison-legend-item">
          <span className="saison-legend-pip saison-legend-current" />
          <span>Mois actuel</span>
        </div>
      </div>

      {/* Grille des cultures */}
      <div className="saison-grid">
        {culturesFiltrees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Aucune culture trouvée</h3>
            <p>Essayez un autre filtre pour voir les cultures disponibles.</p>
          </div>
        ) : (
          culturesFiltrees.map(culture => {
            const estEnSaison = culture.saisonMois.includes(moisActuel)
            const estEnPic = culture.picMois.includes(moisActuel)
            const estOuverte = carteOuverte === culture.id

            return (
              <div
                key={culture.id}
                className={`saison-card ${estEnPic ? 'saison-card-peak' : estEnSaison ? 'saison-card-active' : ''}`}
              >
                {/* En-tête de carte */}
                <div
                  className="saison-card-header"
                  onClick={() => setCarteOuverte(estOuverte ? null : culture.id)}
                >
                  <div className="saison-card-left">
                    <span className="saison-card-emoji">{culture.emoji}</span>
                    <div>
                      <strong className="saison-card-nom">{culture.nom}</strong>
                      {culture.nomCreole && (
                        <span className="saison-card-creole"> · {culture.nomCreole}</span>
                      )}
                    </div>
                  </div>
                  <div className="saison-card-right">
                    <span className={`badge ${badgeCategorie(culture.categorie)}`}>
                      {labelCategorie[culture.categorie]}
                    </span>
                    {estEnPic && <span className="badge badge-gold">🏆 Pic</span>}
                    {estEnSaison && !estEnPic && <span className="badge badge-green">✅ Saison</span>}
                    {estOuverte ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Barre saisonnière */}
                <div className="saison-bar">
                  {MOIS_NOMS.map((nomMois, i) => (
                    <div
                      key={i}
                      className={`saison-bar-month ${i === moisActuel ? 'saison-bar-month-current' : ''}`}
                      style={{ background: couleurMois(culture, i) }}
                      title={`${nomMois} — ${culture.nom}`}
                    >
                      <span className="saison-bar-month-label">{nomMois}</span>
                    </div>
                  ))}
                </div>

                {/* Détails (dépliable) */}
                {estOuverte && (
                  <div className="saison-card-details">
                    <p>{culture.description}</p>
                    <div className="saison-card-meta">
                      <div className="saison-card-meta-item">
                        <Leaf size={14} />
                        <span>
                          {culture.saisonMois.length === 12
                            ? 'Disponible toute l\'année'
                            : `Saison : ${culture.saisonMois.map(m => MOIS_NOMS[m]).join(', ')}`
                          }
                        </span>
                      </div>
                      {culture.picMois.length > 0 && (
                        <div className="saison-card-meta-item">
                          <span style={{ fontSize: 14 }}>🏆</span>
                          <span>Pic : {culture.picMois.map(m => MOIS_NOMS[m]).join(', ')}</span>
                        </div>
                      )}
                      {culture.croissanceMois.length > 0 && (
                        <div className="saison-card-meta-item">
                          <span style={{ fontSize: 14 }}>🌱</span>
                          <span>Croissance : {culture.croissanceMois.map(m => MOIS_NOMS[m]).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Compteur en bas */}
      <div className="saison-count">
        <span>{culturesFiltrees.length} culture{culturesFiltrees.length !== 1 ? 's' : ''} affichée{culturesFiltrees.length !== 1 ? 's' : ''}</span>
        <span> sur 27</span>
      </div>
    </div>
  )
}

export default SeasonalCalendarPage
