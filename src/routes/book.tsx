import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  Building2,
  Check,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  Smartphone,
  Star,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { hospitals, PLATFORM_FEE } from '@/lib/fixtures'
import { inr, issueToken, type PaymentMethod } from '@/lib/tokens'
import { cn } from '@/lib/utils'

type Search = { hospital?: string }

export const Route = createFileRoute('/book')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    hospital: typeof s.hospital === 'string' ? s.hospital : undefined,
  }),
  head: () => ({ meta: [{ title: 'Book a token · Qpass' }] }),
  component: BookPage,
})

const STEPS = ['Doctor', 'Patient', 'Payment'] as const
const REMINDER_OPTIONS = [10, 15, 20]

function BookPage() {
  const search = Route.useSearch()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [hospitalId, setHospitalId] = useState(
    hospitals.find((h) => h.id === search.hospital)?.id ?? hospitals[0].id,
  )
  const hospital = hospitals.find((h) => h.id === hospitalId) ?? hospitals[0]
  const [departmentId, setDepartmentId] = useState(hospital.departments[0].id)
  const department = hospital.departments.find((d) => d.id === departmentId) ?? hospital.departments[0]
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const doctor = department.doctors.find((d) => d.id === doctorId)

  const [patientName, setPatientName] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [phone, setPhone] = useState('')
  const [reminderMinutes, setReminderMinutes] = useState(15)

  const [method, setMethod] = useState<PaymentMethod>('upi')
  const [upiId, setUpiId] = useState('')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' })
  const [bank, setBank] = useState('SBI')
  const [paying, setPaying] = useState(false)

  const patientValid =
    patientName.trim().length >= 2 &&
    Number(patientAge) > 0 &&
    Number(patientAge) < 120 &&
    /^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10))

  const paymentValid = useMemo(() => {
    if (method === 'upi') return /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())
    if (method === 'card')
      return (
        card.number.replace(/\s/g, '').length >= 15 &&
        /^\d{2}\/\d{2}$/.test(card.expiry) &&
        /^\d{3,4}$/.test(card.cvv)
      )
    return Boolean(bank)
  }, [method, upiId, card, bank])

  function selectHospital(id: string) {
    const h = hospitals.find((x) => x.id === id)!
    setHospitalId(id)
    setDepartmentId(h.departments[0].id)
    setDoctorId(null)
  }

  async function pay() {
    if (!doctor || !paymentValid) return
    setPaying(true)
    // Simulated payment gateway round-trip for the preview.
    await new Promise((r) => setTimeout(r, 1600))
    try {
      const token = issueToken({
        hospitalId,
        departmentId,
        doctorId: doctor.id,
        patientName: patientName.trim(),
        patientAge: Number(patientAge),
        phone: phone.replace(/\D/g, '').slice(-10),
        paymentMethod: method,
        reminderMinutes,
      })
      toast.success(`Payment successful — token #${token.number} issued`)
      navigate({ to: '/token/$tokenId', params: { tokenId: token.id } })
    } catch {
      toast.error('Payment could not be completed. Please try again.')
      setPaying(false)
    }
  }

  return (
    <main className="mx-auto max-w-content px-4 py-10 sm:px-6 md:py-14">
      <h1 className="text-4xl font-extrabold md:text-5xl">Book your OP token</h1>
      <p className="mt-2 text-muted-foreground">Pay online, skip the counter, and track your turn live.</p>

      <ol className="mt-8 flex items-center gap-2 text-sm" aria-label="Booking progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'grid size-7 place-items-center rounded-full border text-xs font-bold',
                i < step && 'border-primary bg-primary text-primary-foreground',
                i === step && 'border-primary text-primary',
                i > step && 'border-border text-muted-foreground',
              )}
              aria-current={i === step ? 'step' : undefined}
            >
              {i < step ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <span className={cn('font-semibold', i !== step && 'text-muted-foreground')}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-border sm:w-14" aria-hidden />}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="min-w-0">
          {step === 0 && (
            <div className="space-y-8">
              <fieldset>
                <legend className="mb-3 font-display text-lg font-bold">Hospital</legend>
                <div className="grid gap-3 md:grid-cols-3">
                  {hospitals.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => selectHospital(h.id)}
                      aria-pressed={h.id === hospitalId}
                      className={cn(
                        'rounded-2xl border bg-card p-4 text-left transition-colors motion-reduce:transition-none',
                        h.id === hospitalId ? 'border-primary ring-2 ring-primary/25' : 'border-border hover:border-primary/50',
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <Building2 className="size-5 text-primary" aria-hidden />
                        <span className="flex items-center gap-1 text-xs font-semibold">
                          <Star className="size-3 fill-accent text-accent-foreground" aria-hidden /> {h.rating}
                        </span>
                      </span>
                      <span className="mt-3 block leading-snug font-semibold">{h.name}</span>
                      <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" aria-hidden /> {h.area}, {h.city}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 font-display text-lg font-bold">Department</legend>
                <div className="flex flex-wrap gap-2">
                  {hospital.departments.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setDepartmentId(d.id)
                        setDoctorId(null)
                      }}
                      aria-pressed={d.id === departmentId}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-semibold transition-colors motion-reduce:transition-none',
                        d.id === departmentId
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card hover:border-primary/50',
                      )}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{department.blurb}</p>
              </fieldset>

              <fieldset>
                <legend className="mb-3 font-display text-lg font-bold">Doctor</legend>
                <div className="grid gap-3">
                  {department.doctors.map((doc) => {
                    const waiting = doc.lastIssued - doc.nowServing
                    const full = doc.lastIssued >= doc.capacity
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        disabled={full}
                        onClick={() => setDoctorId(doc.id)}
                        aria-pressed={doc.id === doctorId}
                        className={cn(
                          'grid gap-4 rounded-2xl border bg-card p-5 text-left transition-colors motion-reduce:transition-none disabled:opacity-50 sm:grid-cols-[1fr_auto]',
                          doc.id === doctorId ? 'border-primary ring-2 ring-primary/25' : 'border-border hover:border-primary/50',
                        )}
                      >
                        <span>
                          <span className="block text-lg font-bold">{doc.name}</span>
                          <span className="block text-sm text-muted-foreground">{doc.qualification}</span>
                          <span className="mt-2 block text-sm">{doc.session}</span>
                        </span>
                        <span className="flex items-center gap-5 sm:text-right">
                          <span>
                            <span className="block text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Serving</span>
                            <span className="font-ticket text-xl font-bold text-primary">{String(doc.nowServing).padStart(3, '0')}</span>
                          </span>
                          <span>
                            <span className="block text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Waiting</span>
                            <span className="flex items-center gap-1 font-ticket text-xl font-bold sm:justify-end">
                              <Users className="size-4" aria-hidden /> {waiting}
                            </span>
                          </span>
                          <span>
                            <span className="block text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Fee</span>
                            <span className="text-xl font-bold">{inr(doc.fee)}</span>
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="flex justify-end">
                <Button size="lg" disabled={!doctor} onClick={() => setStep(1)}>
                  Continue <ArrowRight aria-hidden />
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <form
              className="space-y-6 rounded-2xl border border-border bg-card p-6"
              onSubmit={(e) => {
                e.preventDefault()
                if (patientValid) setStep(2)
              }}
            >
              <h2 className="text-2xl font-bold">Patient details</h2>
              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <div className="space-y-2">
                  <Label htmlFor="name">Patient full name</Label>
                  <Input id="name" autoComplete="name" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g. Priya Sharma" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" inputMode="numeric" value={patientAge} onChange={(e) => setPatientAge(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="32" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile number</Label>
                <div className="flex">
                  <span className="grid place-items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">+91</span>
                  <Input id="phone" type="tel" autoComplete="tel-national" className="rounded-l-none" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, '').slice(0, 11))} placeholder="98765 43210" required />
                </div>
                <p className="text-xs text-muted-foreground">Your token and reminder are linked to this number.</p>
              </div>

              <fieldset>
                <legend className="mb-1 flex items-center gap-2 font-semibold">
                  <BellRing className="size-4 text-primary" aria-hidden /> Remind me before my turn
                </legend>
                <p className="mb-3 text-sm text-muted-foreground">We’ll notify you when your estimated turn is this close.</p>
                <div className="grid grid-cols-3 gap-2">
                  {REMINDER_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setReminderMinutes(m)}
                      aria-pressed={m === reminderMinutes}
                      className={cn(
                        'rounded-xl border py-3 text-center font-semibold transition-colors motion-reduce:transition-none',
                        m === reminderMinutes ? 'border-primary bg-secondary text-primary' : 'border-border hover:border-primary/50',
                      )}
                    >
                      <span className="font-ticket text-2xl">{m}</span>
                      <span className="block text-xs text-muted-foreground">minutes</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="flex justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                  <ArrowLeft aria-hidden /> Back
                </Button>
                <Button type="submit" size="lg" disabled={!patientValid}>
                  Continue to payment <ArrowRight aria-hidden />
                </Button>
              </div>
            </form>
          )}

          {step === 2 && doctor && (
            <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-2xl font-bold">Payment</h2>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment method">
                {(
                  [
                    ['upi', 'UPI', Smartphone],
                    ['card', 'Card', CreditCard],
                    ['netbanking', 'Net banking', Landmark],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={method === id}
                    onClick={() => setMethod(id)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border py-3 text-sm font-semibold transition-colors motion-reduce:transition-none',
                      method === id ? 'border-primary bg-secondary text-primary' : 'border-border hover:border-primary/50',
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>

              {method === 'upi' && (
                <div className="space-y-2">
                  <Label htmlFor="upi">UPI ID</Label>
                  <Input id="upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@okbank" />
                  <p className="text-xs text-muted-foreground">You’ll approve the request in your UPI app.</p>
                </div>
              )}
              {method === 'card' && (
                <div className="grid gap-4 sm:grid-cols-[1fr_110px_90px]">
                  <div className="space-y-2">
                    <Label htmlFor="card">Card number</Label>
                    <Input
                      id="card"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      value={card.number}
                      onChange={(e) =>
                        setCard({ ...card, number: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ') })
                      }
                      placeholder="4111 1111 1111 1111"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exp">Expiry</Label>
                    <Input
                      id="exp"
                      autoComplete="cc-exp"
                      value={card.expiry}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setCard({ ...card, expiry: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v })
                      }}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" type="password" inputMode="numeric" autoComplete="cc-csc" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="•••" />
                  </div>
                </div>
              )}
              {method === 'netbanking' && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {['SBI', 'HDFC', 'ICICI', 'Axis'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      aria-pressed={bank === b}
                      onClick={() => setBank(b)}
                      className={cn('rounded-xl border py-3 font-semibold', bank === b ? 'border-primary bg-secondary text-primary' : 'border-border')}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
                <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={paying}>
                  <ArrowLeft aria-hidden /> Back
                </Button>
                <Button size="lg" onClick={pay} disabled={!paymentValid || paying}>
                  {paying ? (
                    <>
                      <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden /> Processing…
                    </>
                  ) : (
                    <>
                      <Lock aria-hidden /> Pay {inr(doctor.fee + PLATFORM_FEE)}
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Preview mode: no money is charged. Any valid-looking UPI ID or card works.
              </p>
            </div>
          )}
        </section>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold">Summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Hospital" value={hospital.name} />
            <Row label="Department" value={department.name} />
            <Row label="Doctor" value={doctor?.name ?? '—'} />
            {doctor && <Row label="Your token" value={`#${String(doctor.lastIssued + 1).padStart(3, '0')} (est.)`} />}
            {doctor && <Row label="Patients ahead" value={String(doctor.lastIssued - doctor.nowServing + 1)} />}
            {patientName && <Row label="Patient" value={patientName} />}
            <Row label="Reminder" value={`${reminderMinutes} min before`} />
          </dl>
          {doctor && (
            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <Row label="Consultation fee" value={inr(doctor.fee)} />
              <Row label="Booking fee" value={inr(PLATFORM_FEE)} />
              <div className="flex justify-between pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd>{inr(doctor.fee + PLATFORM_FEE)}</dd>
              </div>
            </dl>
          )}
        </aside>
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  )
}
