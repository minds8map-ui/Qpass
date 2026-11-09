# Qpass

Digital OP tokens for hospitals. Patients book and pay for a token online, see the token being served and how many people are still waiting ahead of them, and get a reminder 10, 15 or 20 minutes before their turn — so they arrive just in time instead of waiting for hours.

## What works today
- **Landing page** (`/`) with a live "Now serving" board for partner hospitals.
- **Booking** (`/book`): choose hospital, department and doctor, enter patient details, pick a reminder time and pay (UPI, card or net banking — simulated).
- **Live queue tracker** (`/token/:id`): now serving, your token, people ahead, estimated wait, a visual line, reminder settings, browser notifications and a payment receipt.
- **My tokens** (`/tokens`): every token booked on this device with its live status.

The preview uses sample hospitals and a simulated queue that moves one patient every few seconds, so reminders can be seen in action.

## Tech
TanStack Start (React 19, TanStack Router), Vite, Tailwind CSS 4, shadcn/ui, lucide icons, deployed on Netlify.

## Run locally
```bash
pnpm install
netlify dev   # or: pnpm dev
```

## Roadmap
See [PLAN.md](PLAN.md): Netlify Database data model, patient accounts, real payment gateway, hospital staff console to call tokens, server-side reminders (push/SMS/WhatsApp), and a waiting-hall display.
