const test = require('node:test');const assert = require('node:assert/strict');const fs = require('node:fs');
const app=fs.readFileSync('src/App.tsx','utf8');
const home=fs.readFileSync('src/pages/LandingOfficiellePage.tsx','utf8');
const page=fs.readFileSync('src/pages/LangoustePilotPage.tsx','utf8');
const deploy=fs.readFileSync('.github/workflows/deploy.yml','utf8');
test('pilot has a linked landing, route, and direct SPA entry',()=>{
 assert.match(app,/path="\/partenaire\/langouste-house"/);
 assert.match(home,/to="\/partenaire\/langouste-house"/);
 assert.match(deploy,/partenaire\/langouste-house/);
});
test('B2B B2C and export are quote-only, with separate legal responsibilities',()=>{
 assert.match(page,/B2B/);assert.match(page,/B2C/);assert.match(page,/Export/);
 assert.match(page,/responsabilités séparées/);assert.match(page,/Aucune quantité/);
 assert.match(page,/to="\/devis-approvisionnement"/);
});
