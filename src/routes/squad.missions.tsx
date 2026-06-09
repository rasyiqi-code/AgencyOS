import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/squad/missions')({
  component: SquadMissions,
})

function SquadMissions() {
  return <div>Squad Missions</div>
}
