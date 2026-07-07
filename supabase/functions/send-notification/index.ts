// Supabase Edge Function: send-notification
// Envoie notifications WhatsApp (Twilio) + Email (Resend)
// Deploy: supabase functions deploy send-notification

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ===== WHATSAPP VIA TWILIO =====
async function sendWhatsApp(to: string, body: string) {
  const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const twilioFrom = Deno.env.get('TWILIO_WHATSAPP_FROM') // 'whatsapp:+14155238886'

  if (!twilioSid || !twilioToken || !twilioFrom) {
    console.warn('Twilio not configured — skipping WhatsApp')
    return { success: false, reason: 'twilio_not_configured' }
  }

  // Format phone for WhatsApp: +596696XXXXXX
  const formattedTo = to.startsWith('+') ? `whatsapp:${to}` : `whatsapp:+596${to.replace(/\s/g, '')}`

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: twilioFrom,
        To: formattedTo,
        Body: body,
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error('Twilio error:', err)
    return { success: false, reason: err }
  }
  return { success: true }
}

// ===== EMAIL VIA RESEND =====
async function sendEmail(to: string, subject: string, html: string) {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) {
    console.warn('Resend not configured — skipping email')
    return { success: false, reason: 'resend_not_configured' }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'KopéAgri Caraïbes <noreply@kopeagri.mq>',
      to: [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
    return { success: false, reason: err }
  }
  return { success: true }
}

// ===== MAIN HANDLER =====
serve(async (req) => {
  try {
    const { notification_id, channel, user_id, title, body, phone, email, action_url } = await req.json()

    let result: any = {}

    if (channel === 'whatsapp' && phone) {
      result.whatsapp = await sendWhatsApp(phone, `🌱 *KopéAgri Caraïbes*\n\n${title}\n\n${body}${action_url ? `\n\n👉 ${action_url}` : ''}`)
    }

    if (channel === 'email' && email) {
      const html = `
        <div style="font-family: system-ui; max-width: 600px; margin: 0 auto;">
          <div style="background: #1B5E20; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">🌱 KopéAgri Caraïbes</h1>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1B5E20; margin-top: 0;">${title}</h2>
            <p style="font-size: 16px; line-height: 1.6;">${body}</p>
            ${action_url ? `<a href="${action_url}" style="display: inline-block; background: #2E7D32; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Voir sur KopéAgri</a>` : ''}
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
            <p style="color: #888; font-size: 12px;">KopéAgri Caraïbes — Coopérative agricole digitale de Martinique<br />📍 Fort-de-France, Martinique</p>
          </div>
        </div>
      `
      result.email = await sendEmail(email, title, html)
    }

    // Update notification status in DB
    if (notification_id) {
      const success = result.whatsapp?.success || result.email?.success
      await supabase
        .from('notifications')
        .update({
          status: success ? 'envoyee' : 'echouee',
          sent_at: new Date().toISOString(),
          metadata: result,
        })
        .eq('id', notification_id)
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('send-notification error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
