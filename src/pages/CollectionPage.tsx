import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileSpreadsheet, Upload, Download, ArrowLeft } from 'lucide-react'
import readXlsxFile from 'read-excel-file/browser'
import schema from '../services/collectionSchema.json'
import { analyzeCollection } from '../services/collectionImport'
import type { Report } from '../services/collectionImport'

export default function CollectionPage() {
 const [report,setReport]=useState<Report|null>(null)
 const [error,setError]=useState('')
 const [busy,setBusy]=useState(false)
 const [filename,setFilename]=useState('')
 const fileInput=useRef<HTMLInputElement>(null)
 async function load(file?:File){
  setReport(null);setError('');setFilename('')
  if(!file)return
  if(!file.name.toLowerCase().endsWith('.xlsx')){setError('Choisissez le classeur .xlsx KopéAgri.');return}
  if(file.size>5*1024*1024){setError('Le fichier dépasse la limite de 5 Mo. Retirez les images intégrées et utilisez des liens.');return}
  setBusy(true)
  try{
   const sheets=await readXlsxFile(file)
   setReport(analyzeCollection(sheets.map(sheet => ({ sheet: sheet.sheet, data: sheet.data.map(row => row.map(cell => typeof cell === "function" ? null : cell)) })),schema));setFilename(file.name)
  }catch{setError('Lecture impossible. Vérifiez que le fichier est un .xlsx valide, non protégé par mot de passe.')}
  finally{setBusy(false)}
 }
 function downloadReport(){
  if(!report)return
  const content={version:'kopeagri-collecte-v1',fichier:filename,date:new Date().toISOString(),comptages:report.counts,erreurs:report.issues,nombre_erreurs:report.issueCount,limite_erreurs_affichees:200,mode:'controle_local_sans_enregistrement_metier'}
  const url=URL.createObjectURL(new Blob([JSON.stringify(content,null,2)],{type:'application/json'}))
  const a=document.createElement('a');a.href=url;a.download='KopeAgri_rapport_collecte.json';a.click();URL.revokeObjectURL(url)
 }
 const total=report?Object.values(report.counts).reduce((a,b)=>a+b,0):0
 return <main className="page" style={{maxWidth:1120,margin:'0 auto',padding:'28px 18px'}}>
  <Link to="/partenariat"><ArrowLeft size={16}/> Retour au partenariat</Link>
  <div className="page-header" style={{marginTop:24}}><div><h1><FileSpreadsheet size={28}/> Préparer les données du pilote</h1><p className="page-subtitle">Producteurs, produits, prix, volumes et traçabilité dans un seul classeur.</p></div></div>
  <section className="section-block">
   <h2>1. Compléter le classeur</h2>
   <p>Commencez par Partenaires, Produits, Offres et Lots. Utilisez les identifiants identiques entre onglets. Le Dictionnaire décrit chaque champ. Les prix, quantités et disponibilités doivent être confirmés par les partenaires.</p>
   <p>Le cahier des charges et le rétroplanning servent à répartir les responsabilités avant le pilote.</p>
  </section>
  <section className="section-block">
   <h2>2. Charger et contrôler le fichier Excel</h2>
   <p>Le fichier est lu sur cet appareil. Ce contrôle ne publie aucun produit, ne crée aucune commande et ne transmet aucune donnée à la base métier. Rechargez le classeur après chaque correction.</p>
   <label htmlFor="collection-file" style={{display:'block',fontWeight:600,margin:'16px 0 8px'}}>Classeur KopéAgri (.xlsx, 5 Mo maximum)</label>
   <input ref={fileInput} id="collection-file" type="file" accept=".xlsx" disabled={busy} onChange={e=>void load(e.target.files?.[0])}/>
   {busy&&<p role="status"><Upload size={16}/> Lecture et contrôle en cours…</p>}
   {error&&<p role="alert" style={{color:'#9a2525'}}>{error}</p>}
  </section>
  {report&&<section className="section-block" aria-live="polite">
   <h2>3. Bilan de la collecte</h2><p>{filename} — {total} fiche(s) renseignée(s).</p>
   <p style={{fontWeight:600,color:report.issueCount?'#9a2525':'#24543c'}}>{report.empty?'Modèle vide : commencez la collecte.':report.issueCount?report.issueCount+' point(s) à corriger.':'Contrôles de structure réussis. Les pièces, conditions métier et données restent à valider.'}</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>{Object.entries(report.counts).map(([name,n])=><div key={name} className="card" style={{padding:14}}><strong>{name.replaceAll('_',' ')}</strong><p>{n} fiche(s)</p></div>)}</div>
   {report.issues.length>0&&<><h3 style={{marginTop:24}}>Corrections attendues</h3><div style={{overflowX:'auto'}}><table className="data-table"><thead><tr><th>Onglet</th><th>Ligne Excel</th><th>Champ</th><th>Correction</th></tr></thead><tbody>{report.issues.map((x,i)=><tr key={i}><td>{x.onglet}</td><td>{x.ligne}</td><td>{x.champ}</td><td>{x.message}</td></tr>)}</tbody></table></div>{report.issueCount>200&&<p>Les 200 premiers points sont affichés. Corrigez-les puis rechargez le fichier.</p>}</>}
   {report.volumes.length>0&&<><h3 style={{marginTop:24}}>Disponibles par lot, producteur et produit</h3><p>Les lots bloqués, retirés et périmés sont exclus. Les unités restent séparées.</p><div style={{overflowX:'auto'}}><table className="data-table"><thead><tr><th>Producteur</th><th>Produit</th><th>Disponible</th><th>Unité</th></tr></thead><tbody>{report.volumes.map((v,i)=><tr key={i}><td>{v.partenaire}</td><td>{v.produit}</td><td>{v.disponible}</td><td>{v.unite}</td></tr>)}</tbody></table></div></>}
   <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:24}}><button className="btn btn-primary" onClick={downloadReport}><Download size={16}/> Télécharger le bilan</button><button className="btn btn-outline" onClick={()=>{setReport(null);setFilename('');setError('');if(fileInput.current)fileInput.current.value=''}}>Effacer de cet écran</button></div>
  </section>}
  <section className="section-block"><h2>Avant l’ouverture commerciale</h2><p>Valider les dossiers partenaires, les règles de vente, la collecte et les essais de commande. La synchronisation partagée et les droits d’accès doivent être vérifiés sur plusieurs comptes et appareils avant l’enregistrement métier de ce classeur.</p><Link to="/partenariat" className="btn btn-outline">Revoir les objectifs du pilote</Link></section>
 </main>
}
