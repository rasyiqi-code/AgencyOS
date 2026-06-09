import { createFileRoute } from '@tanstack/react-router'
import { getClientSettingsDataFn } from '@/src/server/client-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, User } from "lucide-react"

export const Route = createFileRoute('/dashboard/settings')({
  loader: async () => {
    return await getClientSettingsDataFn()
  },
  component: SettingsPage,
})

function SettingsPage() {
  const result = Route.useLoaderData()
  if (!result || !result.success || !result.user) {
    return <div className="text-zinc-500 p-8 text-left">Gagal memuat pengaturan atau Anda tidak memiliki akses.</div>
  }

  const { user } = result

  return (
    <div className="flex flex-col gap-8 pb-10 text-left">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your account and subscription.</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="w-5 h-5 text-blue-500" /> Profile
            </CardTitle>
            <CardDescription className="text-zinc-400 font-light">Your personal information managed by Stack Auth.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-xl font-bold text-blue-400 border border-blue-500/20">
                {user.displayName?.charAt(0) || user.primaryEmail?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">{user.displayName || "User"}</h3>
                <p className="text-zinc-500 text-sm">{user.primaryEmail}</p>
              </div>
              <Button variant="outline" className="ml-auto border-white/10 hover:bg-white/5 text-zinc-300" disabled>Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="w-5 h-5 text-yellow-500" /> Notifications
            </CardTitle>
            <CardDescription className="text-zinc-400 font-light">Configure how you receive updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-sm text-zinc-300">Email Alerts</span>
              <span className="text-xs text-green-500 font-bold">ENABLED</span>
            </div>
            <div className="flex items-center justify-between py-2 pt-4">
              <span className="text-sm text-zinc-300">Project Updates</span>
              <span className="text-xs text-green-500 font-bold">ENABLED</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
