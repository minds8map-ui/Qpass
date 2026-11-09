import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowRight, BellRing, CreditCard, MapPin, ShieldCheck, Star, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TokenTicket } from '@/components/token-ticket'
import { hospitals } from '@/lib/fixtures'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <LiveBoard />
      <Cta />
    </main>
  )
}

function Hero() {
  // A small looping demo of the queue counting down on the sample ticket.
  const [ahead, setAhead] = useState(6)
  useEffect(() => {
    const t = setInterval(() => setAhead((a) => (a <= 0 ? 6 : a - 1)), 2200)
    return () => clearInterval(t)
  }, [])
  const soon = ahead <= 2

  return (
    <section className="bg-grid relative overflow-hidden border-b border-border/70">
      <div className="mx-auto grid max-w-content items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.15fr_1fr] md:py-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            <span className="relative flex size-2">
              <span className="pulse-ring absolute inline-flex size-full rounded-full bg-primary" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Live OP queues at partner hospitals
          </p>
          <h1 className="mt-6 text-5xl leading-[1.02] font-extrabold md:text-7xl">
            Your hospital token,
            <br />
            <span className="text-primary">without the waiting room.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Book and pay for your OP token from your phone. See exactly how many patients are
            ahead of you, and we’ll remind you 10–20 minutes before it’s time to walk in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link to="/book">
                Book a token <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
              <Link to="/tokens">Track my token</Link>
            </Button>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 text-sm">
            <div>
              <dt className="text-muted-foreground">Avg. time saved</dt>
              <dd className="font-display text-2xl font-bold">52 min</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Hospitals</dt>
              <dd className="font-display text-2xl font-bold">{hospitals.length}+</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Reminder</dt>
              <dd className="font-display text-2xl font-bold">10–20m</dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-6 -z-10 rotate-3 rounded-3xl bg-accent/40" aria-hidden />
          <TokenTicket
            number={27}
            hospital="Sunrise Multispeciality Hospital"
            department="General Medicine"
            doctor="Dr. Ananya Rao"
            session="Today · Morning session"
            patient="Priya Sharma"
            footer={
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">People ahead</p>
                  <p className="font-ticket text-3xl font-bold" aria-live="polite">
                    {ahead}
                  </p>
                </div>
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Your turn in</p>
                  <p className="font-ticket text-3xl font-bold">~{ahead * 7}m</p>
                </div>
              </div>
            }
          />
          <div
            className={`absolute -bottom-6 -left-4 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-lg transition-all duration-500 motion-reduce:transition-none sm:-left-10 ${
              soon ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
            aria-hidden={!soon}
          >
            <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground">
              <BellRing className="size-4" aria-hidden />
            </span>
            <span>
              <strong className="block">Time to head in</strong>
              <span className="text-muted-foreground">Your turn is in ~{ahead * 7} minutes</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

const steps = [
  {
    icon: CreditCard,
    title: 'Book & pay in a minute',
    body: 'Pick the hospital, department and doctor. Pay the consultation fee by UPI, card or net banking and get your digital token instantly.',
  },
  {
    icon: Users,
    title: 'Watch the queue live',
    body: 'See the token being served right now and exactly how many people are still waiting before you — from home, office or the cafe.',
  },
  {
    icon: BellRing,
    title: 'Get reminded on time',
    body: 'Choose 10, 15 or 20 minutes. We nudge you when it’s time to leave so you walk in just as your number is called.',
  },
]

function HowItWorks() {
  return (
    <section className="mx-auto max-w-content px-4 py-20 sm:px-6">
      <h2 className="max-w-2xl text-4xl font-bold">Three steps. Zero hours on a plastic chair.</h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                <s.icon className="size-5" aria-hidden />
              </span>
              <span className="font-ticket text-sm text-muted-foreground">0{i + 1}</span>
            </div>
            <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
            <p className="mt-2 text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function LiveBoard() {
  const rows = hospitals.flatMap((h) =>
    h.departments.flatMap((d) =>
      d.doctors.map((doc) => ({ h, d, doc, waiting: doc.lastIssued - doc.nowServing })),
    ),
  )
  return (
    <section className="border-y border-border/70 bg-secondary/50">
      <div className="mx-auto max-w-content px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold">Now serving</h2>
            <p className="mt-2 text-muted-foreground">Live OP counters at partner hospitals.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/book">See all doctors</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.slice(0, 6).map(({ h, d, doc, waiting }) => (
            <Link
              key={h.id + doc.id}
              to="/book"
              search={{ hospital: h.id }}
              className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary motion-reduce:transition-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">{d.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Serving</p>
                  <p className="font-ticket text-2xl font-bold text-primary">
                    {String(doc.nowServing).padStart(3, '0')}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden /> {h.name.split(' ').slice(0, 2).join(' ')}, {h.city}
                </span>
                <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold">{waiting} waiting</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function Cta() {
  return (
    <section className="mx-auto max-w-content px-4 pt-20 sm:px-6">
      <div className="grid gap-8 rounded-3xl bg-primary p-8 text-primary-foreground md:grid-cols-[1.4fr_1fr] md:p-12">
        <div>
          <h2 className="text-4xl font-bold">Arrive when the doctor is ready for you.</h2>
          <p className="mt-3 max-w-lg opacity-85">
            Secure payments, a printable digital token and a timely reminder — all in one place.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6 h-12 px-6 text-base">
            <Link to="/book">
              Get my token <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
        <ul className="space-y-3 self-center text-sm">
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4" aria-hidden /> Payment receipts for every token
          </li>
          <li className="flex items-center gap-2">
            <Star className="size-4" aria-hidden /> Verified partner hospitals and doctors
          </li>
          <li className="flex items-center gap-2">
            <BellRing className="size-4" aria-hidden /> Browser notifications before your turn
          </li>
        </ul>
      </div>
    </section>
  )
}
