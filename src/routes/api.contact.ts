import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { z } from 'zod'
import { getResendClient, getAdminEmailTarget } from '@/lib/email/client'
import { createLead } from '@/lib/server/leads'

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export const Route = createFileRoute('/api/contact')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const validatedFields = contactSchema.safeParse(body)

          if (!validatedFields.success) {
            return json({
              error: 'Validation failed',
              fieldErrors: validatedFields.error.flatten().fieldErrors
            }, { status: 400 })
          }

          const { firstName, lastName, email, subject, message } = validatedFields.data

          try {
            await createLead({
              firstName,
              lastName,
              email,
              subject,
              message,
              source: 'contact_form'
            })
          } catch (leadError) {
            console.error('Failed to create lead from contact form:', leadError)
          }

          const resend = await getResendClient()
          if (!resend) {
            return json({ error: 'System configuration error: Email service not active.' }, { status: 503 })
          }

          const recipient = await getAdminEmailTarget()
          const fromAddress = 'noreply@update.crediblemark.com'

          const escapeHtml = (str: string) =>
            str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;')

          const safeFirstName = escapeHtml(firstName)
          const safeLastName = escapeHtml(lastName)
          const safeEmail = escapeHtml(email)
          const safeSubject = escapeHtml(subject)
          const safeMessage = escapeHtml(message).replace(/\n/g, '<br>')

          const { error } = await resend.emails.send({
            from: `AgencyOS Contact <${fromAddress}>`,
            to: [recipient],
            replyTo: email,
            subject: `[Contact Form] ${safeSubject} - ${safeFirstName} ${safeLastName}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>From:</strong> ${safeFirstName} ${safeLastName} (${safeEmail})</p>
              <p><strong>Subject:</strong> ${safeSubject}</p>
              <hr />
              <h3>Message:</h3>
              <p>${safeMessage}</p>
            `,
          })

          if (error) {
            console.error('Resend Error:', error)
            return json({
              error: error.message || 'Failed to send email',
              details: error
            }, { status: 500 })
          }

          return json({ success: true })
        } catch (error) {
          console.error('Contact API Error:', error)
          return json({ error: 'Internal Server Error' }, { status: 500 })
        }
      }
    }
  }
})
