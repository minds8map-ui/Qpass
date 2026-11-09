/**
 * Stubbed data for the product preview.
 *
 * Everything the UI reads about hospitals, departments, doctors and live
 * queue counters comes from this module. A later milestone replaces these
 * exports with Netlify Database queries — keep the shapes stable.
 */

export type Doctor = {
  id: string
  name: string
  qualification: string
  /** Consultation / token fee in INR */
  fee: number
  /** Average consultation length, used for ETA */
  avgMinutes: number
  /** Token currently in the consultation room */
  nowServing: number
  /** Last token number already issued today */
  lastIssued: number
  /** Max tokens for today's session */
  capacity: number
  session: string
}

export type Department = {
  id: string
  name: string
  blurb: string
  doctors: Doctor[]
}

export type Hospital = {
  id: string
  name: string
  area: string
  city: string
  rating: number
  openHours: string
  accent: string
  departments: Department[]
}

export const PLATFORM_FEE = 10

export const hospitals: Hospital[] = [
  {
    id: 'sunrise-multispeciality',
    name: 'Sunrise Multispeciality Hospital',
    area: 'Banjara Hills',
    city: 'Hyderabad',
    rating: 4.6,
    openHours: 'OPD 8:00 AM – 8:00 PM',
    accent: 'oklch(0.86 0.13 75)',
    departments: [
      {
        id: 'general-medicine',
        name: 'General Medicine',
        blurb: 'Fever, infections, BP, diabetes check-ups',
        doctors: [
          {
            id: 'dr-ananya-rao',
            name: 'Dr. Ananya Rao',
            qualification: 'MBBS, MD (Internal Medicine)',
            fee: 400,
            avgMinutes: 7,
            nowServing: 18,
            lastIssued: 26,
            capacity: 60,
            session: 'Morning · 9:00 AM – 1:00 PM',
          },
          {
            id: 'dr-farhan-qureshi',
            name: 'Dr. Farhan Qureshi',
            qualification: 'MBBS, DNB (Family Medicine)',
            fee: 350,
            avgMinutes: 6,
            nowServing: 9,
            lastIssued: 14,
            capacity: 50,
            session: 'Morning · 10:00 AM – 2:00 PM',
          },
        ],
      },
      {
        id: 'pediatrics',
        name: 'Pediatrics',
        blurb: 'Child health, vaccinations, growth reviews',
        doctors: [
          {
            id: 'dr-meera-iyer',
            name: 'Dr. Meera Iyer',
            qualification: 'MBBS, MD (Pediatrics)',
            fee: 500,
            avgMinutes: 9,
            nowServing: 6,
            lastIssued: 13,
            capacity: 35,
            session: 'Morning · 9:30 AM – 1:30 PM',
          },
        ],
      },
      {
        id: 'orthopedics',
        name: 'Orthopedics',
        blurb: 'Joint pain, fractures, back & spine',
        doctors: [
          {
            id: 'dr-vikram-shetty',
            name: 'Dr. Vikram Shetty',
            qualification: 'MBBS, MS (Ortho)',
            fee: 600,
            avgMinutes: 10,
            nowServing: 11,
            lastIssued: 17,
            capacity: 30,
            session: 'Evening · 4:00 PM – 8:00 PM',
          },
        ],
      },
    ],
  },
  {
    id: 'city-care-general',
    name: 'City Care General Hospital',
    area: 'Anna Nagar',
    city: 'Chennai',
    rating: 4.4,
    openHours: 'OPD 7:30 AM – 9:00 PM',
    accent: 'oklch(0.8 0.1 160)',
    departments: [
      {
        id: 'cardiology',
        name: 'Cardiology',
        blurb: 'Chest pain, ECG review, heart follow-ups',
        doctors: [
          {
            id: 'dr-sanjay-menon',
            name: 'Dr. Sanjay Menon',
            qualification: 'MBBS, MD, DM (Cardiology)',
            fee: 800,
            avgMinutes: 12,
            nowServing: 4,
            lastIssued: 9,
            capacity: 25,
            session: 'Morning · 10:00 AM – 2:00 PM',
          },
        ],
      },
      {
        id: 'dermatology',
        name: 'Dermatology',
        blurb: 'Skin, hair and allergy consultations',
        doctors: [
          {
            id: 'dr-kavya-nair',
            name: 'Dr. Kavya Nair',
            qualification: 'MBBS, MD (Dermatology)',
            fee: 550,
            avgMinutes: 8,
            nowServing: 21,
            lastIssued: 29,
            capacity: 45,
            session: 'Evening · 5:00 PM – 9:00 PM',
          },
        ],
      },
      {
        id: 'general-medicine',
        name: 'General Medicine',
        blurb: 'Walk-in OP for common illnesses',
        doctors: [
          {
            id: 'dr-arjun-pillai',
            name: 'Dr. Arjun Pillai',
            qualification: 'MBBS, MD',
            fee: 300,
            avgMinutes: 5,
            nowServing: 32,
            lastIssued: 41,
            capacity: 80,
            session: 'All day · 8:00 AM – 6:00 PM',
          },
        ],
      },
    ],
  },
  {
    id: 'lotus-womens-children',
    name: "Lotus Women's & Children's Clinic",
    area: 'Koregaon Park',
    city: 'Pune',
    rating: 4.8,
    openHours: 'OPD 9:00 AM – 7:00 PM',
    accent: 'oklch(0.82 0.09 20)',
    departments: [
      {
        id: 'gynecology',
        name: 'Obstetrics & Gynecology',
        blurb: 'Antenatal visits, women’s health',
        doctors: [
          {
            id: 'dr-priya-deshmukh',
            name: 'Dr. Priya Deshmukh',
            qualification: 'MBBS, MS (OBG)',
            fee: 700,
            avgMinutes: 11,
            nowServing: 7,
            lastIssued: 12,
            capacity: 28,
            session: 'Morning · 9:00 AM – 1:00 PM',
          },
        ],
      },
      {
        id: 'pediatrics',
        name: 'Pediatrics',
        blurb: 'Newborn care and vaccinations',
        doctors: [
          {
            id: 'dr-rohan-kulkarni',
            name: 'Dr. Rohan Kulkarni',
            qualification: 'MBBS, DCH',
            fee: 450,
            avgMinutes: 8,
            nowServing: 15,
            lastIssued: 22,
            capacity: 40,
            session: 'Evening · 3:00 PM – 7:00 PM',
          },
        ],
      },
    ],
  },
]

export function findHospital(id: string) {
  return hospitals.find((h) => h.id === id)
}

export function findDoctor(hospitalId: string, departmentId: string, doctorId: string) {
  const hospital = findHospital(hospitalId)
  const department = hospital?.departments.find((d) => d.id === departmentId)
  const doctor = department?.doctors.find((d) => d.id === doctorId)
  if (!hospital || !department || !doctor) return undefined
  return { hospital, department, doctor }
}
