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
