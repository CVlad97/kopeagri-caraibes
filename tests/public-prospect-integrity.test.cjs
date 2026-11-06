const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const home=fs.readFileSync('src/pages/LandingOfficiellePage.tsx','utf8');const workflow=fs.readFileSync('.github/workflows/deploy.yml','utf8');
test('every public prospect route gets a direct GitHub Pages entry and smoke check',()=>{
 assert.match(workflow,/for route in devis-approvisionnement marche-pilote/);
 assert.match(workflow,/for route in \/ \/devis-approvisionnement\//);
});
test('no invented market activity or pretend newsletter signup',()=>{
 for (const phrase of ['27</b><small>productions référencées','Demandes actives cette semaine','Vous êtes inscrit — à bientôt','const [subscribed','250 kg']) assert.equal(home.includes(phrase),false,phrase);
 assert.match(home,/Exemples de besoins à qualifier/);
 assert.match(home,/non contractuelles/);
});
test('actual prospect actions available for B2B, B2C and partners',()=>{
 assert.match(home,/to="\/devis-approvisionnement"/);
 assert.match(home,/to="\/inscription"/);
});
