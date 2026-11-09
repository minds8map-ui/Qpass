# Qpass roadmap

Qpass lets patients book and pay for a hospital OP token online, watch how many people are ahead of them in real time, and get reminded 10–20 minutes before their turn. Work is split into small, self-contained milestones.

## 1. Product surface ✅
Landing page, booking flow (hospital → department → doctor → patient details → payment), live queue tracker with reminders, and "My tokens" list. Data comes from `src/lib/fixtures.ts`; tokens live in localStorage and the queue is simulated in `src/lib/tokens.ts`.

## 2. Data model (Netlify Database)
- Drizzle schema in `db/schema.ts`: `hospitals`, `departments`, `doctors`, `sessions` (per-day OP session with capacity, avg minutes), `tokens`, `payments`.
- Seed with the fixture data, then replace `fixtures.ts` reads with route loaders / server functions.
- Token numbers issued inside a transaction per session so two patients can never get the same number.

## 3. Patient accounts (Netlify Identity)
- Sign up / log in by email or Google; tokens attach to the user instead of the device.
- "My tokens" reads from the database; family members can be saved as patient profiles.

## 4. Real payments
- Integrate an Indian payment gateway (Razorpay or Cashfree) for UPI, cards and net banking.
- Server function creates the order; a webhook function verifies the signature and only then issues the token.
- Refunds for cancelled tokens; downloadable PDF receipt.

## 5. Hospital staff console
- Role-protected screen for reception / doctor assistants: "Call next", skip, recall, pause session.
- Calling the next token updates `now_serving` for the session — this replaces the simulated queue.
- Live wait estimates computed from actual consultation durations.

## 6. Live updates & reminders
- Tracker polls (or streams) the session's `now_serving` instead of simulating it.
- Scheduled function checks waiting tokens every minute and sends reminders when ETA ≤ the patient's chosen 10/15/20 minutes.
- Channels: Web Push (service worker), SMS and WhatsApp via a provider; "your turn" alert as well.

## 7. Polish & operations
- Waiting-hall TV display ("Now serving" board) per department.
- Hospital onboarding, analytics on wait times, multilingual UI (Hindi, Telugu, Tamil, Marathi).
