import { useEffect, useState, useRef } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Link } from 'react-router-dom'
import { getRealClient } from '../lib/supabase'
import { PRICE_REFERENCES } from '../services/billingService'
import '../styles/partner-registration.css'

type Lot={id:string;owner_id:string;product:string;qty:number;unit:string;price_per_unit:number;commune:string;available_date:string}
type Order={id:string;owner_id:string;seller_id:string;ref:string;status:string;total:number;delivery_info:string;items:{product:string;qty:number;unit:string;price:number}[]}
type Event={id:number;order_id:string;status:string;note:string;created_at:string}
const labels:Record<string,string>={reserved:'Demande réservée',accepted:'Acceptée',ready:'Prête',collected:'Enlevée',delivered:'Réception confirmée',cancelled:'Annulée'}
const next:Record<string,string>={reserved:'accepted',accepted:'ready',ready:'collected'}
function message(e:unknown){return e&&typeof e==='object'&&'message'in e?String(e.message):'Impossible de terminer cette action.'}
export default function CommercePage(){
 const [session,setSession]=useState<Session|null>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('')
 const [enabled,setEnabled]=useState(false),[role,setRole]=useState(''),[approved,setApproved]=useState(false),[lots,setLots]=useState<Lot[]>([]),[orders,setOrders]=useState<Order[]>([]),[events,setEvents]=useState<Event[]>([])
 const [offer,setOffer]=useState({product:'',qty:'',unit:'kg',price:'',commune:'',available:''})
 const [pricingQuery,setPricingQuery]=useState(''),[pricingQty,setPricingQty]=useState('100'),[pricingUnitPrice,setPricingUnitPrice]=useState('')
 const [requests,setRequests]=useState<Record<string,{qty:string;delivery:string}>>({}),[notes,setNotes]=useState<Record<string,string>>({})
 const keys=useRef<Record<string,string>>({})
 const loadVersion=useRef(0),taskLock=useRef(false)
 async function load(s:Session){
  const version=++loadVersion.current
  const c=await getRealClient()
  const results=await Promise.all([c.from('commerce_settings').select('pilot_enabled').single(),c.from('partner_applications').select('role,status').eq('user_id',s.user.id).maybeSingle(),c.from('lots').select('id,owner_id,product,qty,unit,price_per_unit,commune,available_date').eq('active',true).order('created_at',{ascending:false}),c.from('orders').select('id,owner_id,seller_id,ref,status,total,delivery_info,items').order('created_at',{ascending:false}),c.from('order_events').select('id,order_id,status,note,created_at').order('created_at',{ascending:false})])
  if(version!==loadVersion.current)return
  for(const r of results)if(r.error)throw r.error
  setEnabled(results[0].data?.pilot_enabled===true);setApproved(results[1].data?.status==='approved');setRole(results[1].data?.role||'')
  setLots((results[2].data||[]) as unknown as Lot[]);setOrders((results[3].data||[]) as unknown as Order[]);setEvents((results[4].data||[]) as unknown as Event[])
 }
 useEffect(()=>{let live=true;let off=()=>{};getRealClient().then(async c=>{
  const {data}=c.auth.onAuthStateChange((_event,s)=>{if(live)setSession(s)});off=()=>data.subscription.unsubscribe()
  const r=await c.auth.getSession();if(!live)return;if(r.error)throw r.error;setSession(r.data.session);setLoading(false)
 }).catch(e=>{if(live){setError(message(e));setLoading(false)}});return()=>{live=false;off()}},[])
 useEffect(()=>{++loadVersion.current;setLots([]);setOrders([]);setEvents([]);setEnabled(false);setApproved(false);if(session)load(session).catch(e=>setError(message(e)));return()=>{++loadVersion.current}},[session])
 async function task(fn:()=>Promise<void>){if(taskLock.current)return;taskLock.current=true;setBusy(true);setError('');setNotice('');try{await fn();if(session)await load(session)}catch(e){setError(message(e))}finally{taskLock.current=false;setBusy(false)}}
 const seller=approved&&['producteur','pecheur','fournisseur','gie'].includes(role)
 const buyer=approved&&['acheteur_b2b','acheteur_b2c','gie','fournisseur'].includes(role)
 function editRequest(id:string,k:'qty'|'delivery',value:string){delete keys.current[id];setRequests(r=>({...r,[id]:{qty:r[id]?.qty||'',delivery:r[id]?.delivery||'',[k]:value}}))}
 async function reserve(l:Lot){
  const r=requests[l.id];if(!r?.delivery.trim()||!Number.isFinite(Number(r.qty))||Number(r.qty)<=0)throw Error('Indiquez la quantité et les modalités de retrait ou livraison.')
  const key=keys.current[l.id]||(keys.current[l.id]=crypto.randomUUID()),c=await getRealClient()
  const result=await c.rpc('reserve_pilot_lot',{p_lot:l.id,p_qty:Number(r.qty),p_request:key,p_delivery:r.delivery})
  if(result.error)throw result.error
  delete keys.current[l.id];setRequests(v=>({...v,[l.id]:{qty:'',delivery:''}}));setNotice('Demande enregistrée. Aucun paiement déclenché.')
 }
 async function transition(o:Order,status:string){
  const c=await getRealClient(),r=await c.rpc('transition_pilot_order',{p_order:o.id,p_status:status,p_note:notes[o.id]||''})
  if(r.error)throw r.error;setNotice('Étape enregistrée et visible par votre partenaire.')
 }
 return <div className="kp-shell"><header className="kp-header"><Link className="kp-brand" to="/">Kopé<span>Agri</span></Link><nav><Link to="/inscription/">Mon dossier</Link><Link to="/legal/">Informations légales</Link></nav></header><main className="kp-main">
 <div className="kp-intro"><p className="kp-eyebrow">Espace partagé des partenaires</p><h1>Lots et suivi des demandes</h1><p>Disponibilités, réservations et étapes de livraison enregistrées dans votre espace commun.</p></div>
 <section className="kp-card"><h2>Matrice tarifaire — criée digitale locale (indicative)</h2><p>Références de travail non actualisées en temps réel : elles ne sont ni des prix de marché officiels ni une obligation de vente. Le professionnel fixe librement son prix HT ; transport, conditionnement et TVA restent distincts.</p><div className="kp-fields"><label>Produit de référence<select value={pricingQuery} onChange={e=>setPricingQuery(e.target.value)}><option value="">Choisir un produit</option>{Object.entries(PRICE_REFERENCES).filter(([k])=>k!=='transport martinique').map(([k,v])=><option key={k} value={k}>{k} ({v.unit})</option>)}</select></label><label>Quantité estimée<input type="number" min="0.001" step="0.001" value={pricingQty} onChange={e=>setPricingQty(e.target.value)}/></label><label>Prix vendeur HT par unité (€)<input type="number" min="0" step="0.01" value={pricingUnitPrice} onChange={e=>setPricingUnitPrice(e.target.value)}/></label></div>{pricingQuery&&<p>Fourchette indicative : <strong>{PRICE_REFERENCES[pricingQuery].min.toFixed(2)}–{PRICE_REFERENCES[pricingQuery].max.toFixed(2)} € HT / {PRICE_REFERENCES[pricingQuery].unit}</strong> (source et date de cotation non vérifiées).</p>}{Number(pricingQty)>0&&pricingUnitPrice!==''&&Number(pricingUnitPrice)>=0&&<p>Simulation : produit {(Number(pricingQty)*Number(pricingUnitPrice)).toFixed(2)} € HT ; frais de gestion envisagés 0,10 € par transaction ; total indicatif {(Number(pricingQty)*Number(pricingUnitPrice)+0.10).toFixed(2)} € hors livraison et TVA éventuelle. <strong>Ces frais ne sont pas encore facturés ni prélevés.</strong></p>}<p>Proposition pilote : inscription gratuite, prix vendeur libre, frais de gestion de 0,10 € par commande confirmée, sous réserve de validation contractuelle et des coûts du prestataire de paiement. Les références doivent être confirmées auprès des professionnels locaux avant usage commercial.</p></section>
 <section className="kp-card"><h2>Votre circuit commercial</h2><p>Vendeur prévu : CLAVEAU VLADIMIR EI · IKABAY Sourcing · SIRET 103 128 716 00018.</p><p>Livraison par transporteur partenaire, coordonnée par Kopé. Le paiement en ligne et la facturation ne sont pas encore activés.</p><Link to="/legal/">Consulter les informations et conditions du pilote</Link></section>
 {error&&<div role="alert" className="kp-error">{error}</div>}{notice&&<div role="status" className="kp-success">{notice}</div>}
 {loading?<p>Chargement…</p>:!session?<section className="kp-card"><h2>Connectez-vous à votre compte partenaire</h2><p>Cet espace utilise votre compte et votre dossier validé.</p><Link to="/inscription/">Créer mon compte ou me connecter</Link></section>:<>
 <div className="kp-toolbar"><span>{session.user.email}</span><button disabled={busy} onClick={()=>void task(async()=>{})}>Actualiser</button></div>
 {!enabled&&<div role="status" className="kp-error"><strong>Le pilote commercial n’est pas encore ouvert.</strong><p>Vous pouvez préparer votre dossier. La publication et les nouvelles réservations seront disponibles après validation du pilote.</p></div>}
 {!approved&&<p>Votre dossier doit être validé par la coordination pour publier ou réserver. <Link to="/inscription/">Consulter mon dossier</Link></p>}
 {seller&&<section className="kp-card"><h2>Déclarer un lot</h2><form onSubmit={e=>{e.preventDefault();void task(async()=>{
  const c=await getRealClient(),r=await c.rpc('publish_pilot_lot',{p_product:offer.product,p_qty:Number(offer.qty),p_unit:offer.unit,p_price:Number(offer.price),p_commune:offer.commune,p_available:offer.available})
  if(r.error)throw r.error;setOffer({product:'',qty:'',unit:'kg',price:'',commune:'',available:''});setNotice('Lot enregistré.')
 })}}><div className="kp-fields">
 <label>Produit<input required maxLength={200} value={offer.product} onChange={e=>setOffer({...offer,product:e.target.value})}/></label>
 <label>Quantité disponible<input required type="number" min="0.001" max="1000000000" step="0.001" value={offer.qty} onChange={e=>setOffer({...offer,qty:e.target.value})}/></label>
 <label>Unité<select value={offer.unit} onChange={e=>setOffer({...offer,unit:e.target.value})}>{['kg','pièce','litre','caisse'].map(u=><option key={u}>{u}</option>)}</select></label>
 <label>Prix indicatif unitaire HT (€)<input required type="number" min="0" max="10000000" step="0.01" value={offer.price} onChange={e=>setOffer({...offer,price:e.target.value})}/></label>
 <label>Commune<input required maxLength={100} value={offer.commune} onChange={e=>setOffer({...offer,commune:e.target.value})}/></label>
 <label>Disponibilité / créneau<input maxLength={200} value={offer.available} onChange={e=>setOffer({...offer,available:e.target.value})}/></label></div>
 <button disabled={busy||!enabled}>Publier le lot</button></form></section>}
 <section><h2>Disponibilités partagées</h2>{lots.length===0&&<p>Aucun lot publié.</p>}{lots.map(l=><article className="kp-card" key={l.id}><h3>{l.product}</h3><p>{l.qty} {l.unit} disponibles · {l.price_per_unit} € HT / {l.unit} · {l.commune}</p><p>{l.available_date}</p>
 {buyer&&l.owner_id!==session.user.id&&<form onSubmit={e=>{e.preventDefault();void task(()=>reserve(l))}}><div className="kp-fields"><label>Quantité souhaitée<input required type="number" min="0.001" step="0.001" max={l.qty} value={requests[l.id]?.qty||''} onChange={e=>editRequest(l.id,'qty',e.target.value)}/></label><label>Retrait / livraison à convenir<textarea required maxLength={1000} value={requests[l.id]?.delivery||''} onChange={e=>editRequest(l.id,'delivery',e.target.value)}/></label></div><button disabled={busy||!enabled||l.qty<=0}>Demander une réservation</button></form>}</article>)}</section>
 <section><h2>Mes demandes et leur suivi</h2><p>Les montants sont indicatifs, hors taxes et livraison. Cet espace ne réalise aucun paiement et ne délivre pas de facture.</p>
 {orders.length===0&&<p>Aucune demande enregistrée.</p>}{orders.map(o=><article className="kp-card" key={o.id}><h3>{o.ref} · {labels[o.status]||o.status}</h3><p>{o.items.map(i=>i.product+' : '+i.qty+' '+i.unit).join(', ')} · {o.total} € HT indicatifs</p><p>{o.delivery_info}</p>
 <label>Référence d’enlèvement, de réception ou motif d’annulation<textarea maxLength={1000} value={notes[o.id]||''} onChange={e=>setNotes({...notes,[o.id]:e.target.value})}/></label><div className="kp-actions">
 {o.seller_id===session.user.id&&next[o.status]&&<button disabled={busy} onClick={()=>void task(()=>transition(o,next[o.status]))}>{labels[next[o.status]]}</button>}
 {o.owner_id===session.user.id&&o.status==='collected'&&<button disabled={busy} onClick={()=>void task(()=>transition(o,'delivered'))}>Confirmer la réception</button>}
 {(o.owner_id===session.user.id||o.seller_id===session.user.id)&&['reserved','accepted','ready'].includes(o.status)&&<button disabled={busy} className="kp-secondary" onClick={()=>{if(window.confirm('Annuler cette demande et remettre la quantité à disposition ?'))void task(()=>transition(o,'cancelled'))}}>Annuler la demande</button>}</div>
 <details><summary>Historique des étapes</summary><ul>{events.filter(e=>e.order_id===o.id).map(e=><li key={e.id}>{new Date(e.created_at).toLocaleString('fr-FR')} · {labels[e.status]||e.status} · {e.note}</li>)}</ul></details></article>)}</section></>}
 </main></div>
}
