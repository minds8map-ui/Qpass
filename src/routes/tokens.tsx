import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowRight, Ticket, Trash2, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { findDoctor } from '@/lib/fixtures'
import { loadTokens, queueStatus, removeToken, type Token } from '@/lib/tokens'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/tokens')({
  head: () => ({ meta: [{ title: 'My tokens · Qpass' }] }),
  component: TokensPage,
})

const STATE_LABEL = {
  waiting: { text: 'In queue', cls: 'bg-secondary text-primary' },
  soon: { text: 'Head in now', cls: 'bg-accent text-accent-foreground' },
  'your-turn': { text: 'Your turn', cls: 'bg-primary text-primary-foreground' },
  done: { text: 'Completed', cls: 'bg-muted text-muted-foreground' },
} as const

function TokensPage() {
  const [tokens, setTokens] = useState<Token[] | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const load = () => setTokens(loadTokens())
    load()
    window.addEventListener('carequeue:tokens', load)
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => {
      clearInterval(t)
      window.removeEventListener('carequeue:tokens', load)
    }
  }, [])

  return (
    <main className="mx-auto max-w-content px-4 py-10 sm:px-6 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold md:text-5xl">My tokens</h1>
          <p className="mt-2 text-muted-foreground">Tap a token to see the live queue.</p>
        </div>
        <Button asChild>
          <Link to="/book">
            New token <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>

      {tokens === null ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      ) : tokens.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
            <Ticket className="size-6" aria-hidden />
          </span>
          <h2 className="mt-4 text-2xl font-bold">No tokens yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
            Book your first OP token and you’ll be able to track your place in line from here.
          </p>
          <Button asChild className="mt-6">
            <Link to="/book">Book a token</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {tokens.map((t) => {
            const match = findDoctor(t.hospitalId, t.departmentId, t.doctorId)
            const s = queueStatus(t, now)
            const label = STATE_LABEL[s.state]
            return (
              <li key={t.id} className="relative flex overflow-hidden rounded-2xl border border-border bg-card">
                <div className="grid w-28 shrink-0 place-items-center bg-primary text-primary-foreground">
                  <div className="text-center">
                    <p className="text-[10px] font-semibold tracking-widest uppercase opacity-80">Token</p>
                    <p className="font-ticket text-4xl font-bold">{String(t.number).padStart(3, '0')}</p>
                  </div>
                </div>
                <div className="min-w-0 flex-1 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to="/token/$tokenId"
                      params={{ tokenId: t.id }}
                      className="rounded font-bold after:absolute after:inset-0 hover:text-primary"
                    >
                      {match?.doctor.name ?? 'Doctor'}
                    </Link>
                    <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold', label.cls)}>{label.text}</span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {match?.department.name} · {match?.hospital.name}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-4 text-primary" aria-hidden />
                      <strong className="font-ticket">{s.peopleAhead}</strong> ahead · ~{s.etaMinutes} min
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="relative z-10"
                      aria-label={`Remove token ${t.number}`}
                      onClick={() => removeToken(t.id)}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
