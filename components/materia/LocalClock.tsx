'use client'
import { useEffect, useState } from 'react'

const formatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  hour: '2-digit',
  minute: '2-digit',
})

/** Hora de Brasília. Renderiza um marcador estável no HTML estático e só
 *  mostra o horário depois da hidratação (sem mismatch). */
export default function LocalClock({ className }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setTime(formatter.format(new Date()))
    update()
    const id = window.setInterval(update, 15_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span className={className}>
      <span className="sr-only">Horário de Brasília: </span>
      BRT <time suppressHydrationWarning>{time ?? '--:--'}</time>
    </span>
  )
}
