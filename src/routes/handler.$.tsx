import { createFileRoute } from '@tanstack/react-router'
import { HexclaveHandler } from '@hexclave/tanstack-start'

export const Route = createFileRoute('/handler/$')({
  component: HandlerPage,
})

function HandlerPage() {
  return <HexclaveHandler fullPage />
}
