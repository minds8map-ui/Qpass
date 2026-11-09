import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, BellOff, BellRing, CheckCircle2, Clock, Footprints, Receipt, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { TokenTicket } from '@/components/token-ticket'
import { findDoctor } from '@/lib/fixtures'
import { getToken, inr, queueStatus, updateToken, type QueueStatus, type Token } from '@/lib/tokens'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/token/$tokenId')({
  head: () => ({ meta: [{ title: 'Live queue · Qpass' }] }),
  component: TrackerPage,
})

const REMINDER_OPTIONS = [10, 15, 20]

function TrackerPage() {
  const { tokenId } = Route.useParams()
  const [token, setToken] = useState<Token | null | undefined>(undefined)
  const [now, setNow] = useState(() => Date.now())
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')

  useEffect(() => {
    const load = () => setToken(getToken(tokenId) ?? null)
    load()
    window.addEventListener('carequeue:tokens', load)
    setPermission('Notification' in window ? Notification.permission : 'unsupported')
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => {
      clearInterval(t)
      window.removeEventListener('carequeue:tokens', load)
    }
  }, [tokenId])

  const status = token ? queueStatus(token, now) : null
  const fired = useRef(false)

  // Fire the reminder once when the ETA drops inside the chosen window.
  useEffect(() => {
    if (!token || !status || token.reminderSent || fired.current) return
    if (status.state === 'waiting' || status.state === 'done') return
    fired.current = true
    updateToken(token.id, { reminderSent: true })
    const msg = `Token #${token.number}: about ${status.etaMinutes} min to your turn — time to head to the hospital.`
    toast('Time to head in', { description: msg, duration: 15000, icon: <BellRing className="size-4" /> })
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Qpass reminder', { body: msg })
    }
    navigator.vibrate?.([200, 100, 200])
  }, [token, status])

  async function enableNotifications() {
    if (!('Notification' in window)) return
    const p = await Notification.requestPermission()
    setPermission(p)
    if (p === 'granted') toast.success('Browser notifications enabled')
  }

  if (token === undefined) {
    return (
      <main className="mx-auto grid max-w-content gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </main>
    )
  }

  const match = token && findDoctor(token.hospitalId, token.departmentId, token.doctorId)
  if (!token || !match || !status) {
    return (
      <main className="mx-auto max-w-reading px-4 py-24 text-center sm:px-6">
        <h1 className="text-4xl font-bold">Token not found</h1>
        <p className="mt-3 text-muted-foreground">
          This token isn’t saved on this device. Check “My tokens” or book a new one.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/tokens">My tokens</Link>
          </Button>
          <Button asChild>
            <Link to="/book">Book a token</Link>
          </Button>
        </div>
      </main>
    )
  }

  const { hospital, department, doctor } = match
  const queue = Array.from({ length: Math.min(12, token.number - status.nowServing + 1) }, (_, i) => status.nowServing + i)

  return (
    <main className="mx-auto max-w-content px-4 py-10 sm:px-6">
      <Link to="/tokens" className="inline-flex items-center gap-1 rounded text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> My tokens
      </Link>

      <StateBanner state={status.state} etaMinutes={status.etaMinutes} reminder={token.reminderMinutes} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h1 className="sr-only">Live queue for token {token.number}</h1>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="Now serving" value={String(status.nowServing).padStart(3, '0')} accent />
              <Stat label="Your token" value={String(token.number).padStart(3, '0')} />
              <Stat label="People ahead" value={String(status.peopleAhead)} icon={<Users className="size-4" aria-hidden />} live />
              <Stat label="Est. wait" value={status.state === 'done' ? '—' : `${status.etaMinutes}m`} icon={<Clock className="size-4" aria-hidden />} />
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Queue progress</span>
                <span className="font-semibold">{Math.round(status.progress)}%</span>
              </div>
              <Progress value={status.progress} className="h-3" />
            </div>

            {status.state !== 'done' && (
              <div className="mt-6">
                <p className="mb-3 text-sm text-muted-foreground">Line to the consultation room</p>
                <ol className="flex flex-wrap items-center gap-2" aria-label="Tokens in line">
                  {queue.map((n) => (
                    <li
                      key={n}
                      className={cn(
                        'grid h-11 min-w-11 place-items-center rounded-lg border px-2 font-ticket text-sm font-bold transition-colors motion-reduce:transition-none',
                        n === status.nowServing && 'border-primary bg-primary text-primary-foreground',
                        n === token.number && n !== status.nowServing && 'border-accent bg-accent text-accent-foreground ring-2 ring-accent/50',
                        n !== status.nowServing && n !== token.number && 'border-border bg-muted text-muted-foreground',
                      )}
                    >
                      {n === token.number ? 'You' : String(n).padStart(3, '0')}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <BellRing className="size-5 text-primary" aria-hidden /> Reminder
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {token.reminderSent
                    ? 'Reminder sent. Make your way to the OP waiting area.'
                    : `We’ll alert you when your turn is about ${token.reminderMinutes} minutes away.`}
                </p>
              </div>
              {permission === 'default' && (
                <Button variant="outline" size="sm" onClick={enableNotifications}>
                  <BellRing aria-hidden /> Enable phone alerts
                </Button>
              )}
              {permission === 'denied' && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BellOff className="size-3.5" aria-hidden /> Notifications blocked — in-app alerts only
                </span>
              )}
              {permission === 'granted' && (
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">Alerts on</span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Reminder time">
              {REMINDER_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={token.reminderMinutes === m}
                  disabled={token.reminderSent}
                  onClick={() => updateToken(token.id, { reminderMinutes: m })}
                  className={cn(
                    'rounded-xl border py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 motion-reduce:transition-none',
                    token.reminderMinutes === m ? 'border-primary bg-secondary text-primary' : 'border-border hover:border-primary/50',
                  )}
                >
                  {m} min before
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Preview mode: the queue is simulated and moves one patient every few seconds so you can see reminders in
            action. Wait estimates use the doctor’s average of {doctor.avgMinutes} min per patient.
          </p>
        </section>

        <aside className="space-y-6">
          <TokenTicket
            number={token.number}
            hospital={hospital.name}
            department={department.name}
            doctor={doctor.name}
            session={doctor.session}
            patient={`${token.patientName}, ${token.patientAge}`}
          />
          <div className="rounded-2xl border border-border bg-card p-6 text-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Receipt className="size-4 text-primary" aria-hidden /> Payment receipt
            </h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between"><dt className="text-muted-foreground">Amount paid</dt><dd className="font-semibold">{inr(token.amount)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Method</dt><dd className="font-semibold uppercase">{token.paymentMethod === 'netbanking' ? 'Net banking' : token.paymentMethod}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Reference</dt><dd className="font-ticket">{token.paymentRef}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Booking ID</dt><dd className="font-ticket">{token.id}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Issued</dt><dd>{new Date(token.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </main>
  )
}

function Stat({ label, value, icon, accent, live }: { label: string; value: string; icon?: React.ReactNode; accent?: boolean; live?: boolean }) {
  return (
    <div className={cn('rounded-xl p-4', accent ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
      <p className={cn('flex items-center gap-1 text-xs font-semibold', accent ? 'opacity-80' : 'text-muted-foreground')}>
        {icon} {label}
      </p>
      <p className="mt-1 font-ticket text-4xl font-bold" aria-live={live ? 'polite' : undefined}>
        {value}
      </p>
    </div>
  )
}

function StateBanner({ state, etaMinutes, reminder }: { state: QueueStatus['state']; etaMinutes: number; reminder: number }) {
  const config = {
    waiting: {
      icon: Clock,
      title: 'Relax — you’re in the queue',
      body: `No need to be at the hospital yet. We’ll remind you ${reminder} minutes before your turn.`,
      cls: 'bg-secondary text-secondary-foreground',
    },
    soon: {
      icon: Footprints,
      title: 'Time to head to the hospital',
      body: `Your turn is about ${etaMinutes} minutes away. Please reach the OP waiting area.`,
      cls: 'bg-accent text-accent-foreground',
    },
    'your-turn': {
      icon: BellRing,
      title: 'It’s your turn!',
      body: 'Please proceed to the consultation room now.',
      cls: 'bg-primary text-primary-foreground',
    },
    done: {
      icon: CheckCircle2,
      title: 'Consultation complete',
      body: 'Your token has been served. Get well soon!',
      cls: 'bg-muted text-foreground',
    },
  }[state]
  const Icon = config.icon
  return (
    <div className={cn('mt-4 flex items-start gap-4 rounded-2xl p-5', config.cls)} role="status">
      <Icon className="mt-0.5 size-6 shrink-0" aria-hidden />
      <div>
        <p className="font-display text-xl font-bold">{config.title}</p>
        <p className="opacity-85">{config.body}</p>
      </div>
    </div>
  )
}
