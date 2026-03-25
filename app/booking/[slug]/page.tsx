'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import {
  BookingData,
  Service,
  ServiceCategory,
  EmployeeUI,
  CustomerData,
  BookingConfirmation,
  DEFAULT_THEME,
  computeCssVars,
} from '@/lib/types'
import { initBooking, getAvailableSlots, createBooking } from '@/lib/api'
import LoadingScreen from './components/LoadingScreen'
import ErrorScreen from './components/ErrorScreen'
import BookingStepper from './components/BookingStepper'
import SummaryPanel from './components/SummaryPanel'
import StepEmployeeSelection from './components/StepEmployeeSelection'
import StepCategorySelection from './components/StepCategorySelection'
import StepServiceSelection from './components/StepServiceSelection'
import StepDateTimeSelection from './components/StepDateTimeSelection'
import StepCustomerDetails from './components/StepCustomerDetails'
import StepConfirmation from './components/StepConfirmation'

// Step order: 1=Category, 2=Service, 3=Employee, 4=Date/Time, 5=Customer, 6=Confirmation

const initialCustomerData: CustomerData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  gender: '',
  notes: '',
  privacyConsent: false,
  marketingConsent: false,
}

export default function BookingPage() {
  const params = useParams()
  const slug = params.slug as string

  // Data state
  const [data, setData] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Navigation state
  const [currentStep, setCurrentStep] = useState(1)

  // Selection state
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [anyPerson, setAnyPerson] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // Slots state
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Customer data state
  const [customerData, setCustomerData] = useState<CustomerData>(initialCustomerData)

  // Confirmation state
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Derived values
  const theme = data?.theme || DEFAULT_THEME
  const cssVars = useMemo(() => computeCssVars(theme), [theme])

  const companyName = useMemo(() => {
    if (!data?.company) return ''
    return (
      data.company.bookingName ||
      data.company.naziv ||
      data.company.name ||
      ''
    )
  }, [data])

  const selectedEmployee = useMemo(() => {
    return data?.employees_ui.find((e) => e.id === selectedEmployeeId) || null
  }, [data, selectedEmployeeId])

  // Filter services by selected category
  const filteredServices = useMemo(() => {
    if (!data || !selectedCategory) return []

    let services = data.servicesByCategory[selectedCategory.id]

    if (!services) {
      const categoryKey = Object.keys(data.servicesByCategory).find(
        (key) => key.toLowerCase() === selectedCategory.id.toLowerCase()
      )
      services = categoryKey ? data.servicesByCategory[categoryKey] : []
    }

    if (!services || services.length === 0) {
      services = data.services.filter(
        (s) => s.category_id === selectedCategory.id
      )
    }

    return services
  }, [data, selectedCategory])

  // Compute eligible employee IDs for selected service (null = no mapping, use all)
  const eligibleEmployeeIds = useMemo((): string[] | null => {
    if (!data?.employeesByServiceId || !selectedService) return null
    const ids = data.employeesByServiceId[String(selectedService.id)]
    if (ids === undefined) return null // no mapping → show all
    return ids.map(String)
  }, [data, selectedService])

  // Filter employees by selected service
  const filteredEmployees = useMemo((): EmployeeUI[] => {
    if (!data) return []
    if (eligibleEmployeeIds === null) return data.employees_ui // no mapping → all
    if (eligibleEmployeeIds.length === 0) return [] // explicitly empty → none eligible
    const eligibleSet = new Set(eligibleEmployeeIds)
    return data.employees_ui.filter((emp) => eligibleSet.has(String(emp.id)))
  }, [data, eligibleEmployeeIds])

  // Initialize booking data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const bookingData = await initBooking(slug)
        setData(bookingData)
      } catch (err) {
        console.error('Failed to initialize booking:', err)
        setError(err instanceof Error ? err.message : 'Prišlo je do napake pri nalaganju.')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      init()
    }
  }, [slug])

  // Fetch available slots when date, service, or employee changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !selectedService || !data) return

      try {
        setLoadingSlots(true)
        const response = await getAvailableSlots({
          companySlug: slug,
          date: selectedDate,
          serviceId: selectedService.id,
          employeeId: selectedEmployeeId,
          anyPerson,
          eligibleEmployeeIds: anyPerson ? (eligibleEmployeeIds ?? undefined) : undefined,
        })
        setAvailableSlots(response.slots || [])
      } catch (err) {
        console.error('Failed to fetch slots:', err)
        setAvailableSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchSlots()
  }, [selectedDate, selectedService, selectedEmployeeId, anyPerson, data, slug, eligibleEmployeeIds])

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep === 2) {
      // After service selection: auto-select if exactly 1 eligible employee, then skip to step 4
      if (filteredEmployees.length === 1) {
        setSelectedEmployeeId(filteredEmployees[0].id)
        setAnyPerson(false)
        setCurrentStep(4)
      } else {
        setCurrentStep(3)
      }
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, filteredEmployees])

  const handleBack = useCallback(() => {
    if (currentStep === 3) {
      // Going back from employee to service: clear employee selection
      setSelectedEmployeeId(null)
      setAnyPerson(false)
      setCurrentStep(2)
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  // Selection handlers
  const handleSelectCategory = useCallback((category: ServiceCategory) => {
    setSelectedCategory(category)
    // Clear downstream selections
    setSelectedService(null)
    setSelectedEmployeeId(null)
    setAnyPerson(false)
  }, [])

  const handleSelectService = useCallback((service: Service) => {
    setSelectedService(service)
    // Clear downstream selections
    setSelectedEmployeeId(null)
    setAnyPerson(false)
  }, [])

  const handleSelectEmployee = useCallback((employee: EmployeeUI | null) => {
    setSelectedEmployeeId(employee?.id || null)
  }, [])

  const handleSelectAnyPerson = useCallback((value: boolean) => {
    setAnyPerson(value)
    if (value) setSelectedEmployeeId(null)
  }, [])

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }, [])

  const handleSelectTime = useCallback((time: string) => {
    setSelectedTime(time)
  }, [])

  const handleUpdateCustomerData = useCallback((updates: Partial<CustomerData>) => {
    setCustomerData((prev) => ({ ...prev, ...updates }))
  }, [])

  // Submit booking
  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return

    try {
      setSubmitting(true)
      const response = await createBooking({
        companySlug: slug,
        date: selectedDate,
        time: selectedTime,
        serviceId: selectedService.id,
        employeeId: selectedEmployeeId,
        anyPerson,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        gender: customerData.gender,
        notes: customerData.notes,
        privacyConsent: customerData.privacyConsent,
        marketingConsent: customerData.marketingConsent,
        consentTimestamp: new Date().toISOString(),
      })

      if (response.success) {
        setBookingConfirmation(response)
        setCurrentStep(6)
      } else {
        alert(response.message || 'Prišlo je do napake pri rezervaciji.')
      }
    } catch (err) {
      console.error('Failed to create booking:', err)
      alert(err instanceof Error ? err.message : 'Prišlo je do napake pri rezervaciji.')
    } finally {
      setSubmitting(false)
    }
  }

  // Reset handlers
  const handleNewBooking = useCallback(() => {
    setSelectedCategory(null)
    setSelectedService(null)
    setSelectedEmployeeId(null)
    setAnyPerson(false)
    setSelectedDate(null)
    setSelectedTime(null)
    setAvailableSlots([])
    setCustomerData(initialCustomerData)
    setBookingConfirmation(null)
    setCurrentStep(1)
  }, [])

  const handleStartOver = useCallback(() => {
    setSelectedCategory(null)
    setSelectedService(null)
    setSelectedEmployeeId(null)
    setAnyPerson(false)
    setSelectedDate(null)
    setSelectedTime(null)
    setAvailableSlots([])
    setCustomerData(initialCustomerData)
    setBookingConfirmation(null)
    setCurrentStep(1)
  }, [])

  // Validation for Next button
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return selectedCategory !== null
      case 2:
        return selectedService !== null
      case 3:
        if (filteredEmployees.length === 0) return false
        return selectedEmployeeId !== null || anyPerson
      case 4:
        return selectedDate !== null && selectedTime !== null
      case 5:
        return (
          customerData.firstName.trim() !== '' &&
          customerData.lastName.trim() !== '' &&
          customerData.phone.trim() !== '' &&
          customerData.email.trim() !== '' &&
          customerData.email.includes('@') &&
          customerData.privacyConsent
        )
      default:
        return false
    }
  }, [currentStep, selectedCategory, selectedService, filteredEmployees, selectedEmployeeId, anyPerson, selectedDate, selectedTime, customerData])

  // Loading state
  if (loading) {
    return <LoadingScreen companyName={data?.company?.bookingName} theme={theme} />
  }

  // Error state
  if (error) {
    return (
      <ErrorScreen
        error={error}
        theme={theme}
        onRetry={() => window.location.reload()}
      />
    )
  }

  // Main content
  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgTo})`,
        ...cssVars,
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--header-bg)] border-b border-[var(--b1)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-display font-semibold text-[var(--t-primary)]">
              {companyName || 'Rezervacija'}
            </h1>
          </div>

          {/* Stepper - show for steps 1-5, not confirmation (6) */}
          {currentStep < 6 && (
            <BookingStepper currentStep={currentStep} theme={theme} />
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Step 1: Category Selection */}
              {currentStep === 1 && (
                <StepCategorySelection
                  key="category"
                  theme={theme}
                  categories={data?.serviceCategories || []}
                  selectedCategoryId={selectedCategory?.id || null}
                  onSelectCategory={handleSelectCategory}
                  servicesByCategory={data?.servicesByCategory || {}}
                  allServices={data?.services || []}
                />
              )}

              {/* Step 2: Service Selection */}
              {currentStep === 2 && (
                <StepServiceSelection
                  key="service"
                  theme={theme}
                  services={filteredServices}
                  selectedServiceId={selectedService?.id || null}
                  categoryName={selectedCategory?.name || ''}
                  onSelectService={handleSelectService}
                  onBack={() => setCurrentStep(1)}
                />
              )}

              {/* Step 3: Employee Selection (filtered by service) */}
              {currentStep === 3 && (
                <StepEmployeeSelection
                  key="employee"
                  theme={theme}
                  employees={filteredEmployees}
                  selectedEmployeeId={selectedEmployeeId}
                  anyPerson={anyPerson}
                  onSelectEmployee={handleSelectEmployee}
                  onSelectAnyPerson={handleSelectAnyPerson}
                />
              )}

              {/* Step 4: Date/Time Selection */}
              {currentStep === 4 && (
                <StepDateTimeSelection
                  key="datetime"
                  theme={theme}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  availableSlots={availableSlots}
                  loadingSlots={loadingSlots}
                  onSelectDate={handleSelectDate}
                  onSelectTime={handleSelectTime}
                />
              )}

              {/* Step 5: Customer Details */}
              {currentStep === 5 && (
                <StepCustomerDetails
                  key="customer"
                  theme={theme}
                  customerData={customerData}
                  selectedEmployee={selectedEmployee}
                  anyPerson={anyPerson}
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  submitting={submitting}
                  onUpdateCustomerData={handleUpdateCustomerData}
                  onSubmit={handleSubmit}
                />
              )}

              {/* Step 6: Confirmation */}
              {currentStep === 6 && (
                <StepConfirmation
                  key="confirmation"
                  theme={theme}
                  bookingConfirmation={bookingConfirmation}
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  companyName={companyName}
                  onNewBooking={handleNewBooking}
                  onStartOver={handleStartOver}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Summary Panel - Desktop only, Steps 1-4 */}
          {currentStep < 5 && (
            <div className="hidden xl:block w-80 flex-shrink-0">
              <SummaryPanel
                theme={theme}
                selectedEmployee={selectedEmployee}
                anyPerson={anyPerson}
                selectedService={selectedService}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      {currentStep < 6 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--nav-bg)] border-t border-[var(--b2)]"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Back Button */}
              {currentStep > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  className="px-6 py-3 rounded-xl font-display font-medium text-[var(--t-soft)] bg-[var(--s2)] border border-[var(--b2)] hover:bg-[var(--s3)] transition-all"
                >
                  Nazaj
                </motion.button>
              )}

              {/* Spacer when no back button */}
              {currentStep === 1 && <div />}

              {/* Price - Mobile only */}
              {selectedService && (selectedService.cena ?? selectedService.price) != null && (
                <div className="xl:hidden text-center">
                  <p className="text-[var(--t-muted)] font-display text-xs">Skupaj</p>
                  <p className="text-xl font-display font-bold" style={{ color: theme.primaryColor }}>
                    {Number(selectedService.cena ?? selectedService.price).toFixed(2)} €
                  </p>
                </div>
              )}

              {/* Next Button - Steps 1-4 */}
              {currentStep < 5 && (
                <motion.button
                  whileHover={{ scale: canProceed ? 1.02 : 1 }}
                  whileTap={{ scale: canProceed ? 0.98 : 1 }}
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={`
                    px-8 py-3 rounded-xl font-display font-semibold text-white transition-all
                    flex items-center gap-2
                    ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  style={{
                    backgroundColor: theme.primaryColor,
                    boxShadow: canProceed ? `0 10px 30px ${theme.primaryColor}40` : 'none',
                  }}
                >
                  Naprej
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              )}

              {/* Submit Button - Mobile, Step 5 */}
              {currentStep === 5 && (
                <motion.button
                  whileHover={{ scale: canProceed && !submitting ? 1.02 : 1 }}
                  whileTap={{ scale: canProceed && !submitting ? 0.98 : 1 }}
                  onClick={handleSubmit}
                  disabled={!canProceed || submitting}
                  className={`
                    lg:hidden px-8 py-3 rounded-xl font-display font-semibold text-white transition-all
                    flex items-center gap-2
                    ${!canProceed || submitting ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  style={{
                    backgroundColor: theme.primaryColor,
                    boxShadow: canProceed && !submitting ? `0 10px 30px ${theme.primaryColor}40` : 'none',
                  }}
                >
                  {submitting ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Rezerviranje...
                    </>
                  ) : (
                    <>
                      Potrdi rezervacijo
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom padding to account for fixed nav */}
      {currentStep < 6 && <div className="h-24" />}
    </div>
  )
}
