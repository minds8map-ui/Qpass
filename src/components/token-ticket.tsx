import { Building2, Stethoscope } from 'lucide-react'

import { cn } from '@/lib/utils'

type Props = {
  number: number
  hospital: string
  department: string
  doctor: string
  session: string
  patient?: string
  className?: string
  footer?: React.ReactNode
}

/** The digital OP token, styled like a perforated paper ticket. */
export function TokenTicket({ number, hospital, department, doctor, session, patient, className, footer }: Props) {
  return (
    <div className={cn('overflow-hidden rounded-2xl bg-card shadow-[0_20px_50px_-20px_oklch(0.3_0.08_190/0.35)] ring-1 ring-border', className)}>
      <div className="bg-primary px-6 pt-5 pb-6 text-primary-foreground">
        <div className="flex items-center justify-between text-xs font-semibold tracking-[0.2em] uppercase opacity-80">
          <span>OP Token</span>
          <span>Paid</span>
        </div>
        <div className="mt-2 font-ticket text-7xl leading-none font-bold">
          {String(number).padStart(3, '0')}
        </div>
        {patient ? <p className="mt-2 text-sm opacity-85">{patient}</p> : null}
      </div>
      <div className="ticket-notch border-t-2 border-dashed border-border" />
      <div className="space-y-2 px-6 py-5 text-sm">
        <p className="flex items-start gap-2 font-semibold">
          <Building2 className="mt-0.5 size-4 text-primary" aria-hidden />
          {hospital}
        </p>
        <p className="flex items-start gap-2 text-muted-foreground">
          <Stethoscope className="mt-0.5 size-4 text-primary" aria-hidden />
          <span>
            {doctor} · {department}
            <br />
            {session}
          </span>
        </p>
        {footer}
      </div>
    </div>
  )
}
