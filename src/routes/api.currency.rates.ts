import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/currency/rates')({
  server: {
    handlers: {
      GET: async () => {
        // Memuat currencyService secara dinamis agar aman dari client-side bundling
        const { currencyService } = await import('@/lib/server/currency-service')
        const rates = await currencyService.getRates()

        const fallback = {
          base: "USD",
          rates: { IDR: 16000 },
          lastUpdated: 0
        }

        if (!rates) {
          return json(fallback, {
            headers: { 
              "Cache-Control": "public, max-age=3600",
              "Content-Type": "application/json" 
            }
          })
        }

        return json(rates, {
          headers: { 
            "Cache-Control": "public, max-age=3600",
            "Content-Type": "application/json" 
          }
        })
      }
    }
  }
})
