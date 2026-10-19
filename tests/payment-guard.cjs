const { readFileSync } = require('node:fs')
const { test } = require('node:test')
const assert = require('node:assert/strict')
const vm = require('node:vm')
const ts = require('typescript')
function load(path, globals = {}) {
  const exports = {}
  const js = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(js, { exports, ...globals })
  return exports
}
test('disabled checkout returns no URL and performs no external request', async () => {
  const api = load('src/services/stripeService.ts')
  assert.equal(api.isStripeConfigured(), false)
  for (const planId of ['konbit', 'plantasyon', 'unknown']) {
    const result = await api.redirectToCheckout({planId, email:'test@example.invalid', fullName:'TEST'})
    assert.equal(result.url, null)
    assert.match(result.error, /ne sont pas encore ouverts/)
  }
})
test('legacy webhook cannot accept fabricated payment events', async () => {
  let handler
  load('supabase/functions/stripe-webhook/index.ts', { Response, Deno: { serve: fn => { handler = fn } } })
  for (const method of ['GET', 'POST']) {
    const req = new Request('https://example.invalid', {method, ...(method === 'POST' ? {body:JSON.stringify({type:'checkout.session.completed',data:{object:{metadata:{user_id:'forged',plan:'konbit'}}}})} : {})})
    const response = await handler(req)
    assert.equal(response.status, 503)
    assert.equal((await response.json()).error, 'kopeagri_payments_not_configured')
  }
})
