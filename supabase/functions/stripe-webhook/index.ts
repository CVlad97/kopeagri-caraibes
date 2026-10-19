/** Legacy Kopé subscription webhook intentionally disabled.
 * The former handler trusted unsigned payloads and wrote to shared public tables.
 * Do NOT deploy this file over the shared project's DELIKREOL stripe-webhook.
 * Future Kopé payments require their own function name, signature validation,
 * event deduplication and isolated kopeagri payment tables.
 */
export function handleLegacyWebhook(_request: Request): Response {
  return new Response(JSON.stringify({ error: 'kopeagri_payments_not_configured' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

Deno.serve(handleLegacyWebhook)
