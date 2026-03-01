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

const initialCustomerData: CustomerData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  gender: '',
  notes: '',
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
  const [isSubStep, setIsSubStep] = useState(false)

  // Selection state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [anyPerson, setAnyPerson] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
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

  // Filter services by category
  const filteredServices = useMemo(() => {
    if (!data || !selectedCategory) return []

    // First try exact match
    let services = data.servicesByCategory[selectedCategory.id]

    // If not found, try case-insensitive
    if (!services) {
      const categoryKey = Object.keys(data.servicesByCategory).find(
        (key) => key.toLowerCase() === selectedCategory.id.toLowerCase()
      )
      services = categoryKey ? data.servicesByCategory[categoryKey] : []
    }

    // Fallback: filter all services by category_id
    if (!services || services.length === 0) {
      services = data.services.filter(
        (s) => s.category_id === selectedCategory.id
      )
    }

    return services
  }, [data, selectedCategory])

  // Initialize booking data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const bookingData = await initBooking(slug)
        setData(bookingData)

        // Auto-skip employee selection if single employee mode and only 1 employee
        if (
          bookingData.ui.employeeSelection.mode === 'single' &&
          bookingData.employees_ui.length === 1
        ) {
          setSelectedEmployeeId(bookingData.employees_ui[0].id)
          setCurrentStep(2)
        }
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
  }, [selectedDate, selectedService, selectedEmployeeId, anyPerson, data, slug])

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep === 2 && !isSubStep) {
      // Moving from category to service (sub-step)
      setIsSubStep(true)
    } else if (currentStep === 2 && isSubStep) {
      // Moving from service to date/time
      setIsSubStep(false)
      setCurrentStep(3)
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, isSubStep])

  const handleBack = useCallback(() => {
    if (currentStep === 2 && isSubStep) {
      // Going back from service to category
      setIsSubStep(false)
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      if (currentStep === 3) {
        setIsSubStep(true) // Go back to service selection
      }
    }
  }, [currentStep, isSubStep])

  // Selection handlers
  const handleSelectEmployee = useCallback((employee: EmployeeUI | null) => {
    setSelectedEmployeeId(employee?.id || null)
  }, [])

  const handleSelectAnyPerson = useCallback((value: boolean) => {
    setAnyPerson(value)
    if (value) setSelectedEmployeeId(null)
  }, [])

  const handleSelectCategory = useCallback((category: ServiceCategory) => {
    setSelectedCategory(category)
    setSelectedService(null)
    setIsSubStep(true) // Auto-navigate to service sub-step
  }, [])

  const handleSelectService = useCallback((service: Service) => {
    setSelectedService(service)
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
        marketingConsent: customerData.marketingConsent,
      })

      if (response.success) {
        setBookingConfirmation(response)
        setCurrentStep(5)
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
    // Keep employee selection, reset everything else
    setSelectedCategory(null)
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setAvailableSlots([])
    setCustomerData(initialCustomerData)
    setBookingConfirmation(null)
    setCurrentStep(2)
    setIsSubStep(false)
  }, [])

  const handleStartOver = useCallback(() => {
    // Reset everything
    setSelectedEmployeeId(null)
    setAnyPerson(false)
    setSelectedCategory(null)
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setAvailableSlots([])
    setCustomerData(initialCustomerData)
    setBookingConfirmation(null)
    setCurrentStep(1)
    setIsSubStep(false)
  }, [])

  // Validation for Next button
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return selectedEmployeeId !== null || anyPerson
      case 2:
        if (!isSubStep) {
          return selectedCategory !== null
        }
        return selectedService !== null
      case 3:
        return selectedDate !== null && selectedTime !== null
      case 4:
        return (
          customerData.firstName.trim() !== '' &&
          customerData.lastName.trim() !== '' &&
          customerData.phone.trim() !== '' &&
          customerData.email.trim() !== '' &&
          customerData.email.includes('@')
        )
      default:
        return false
    }
  }, [currentStep, isSubStep, selectedEmployeeId, anyPerson, selectedCategory, selectedService, selectedDate, selectedTime, customerData])

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
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-display font-semibold text-white">
              {companyName || 'Rezervacija'}
            </h1>
          </div>

          {/* Stepper */}
          {currentStep < 5 && (
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
              {/* Step 1: Employee Selection */}
              {currentStep === 1 && (
                <StepEmployeeSelection
                  key="employee"
                  theme={theme}
                  employees={data?.employees_ui || []}
                  selectedEmployeeId={selectedEmployeeId}
                  anyPerson={anyPerson}
                  onSelectEmployee={handleSelectEmployee}
                  onSelectAnyPerson={handleSelectAnyPerson}
                />
              )}

              {/* Step 2a: Category Selection */}
              {currentStep === 2 && !isSubStep && (
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

              {/* Step 2b: Service Selection */}
              {currentStep === 2 && isSubStep && (
                <StepServiceSelection
                  key="service"
                  theme={theme}
                  services={filteredServices}
                  selectedServiceId={selectedService?.id || null}
                  categoryName={selectedCategory?.name || ''}
                  onSelectService={handleSelectService}
                  onBack={() => setIsSubStep(false)}
                />
              )}

              {/* Step 3: Date/Time Selection */}
              {currentStep === 3 && (
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

              {/* Step 4: Customer Details */}
              {currentStep === 4 && (
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

              {/* Step 5: Confirmation */}
              {currentStep === 5 && (
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

          {/* Summary Panel - Desktop only, Steps 1-3 */}
          {currentStep < 4 && (
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
      {currentStep < 5 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-t border-white/20"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Back Button */}
              {currentStep > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  className="px-6 py-3 rounded-xl font-display font-medium text-white/80 bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
                >
                  Nazaj
                </motion.button>
              )}

              {/* Spacer when no back button */}
              {currentStep === 1 && <div />}

              {/* Price - Mobile only */}
              {selectedService && (selectedService.cena ?? selectedService.price) != null && (
                <div className="xl:hidden text-center">
                  <p className="text-white/60 font-display text-xs">Skupaj</p>
                  <p className="text-xl font-display font-bold" style={{ color: theme.primaryColor }}>
                    {Number(selectedService.cena ?? selectedService.price).toFixed(2)} €
                  </p>
                </div>
              )}

              {/* Next/Submit Button */}
              {currentStep < 4 && (
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

              {/* Submit Button - Mobile, Step 4 */}
              {currentStep === 4 && (
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
      {currentStep < 5 && <div className="h-24" />}
    </div>
  )
}
