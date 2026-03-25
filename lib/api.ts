import { BookingData, SlotsResponse, BookingConfirmation, DEFAULT_THEME } from './types'

const BASE_URL = 'https://tikej.app.n8n.cloud/webhook/booking'

export async function initBooking(slug: string): Promise<BookingData> {
  const response = await fetch(`${BASE_URL}?action=init&companySlug=${slug}`)

  if (!response.ok) {
    throw new Error(`Failed to initialize booking: ${response.statusText}`)
  }

  const data = await response.json()

  // Apply default theme if not provided
  if (!data.theme) {
    data.theme = DEFAULT_THEME
  } else {
    data.theme = { ...DEFAULT_THEME, ...data.theme }
  }

  return data as BookingData
}

export async function getAvailableSlots(params: {
  companySlug: string
  date: string
  serviceId: string
  employeeId: string | null
  anyPerson: boolean
  eligibleEmployeeIds?: string[]
}): Promise<SlotsResponse> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'slots',
      companySlug: params.companySlug,
      date: params.date,
      serviceId: params.serviceId,
      employeeId: params.employeeId,
      any_person: params.anyPerson,
      ...(params.anyPerson && params.eligibleEmployeeIds ? { employeeIds: params.eligibleEmployeeIds } : {}),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch available slots: ${response.statusText}`)
  }

  const data = await response.json()

  // Backend returns array of { date, slots } objects
  // Extract slots from the first matching date or return empty array
  if (Array.isArray(data) && data.length > 0) {
    const dateSlots = data.find((item: { date: string; slots: string[] }) => item.date === params.date)
    return { slots: dateSlots?.slots || [] }
  }

  // Fallback for direct { slots: [] } format
  if (data.slots) {
    return data
  }

  return { slots: [] }
}

export async function createBooking(params: {
  companySlug: string
  date: string
  time: string
  serviceId: string
  employeeId: string | null
  anyPerson: boolean
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string
  notes: string
  privacyConsent: boolean
  marketingConsent: boolean
  consentTimestamp: string
}): Promise<BookingConfirmation> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'create',
      companySlug: params.companySlug,
      date: params.date,
      time: params.time,
      serviceId: params.serviceId,
      employeeId: params.employeeId,
      any_person: params.anyPerson,
      firstName: params.firstName,
      lastName: params.lastName,
      customerName: `${params.firstName} ${params.lastName}`,
      customerEmail: params.email,
      customerPhone: params.phone,
      customerGender: params.gender,
      customerNote: params.notes,
      gdprPrivacyConsent: params.privacyConsent,
      gdprSendMarketing: params.marketingConsent,
      gdprConsentTimestamp: params.consentTimestamp,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create booking: ${response.statusText}`)
  }

  return response.json()
}
