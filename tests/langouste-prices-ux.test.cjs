const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const canonical = fs.readFileSync('src/pages/LangousteHousePage.tsx','utf8')
const landing = fs.readFileSync('src/pages/LandingOfficiellePage.tsx','utf8')
test('cooked kilo calculation uses 10x Charles price per 100g, marked as unconfirmed', () => {
 assert.equal(8.68 * 10, 86.8)
 assert.equal(15 * 10, 150)
 assert.match(canonical, /pricePer100:\s*8\.68/)
 assert.match(canonical, /pricePer100:\s*15/)
 assert.match(canonical, /22\/10\/2026/)
 assert.match(canonical, /reconfirmer/)
 assert.match(landing, /86,80 € \/ kg/)
})
test('no invented vivier evidence and authentic photo links available', () => {
 assert.match(canonical, /Photo du bassin à venir/)
 for(const name of ['bandeau-original.jpg','terrasse.jpg','langouste-grillee-recadree.webp','queue-bbq-recadree.webp']){
  assert.ok(fs.existsSync(path.join('public/visuals/langouste-house',name)),name)
 }
 assert.match(canonical, /Sans encaissement|sans encaissement/i)
})
