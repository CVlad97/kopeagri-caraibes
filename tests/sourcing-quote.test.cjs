const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const page = fs.readFileSync('src/pages/SourcingRequestPage.tsx','utf8');
const app = fs.readFileSync('src/App.tsx','utf8');
const home = fs.readFileSync('src/pages/LandingOfficiellePage.tsx','utf8');
test('request-only path is public and discoverable', () => {
 assert.match(app, /path="\/devis-approvisionnement"/);
 assert.match(home, /to="\/devis-approvisionnement"/);
});
test('no fake order or payment claim', () => {
 assert.match(page, /pas une commande confirmée/);
 assert.match(page, /Aucun paiement n'est encaissé/);
 assert.doesNotMatch(page, /localStorage|service_role/);
});
test('WhatsApp requires final customer send action', () => {
 assert.match(page,/wa\.me/);
 assert.match(page,/appuyez sur « Envoyer »/);
 assert.match(page,/rel="noopener noreferrer"/);
});
