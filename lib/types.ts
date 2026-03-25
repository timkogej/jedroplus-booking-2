export interface Theme {
  primaryColor: string
  secondaryColor: string
  bgFrom: string
  bgTo: string
}

export interface Company {
  id: string
  name: string
  slug: string
  bookingName: string
  naziv?: string
}

export interface Employee {
  id: string
  name?: string
  [key: string]: unknown
}

export interface EmployeeUI {
  id: string
  label: string
  subtitle: string
  initials: string
}

export interface ServiceCategory {
  id: string
  name: string
  service_count: number
  icon?: string
  description?: string
}

export interface Service {
  id: string
  // API returns Slovenian field names
  naziv: string
  opis?: string
  trajanjeMin?: number
  cena?: number
  kategorija?: string
  category_id?: string
  // Fallback English names (in case API changes)
  name?: string
  description?: string
  duration?: number
  price?: number
}

export interface ServicesByCategory {
  [categoryId: string]: Service[]
}

export interface UIConfig {
  employeeSelection: {
    mode: 'single' | 'multi'
  }
}

export interface BookingData {
  company: Company
  employees: Employee[]
  employees_ui: EmployeeUI[]
  services: Service[]
  serviceCategories: ServiceCategory[]
  servicesByCategory: ServicesByCategory
  employeesByServiceId?: { [serviceId: string]: (string | number)[] }
  ui: UIConfig
  theme: Theme
}

export interface CustomerData {
  firstName: string
  lastName: string
  phone: string
  email: string
  gender: 'Moški' | 'Ženska' | 'Drugo' | ''
  notes: string
  privacyConsent: boolean
  marketingConsent: boolean
}

export interface BookingConfirmation {
  success: boolean
  message: string
  storitev?: string
  datum?: string
  cas?: string
  cena?: number
}

export interface SlotsResponse {
  slots: string[]
}

export const DEFAULT_THEME: Theme = {
  primaryColor: '#8B5CF6',
  secondaryColor: '#A78BFA',
  bgFrom: '#7C3AED',
  bgTo: '#4F46E5',
}

function parseColorLuminance(color: string): number {
  const hex = color.trim()
  if (hex.startsWith('#')) {
    let h = hex.slice(1)
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]
    const r = parseInt(h.slice(0,2), 16)
    const g = parseInt(h.slice(2,4), 16)
    const b = parseInt(h.slice(4,6), 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255
  }
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (m) return (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255
  return 0
}

export function isBgLight(theme: Theme): boolean {
  return (parseColorLuminance(theme.bgFrom) + parseColorLuminance(theme.bgTo)) / 2 > 0.5
}

export function computeCssVars(theme: Theme): Record<string, string> {
  const light = isBgLight(theme)
  if (!light) {
    return {
      '--t-primary': '#ffffff',
      '--t-soft': 'rgba(255,255,255,0.8)',
      '--t-muted': 'rgba(255,255,255,0.6)',
      '--t-faint': 'rgba(255,255,255,0.45)',
      '--t-disabled': 'rgba(255,255,255,0.22)',
      '--s1': 'rgba(255,255,255,0.05)',
      '--s2': 'rgba(255,255,255,0.1)',
      '--s2h': 'rgba(255,255,255,0.15)',
      '--s3': 'rgba(255,255,255,0.2)',
      '--b1': 'rgba(255,255,255,0.1)',
      '--b2': 'rgba(255,255,255,0.2)',
      '--b3': 'rgba(255,255,255,0.4)',
      '--header-bg': 'rgba(255,255,255,0.05)',
      '--nav-bg': 'rgba(255,255,255,0.1)',
    }
  }
  return {
    '--t-primary': '#0f172a',
    '--t-soft': 'rgba(15,23,42,0.75)',
    '--t-muted': 'rgba(15,23,42,0.55)',
    '--t-faint': 'rgba(15,23,42,0.4)',
    '--t-disabled': 'rgba(15,23,42,0.22)',
    '--s1': 'rgba(0,0,0,0.04)',
    '--s2': 'rgba(0,0,0,0.07)',
    '--s2h': 'rgba(0,0,0,0.1)',
    '--s3': 'rgba(0,0,0,0.13)',
    '--b1': 'rgba(0,0,0,0.1)',
    '--b2': 'rgba(0,0,0,0.15)',
    '--b3': 'rgba(0,0,0,0.3)',
    '--header-bg': 'rgba(255,255,255,0.75)',
    '--nav-bg': 'rgba(255,255,255,0.85)',
  }
}
