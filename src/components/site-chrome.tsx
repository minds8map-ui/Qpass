import { Link } from '@tanstack/react-router'
import { Ticket } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 rounded-md font-display text-lg font-bold tracking-tight">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Ticket className="size-4" aria-hidden />
      </span>
      Qpass
    </Link>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
          <Button asChild variant="ghost" size="sm">
            <Link to="/tokens" activeProps={{ className: 'bg-secondary' }}>
              My tokens
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/book">Book a token</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto flex max-w-content flex-col gap-3 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Qpass · Skip the waiting room, not the doctor.</p>
        <p>For emergencies, go directly to casualty or call 108.</p>
      </div>
    </footer>
  )
}
