import nodemailer from 'npm:nodemailer@6'

export function createTransporter() {
  return nodemailer.createTransport({
    host: Deno.env.get('BREVO_SMTP_HOST') ?? 'smtp-relay.brevo.com',
    port: Number(Deno.env.get('BREVO_SMTP_PORT') ?? 587),
    secure: false,
    auth: {
      user: Deno.env.get('BREVO_SMTP_USER'),
      pass: Deno.env.get('BREVO_SMTP_PASS'),
    },
  })
}

export const FROM_NAME  = Deno.env.get('BREVO_FROM_NAME')  ?? 'A2 Brasil Supplies'
export const FROM_EMAIL = Deno.env.get('BREVO_FROM_EMAIL') ?? 'a2brasil.ti@gmail.com'
