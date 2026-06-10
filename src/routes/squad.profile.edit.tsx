import { createFileRoute, redirect, useLoaderData } from '@tanstack/react-router'
import { getSquadProfile } from '@/src/server/squad'
import { ProfileEditForm } from '@/components/squad/profile-edit-form'
import { ChevronLeft } from 'lucide-react'

const loader = async () => {
  const data = await getSquadProfile()
  if (!data || !data.user) {
    throw redirect({ href: '/handler/sign-in' })
  }

  if (!data.profile) {
    throw redirect({ href: '/squad/onboarding' })
  }

  // Serealize yearsOfExp dan data tanggal jika ada
  const serializedProfile = {
    ...data.profile,
    createdAt: data.profile.createdAt.toISOString(),
    updatedAt: data.profile.updatedAt.toISOString(),
  }

  return { profile: serializedProfile }
}

export const Route = createFileRoute('/squad/profile/edit')({
  loader,
  component: EditProfilePage,
})

function EditProfilePage() {
  const { profile } = useLoaderData({ from: Route.id })

  return (
    <div className="container mx-auto px-4 pb-12 w-full max-w-3xl pt-28">
      <div className="mb-6">
        <a href="/squad/profile" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to Profile
        </a>
        <h1 className="text-3xl font-bold text-white tracking-tight">Edit Profile</h1>
        <p className="text-zinc-400">Update your operative details and skills.</p>
      </div>

      <ProfileEditForm profile={profile as any} />
    </div>
  )
}
