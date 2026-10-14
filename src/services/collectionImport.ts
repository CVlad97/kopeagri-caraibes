export type Cell = string | number | boolean | Date | null
export type SheetInput = { sheet: string; data: Cell[][] }
export type Schema = Record<string, string[][]>
export type Issue = { onglet: string; ligne: number; champ: string; message: string }
export type RecordRow = Record<string, Cell> & { __row: number }
export type Report = { counts: Record<string, number>; issues: Issue[]; issueCount: number; records: Record<string, RecordRow[]>; volumes: {partenaire: string; produit: string; unite: string; disponible: number}[]; empty: boolean }
const blank = (x: Cell | undefined) => x === null || x === undefined || x === ''
const str = (x: Cell | undefined) => blank(x) ? '' : String(x).trim()
const numberFields = /^(prix_|taux_tva$|poids_net_kg$|temperature_|commande_min_qte$|capacite_hebdo_qte$|delai_preparation_j$|qte_|quantite$|nombre_individus$|capacite_vehicule_kg$|cout_transport_ht$)/
const isDateField = (key: string) => /^(date_|disponible_du$|disponible_au$|prix_valable_jusquau$|echeance$|debut_periode$|fin_periode$)/.test(key)
const isDate = (v: Cell | undefined) => v instanceof Date && !Number.isNaN(v.getTime())
export function analyzeCollection(sheets: SheetInput[], schema: Schema): Report {
 const report: Report = {counts:{}, issues:[], issueCount:0, records:{}, volumes:[], empty:true}
 const issue = (onglet:string, ligne:number, champ:string, message:string) => {
  report.issueCount++
  if (report.issues.length < 200) report.issues.push({onglet,ligne,champ,message})
 }
 for (const [name, fields] of Object.entries(schema)) {
  report.counts[name]=0; report.records[name]=[]
  const matches=sheets.filter(s=>s.sheet===name)
  if(matches.length!==1){issue(name,1,'onglet',matches.length?'Onglet répété':'Onglet absent du modèle');continue}
  const data=matches[0].data
  if(data.length>2001) {issue(name,1,'limite','Maximum 2 000 lignes par onglet');continue}
  const headers=(data[0]||[]).map(str)
  for(const [key] of fields) if(headers.filter(h=>h===key).length!==1) issue(name,1,key,'En-tête absent ou répété')
  const seen=new Set<string>()
  data.slice(1).forEach((cells, idx)=>{
   // Formula-only rows in an empty template are not business records.
   const inputs=fields.filter(f=>f[2]!=='Calcul')
   if(inputs.every(([key])=>blank(cells[headers.indexOf(key)])))return
   const row:RecordRow={__row:idx+2}
   for(const [key,,required] of fields){
    const value=cells[headers.indexOf(key)]??null;row[key]=value
    if(required==='Calcul')continue
    if(required==='Oui'&&blank(value))issue(name,idx+2,key,'À renseigner')
    if(!blank(value)&&numberFields.test(key)&&!isDateField(key)){
     if(typeof value!=='number'||!Number.isFinite(value))issue(name,idx+2,key,'Nombre Excel requis')
     else if(!key.startsWith('temperature_')&&value<0)issue(name,idx+2,key,'Valeur négative interdite')
     else if(key==='taux_tva'&&value>1)issue(name,idx+2,key,'Saisir un pourcentage, par exemple 8,5 % et non 8,5')
    }
    if(!blank(value)&&isDateField(key)&&!key.endsWith('_iso')&&!isDate(value))issue(name,idx+2,key,'Date Excel requise')
    if(!blank(value)&&key.endsWith('_iso')&&(!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(str(value))||Number.isNaN(Date.parse(str(value)))))issue(name,idx+2,key,'Date et heure ISO 8601 avec fuseau requises')
    if(key.endsWith('_id')&&!blank(value)&&!(/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(str(value))))issue(name,idx+2,key,'Identifiant : lettres, chiffres, tirets uniquement')
    if(key==='siret'&&!blank(value)&&!/^\d{14}$/.test(str(value)))issue(name,idx+2,key,'SIRET : 14 chiffres, conservés en texte')
    if(key==='email'&&!blank(value)&&!/^\S+@\S+\.\S+$/.test(str(value)))issue(name,idx+2,key,'Adresse email invalide')
    if(key==='unite'&&!blank(value)&&!['kg','piece','litre','botte','colis'].includes(str(value)))issue(name,idx+2,key,'Unité non reconnue')
    if(key==='statut_validation'&&!blank(value)&&!['a_completer','a_verifier','valide','refuse'].includes(str(value)))issue(name,idx+2,key,'Statut non reconnu')
    if(key==='photo_url'&&!blank(value)){try{if(new URL(str(value)).protocol!=='https:')throw Error()}catch{issue(name,idx+2,key,'URL HTTPS requise')}}
   }
   const id=str(row[fields[0][0]])
   if(id&&seen.has(id))issue(name,idx+2,fields[0][0],'Identifiant en doublon')
   seen.add(id);report.records[name].push(row)
  })
  report.counts[name]=report.records[name].length
 }
 report.empty=Object.values(report.counts).every(n=>n===0)
 const target=(name:string,key:string,val:Cell|undefined)=>report.records[name]?.find(r=>str(r[key])===str(val)&&!blank(val))
 const refs:Record<string,[string,string]>={partenaire_id:['Partenaires','partenaire_id'],acteur_id:['Partenaires','partenaire_id'],acheteur_id:['Partenaires','partenaire_id'],transporteur_id:['Partenaires','partenaire_id'],payeur_id:['Partenaires','partenaire_id'],de_partenaire_id:['Partenaires','partenaire_id'],vers_partenaire_id:['Partenaires','partenaire_id'],produit_id:['Produits','produit_id'],offre_id:['Offres','offre_id'],lot_id:['Lots','lot_id'],lot_parent_id:['Lots','lot_id'],commande_id:['Commandes','commande_id']}
 for(const [name,rows] of Object.entries(report.records))for(const r of rows){
  for(const [key,[tab,pk]] of Object.entries(refs)){
   if(!blank(r[key])&&!(tab===name&&key===pk)&&!target(tab,pk,r[key]))issue(name,r.__row,key,'Référence introuvable dans '+tab)
  }
  if(name==='Offres'||name==='Lots'||name==='Besoins_acheteurs'){
   const p=target('Produits','produit_id',r.produit_id)
   if(p&&!blank(r.unite)&&str(p.unite)!==str(r.unite))issue(name,r.__row,'unite','Unité différente du produit')
  }
  if(name==='Offres'&&isDate(r.disponible_du)&&isDate(r.disponible_au)&&Number(r.disponible_du)>Number(r.disponible_au))issue(name,r.__row,'disponible_au','Fin antérieure au début')
  if(name==='Lots'){
   const o=target('Offres','offre_id',r.offre_id)
   if(o&&(str(o.partenaire_id)!==str(r.partenaire_id)||str(o.produit_id)!==str(r.produit_id)||str(o.unite)!==str(r.unite)))issue(name,r.__row,'offre_id','Lot incohérent avec producteur, produit ou unité de l’offre')
   if(['DLC','DDM'].includes(str(r.type_date_limite))&&!isDate(r.date_limite))issue(name,r.__row,'date_limite','DLC ou DDM : date obligatoire')
   const q=[r.qte_initiale,r.qte_reservee,r.qte_sortie,r.qte_perdue]
   if(q.every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0)){
    const available=Number(q[0])-Number(q[1])-Number(q[2])-Number(q[3])
    if(available<0)issue(name,r.__row,'qte_disponible','Réservations, sorties et pertes dépassent le stock initial')
    else if(str(r.statut_lot)==='disponible'&&(!isDate(r.date_limite)||Number(r.date_limite)>=new Date().setUTCHours(0,0,0,0))){
     report.volumes.push({partenaire:str(r.partenaire_id),produit:str(r.produit_id),unite:str(r.unite),disponible:available})
    }
   }
  }
  if(['Commandes','Logistique','Evenements'].includes(name)){
   const lot=target('Lots','lot_id',r.lot_id)
   if(lot&&!blank(r.unite)&&str(lot.unite)!==str(r.unite))issue(name,r.__row,'unite','Unité différente du lot')
  }
  if(name==='Peche'){
   if(['capture_mer','capture_eau_douce'].includes(str(r.mode_production))&&(blank(r.sortie_jour_id)||blank(r.categorie_engin))&&blank(r.certificat_capture_ref))issue(name,r.__row,'sortie_jour_id','Renseigner sortie/jour et engin pour cette capture')
   if(str(r.mode_production)==='aquaculture'&&blank(r.unite_aquacole))issue(name,r.__row,'unite_aquacole','Unité aquacole obligatoire')
  }
  if(name==='Produits'&&!blank(r.label_revendique)&&blank(r.preuve_label_ref))issue(name,r.__row,'preuve_label_ref','Justificatif du label manquant')
  if(name==='Administratif'&&str(r.statut_document)==='valide'&&(blank(r.verificateur)||blank(r.date_verification)||blank(r.reference_privee)))issue(name,r.__row,'statut_document','Vérificateur, date et référence nécessaires')
 }
 // Never present totals as reliable if any structural or data error remains.
 if(report.issueCount)report.volumes=[]
 return report
}
