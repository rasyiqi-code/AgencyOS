import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { hexclaveClientApp } from '@/lib/config/hexclave-client'
import { getSystemSettings } from '@/src/server/settings'
import { submitTestimonialFn } from '@/src/server/admin'

export const Route = createFileRoute('/submit-testimonial')({
  beforeLoad: async () => {
    const user = await hexclaveClientApp.getUser()
    if (!user) {
      throw redirect({
        href: '/handler/sign-in?after_auth_return_to=/submit-testimonial',
      })
    }
  },
  loader: async () => {
    const user = await hexclaveClientApp.getUser()
    if (!user) throw redirect({ href: '/handler/sign-in' })

    const settings = await getSystemSettings({ data: ['AGENCY_NAME'] })
    const agencyName = settings.find((s: any) => s.key === 'AGENCY_NAME')?.value || 'Agency OS'

    return {
      agencyName,
      userAvatar: user.profileImageUrl || null,
      userName: user.displayName || null,
    }
  },
  component: SubmitTestimonialPage,
})

function SubmitTestimonialPage() {
  const { agencyName, userAvatar, userName } = Route.useLoaderData()
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  const [name, setName] = useState(userName || '')
  const [role, setRole] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !role || !content) {
      toast.error('Please fill in all fields')
      return
    }

    startTransition(async () => {
      try {
        const result = await submitTestimonialFn({
          data: { name, role, content },
        })

        if (result.success) {
          setSubmitted(true)
          toast.success('Testimonial submitted successfully!')
        } else {
          toast.error('Something went wrong. Please try again.')
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to submit. Please try again.')
      }
    })
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-zinc-900/50 border-white/10 text-center">
          <CardContent className="pt-10 pb-8 space-y-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Thank You!</h1>
              <p className="text-zinc-400">
                Your testimonial has been submitted successfully. It will appear on our homepage once verified by our team.
              </p>
            </div>
            <Button
              onClick={() => {
                window.location.href = '/'
              }}
              className="bg-white text-black hover:bg-zinc-200 w-full"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-heading tracking-tight sm:text-4xl text-white">
            Share Your Experience
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base">
            How has {agencyName} helped your business?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {userAvatar && (
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-[72px] h-[72px] rounded-full border-2 border-white/10 object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-0.5 border-2 border-black">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-zinc-400 text-[11px] uppercase tracking-widest font-bold pl-1">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Chen"
                className="bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-white/20 h-11 rounded-xl transition-all hover:bg-white/10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-zinc-400 text-[11px] uppercase tracking-widest font-bold pl-1">
                Role & Company
              </Label>
              <Input
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="CTO, InnovateLabs"
                className="bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-white/20 h-11 rounded-xl transition-all hover:bg-white/10"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content" className="text-zinc-400 text-[11px] uppercase tracking-widest font-bold pl-1">
              Your Testimonial
            </Label>
            <Textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`${agencyName} helped us ship our MVP in record time...`}
              className="bg-white/5 border-white/5 min-h-[140px] text-white placeholder:text-white/20 focus:border-white/20 resize-none text-base rounded-xl transition-all hover:bg-white/10"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            size="lg"
            className="w-full bg-white text-black hover:bg-zinc-200 h-11 rounded-full font-bold text-sm tracking-wide"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Testimonial
          </Button>
        </form>
      </div>
    </div>
  )
}
