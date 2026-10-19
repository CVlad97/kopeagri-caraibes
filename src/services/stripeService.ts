/** Payments remain disabled until a verified IKABAY merchant and server checkout exist.
 * Never infer readiness from a public key or placeholder price ID.
 * Never redirect an unsuccessful payment to a messaging service.
 */
export interface CheckoutOptions {
  planId: string
  email: string
  fullName: string
  isAnnual?: boolean
}

export async function redirectToCheckout(_opts: CheckoutOptions): Promise<{ url: string | null; error: string | null }> {
  return {
    url: null,
    error: 'Les paiements et abonnements Kopé Agri ne sont pas encore ouverts. Aucun montant n’a été débité. Vous pouvez préparer votre dossier partenaire.',
  }
}

export function isStripeConfigured(): boolean {
  return false
}
