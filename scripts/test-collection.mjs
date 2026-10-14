import assert from 'node:assert/strict'
import fs from 'node:fs'
import {analyzeCollection} from '../src/services/collectionImport.ts'
import readXlsx from 'read-excel-file/node'
const schema=JSON.parse(fs.readFileSync(new URL('../src/services/collectionSchema.json',import.meta.url),'utf8'))
const empty=()=>Object.entries(schema).map(([sheet,f])=>({sheet,data:[f.map(x=>x[0])]}))
function check(name,fn){fn();console.log('PASS '+name)}
check('empty template',()=>{const r=analyzeCollection(empty(),schema);assert.equal(r.issueCount,0);assert.equal(r.empty,true)})
check('missing sheets',()=>assert.equal(analyzeCollection([],schema).issueCount,10))
check('unknown headings',()=>{const s=empty();s[0].data[0][0]='bad';assert.ok(analyzeCollection(s,schema).issues.some(x=>x.champ==='partenaire_id'))})
check('blank formulas are ignored',()=>{const s=empty();const o=s.find(x=>x.sheet==='Offres');const row=o.data[0].map(()=>null);row[5]=0;o.data.push(row);assert.equal(analyzeCollection(s,schema).counts.Offres,0)})
check('required fields and duplicate IDs',()=>{const s=empty();s[0].data.push(['PAR-TEST'],['PAR-TEST']);const r=analyzeCollection(s,schema);assert.ok(r.issues.some(x=>x.message==='Identifiant en doublon'));assert.ok(r.issues.some(x=>x.message==='À renseigner'))})
function row(s,name,v){const t=s.find(x=>x.sheet===name);t.data.push(t.data[0].map(k=>v[k]??null))}
check('orphan keys, negative stock, and mixed units',()=>{const s=empty();row(s,'Produits',{produit_id:'P-1',unite:'kg'});row(s,'Lots',{lot_id:'L-1',produit_id:'P-1',partenaire_id:'UNKNOWN',offre_id:'UNKNOWN',unite:'piece',qte_initiale:10,qte_reservee:20,qte_sortie:0,qte_perdue:0});const r=analyzeCollection(s,schema);assert.ok(r.issues.some(x=>x.message.includes('Référence introuvable')));assert.ok(r.issues.some(x=>x.message.includes('dépassent')));assert.ok(r.issues.some(x=>x.message.includes('Unité différente')));assert.deepEqual(r.volumes,[])})
check('missing VAT does not become zero',()=>{const s=empty();row(s,'Offres',{offre_id:'O-1',prix_unitaire_ht:10});assert.ok(analyzeCollection(s,schema).issues.some(x=>x.champ==='taux_tva'))})
check('invalid date and price',()=>{const s=empty();row(s,'Offres',{offre_id:'O-1',prix_unitaire_ht:'12,50',disponible_du:'demain'});const r=analyzeCollection(s,schema);assert.ok(r.issues.some(x=>x.message==='Nombre Excel requis'));assert.ok(r.issues.some(x=>x.message==='Date Excel requise'))})
if(process.argv[2]){const sheets=await readXlsx(process.argv[2]);const r=analyzeCollection(sheets,schema);assert.equal(r.issueCount,0);assert.equal(r.empty,true);console.log('PASS delivered XLSX: all 10 collection sheets, no errors or fake records')}
