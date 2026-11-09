/**
 * Token storage + live-queue maths for the product preview.
 *
 * Tokens are kept in the browser's localStorage and the queue is simulated
 * from the moment of booking. A later milestone swaps this module for
 * server functions backed by Netlify Database and real hospital updates.
 */
import { findDoctor, PLATFORM_FEE } from './fixtures'

export type PaymentMethod = 'upi' | 'card' | 'netbanking'

export type Token = {
  id: string
  number: number
  hospitalId: string
  departmentId: string
  doctorId: string
  patientName: string
  patientAge: number
  phone: string
  amount: number
  paymentMethod: PaymentMethod
  paymentRef: string
  createdAt: number
  /** Token being served when this token was issued */
  servingAtBooking: number
  /** Minutes before the turn to send a reminder */
  reminderMinutes: number
  reminderSent?: boolean
}

const STORAGE_KEY = 'carequeue.tokens.v1'

/**
 * In the preview, one patient is seen every DEMO_SECONDS_PER_PATIENT seconds
 * so the queue visibly moves. ETAs still use each doctor's real average.
 */
export const DEMO_SECONDS_PER_PATIENT = 12

export function loadTokens(): Token[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Token[]) : []
  } catch {
    return []
  }
}

function saveTokens(tokens: Token[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  window.dispatchEvent(new Event('carequeue:tokens'))
}

export function getToken(id: string) {
  return loadTokens().find((t) => t.id === id)
}

export function updateToken(id: string, patch: Partial<Token>) {
  saveTokens(loadTokens().map((t) => (t.id === id ? { ...t, ...patch } : t)))
}

export function removeToken(id: string) {
  saveTokens(loadTokens().filter((t) => t.id !== id))
}

export function issueToken(input: {
  hospitalId: string
  departmentId: string
  doctorId: string
  patientName: string
  patientAge: number
  phone: string
  paymentMethod: PaymentMethod
  reminderMinutes: number
}): Token {
  const match = findDoctor(input.hospitalId, input.departmentId, input.doctorId)
  if (!match) throw new Error('Doctor not found')
  const { doctor } = match
  const existing = loadTokens().filter(
    (t) => t.doctorId === doctor.id && t.hospitalId === input.hospitalId,
  )
  const highest = Math.max(doctor.lastIssued, ...existing.map((t) => t.number))
  const token: Token = {
    ...input,
    id: crypto.randomUUID().slice(0, 8).toUpperCase(),
    number: highest + 1,
    amount: doctor.fee + PLATFORM_FEE,
    paymentRef: `CQ${Date.now().toString().slice(-9)}`,
    createdAt: Date.now(),
    servingAtBooking: doctor.nowServing,
  }
  saveTokens([token, ...loadTokens()])
  return token
}

export type QueueStatus = {
  nowServing: number
  peopleAhead: number
  etaMinutes: number
  progress: number
  state: 'waiting' | 'soon' | 'your-turn' | 'done'
}

export function queueStatus(token: Token, now = Date.now()): QueueStatus {
  const match = findDoctor(token.hospitalId, token.departmentId, token.doctorId)
  const avg = match?.doctor.avgMinutes ?? 8
  const elapsed = Math.max(0, now - token.createdAt) / 1000
  const advanced = Math.floor(elapsed / DEMO_SECONDS_PER_PATIENT)
  const nowServing = Math.min(token.servingAtBooking + advanced, token.number + 1)
  const peopleAhead = Math.max(0, token.number - nowServing)
  const etaMinutes = peopleAhead * avg
  const total = Math.max(1, token.number - token.servingAtBooking)
  const progress = Math.min(100, ((total - peopleAhead) / total) * 100)
  let state: QueueStatus['state'] = 'waiting'
  if (nowServing > token.number) state = 'done'
  else if (nowServing === token.number) state = 'your-turn'
  else if (etaMinutes <= token.reminderMinutes) state = 'soon'
  return { nowServing: Math.min(nowServing, token.number), peopleAhead, etaMinutes, progress, state }
}

export const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
