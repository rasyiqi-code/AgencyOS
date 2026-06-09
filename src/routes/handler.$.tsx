import { createFileRoute } from '@tanstack/react-router'
import { HexclaveHandler } from '@hexclave/next'

export const Route = createFileRoute('/handler/$')({
  component: HandlerPage,
})

function HandlerPage() {
  return <HexclaveHandler fullPage />
}
