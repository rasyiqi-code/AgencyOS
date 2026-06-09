import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/squad/onboarding')({
  component: SquadOnboarding,
})

function SquadOnboarding() {
  return <div>Squad Onboarding</div>
}
