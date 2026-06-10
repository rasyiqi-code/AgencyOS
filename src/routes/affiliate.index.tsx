import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/affiliate/')({
  beforeLoad: () => {
    throw redirect({ to: '/affiliate/dashboard' })
  },
})
