'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Theme, Service, EmployeeUI, CustomerData } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { sl } from 'date-fns/locale'

interface StepCustomerDetailsProps {
  theme: Theme
  customerData: CustomerData
  selectedEmployee: EmployeeUI | null
  anyPerson: boolean
  selectedService: Service | null
  selectedDate: string | null
  selectedTime: string | null
  submitting: boolean
  onUpdateCustomerData: (data: Partial<CustomerData>) => void
  onSubmit: () => void
}

// Helper to get service fields (supports both Slovenian and English field names)
const getServiceName = (service: Service) => service.naziv || service.name || ''
const getServiceDuration = (service: Service) => service.trajanjeMin ?? service.duration
const getServicePrice = (service: Service) => service.cena ?? service.price

export default function StepCustomerDetails({
  theme,
  customerData,
  selectedEmployee,
  anyPerson,
  selectedService,
  selectedDate,
  selectedTime,
  submitting,
  onUpdateCustomerData,
  onSubmit,
}: StepCustomerDetailsProps) {
  const [showErrors, setShowErrors] = useState(false)

  const isFirstNameValid = customerData.firstName.trim() !== ''
  const isLastNameValid = customerData.lastName.trim() !== ''
  const isPhoneValid = customerData.phone.trim() !== ''
  const isEmailValid = customerData.email.trim() !== '' && customerData.email.includes('@')

  const isFormValid = isFirstNameValid && isLastNameValid && isPhoneValid && isEmailValid

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) {
      setShowErrors(true)
      return
    }
    if (!submitting) {
      onSubmit()
    }
  }

  const inputClasses = (isValid: boolean) => `
    w-full px-4 py-3 rounded-xl bg-white/10 border
    text-white placeholder-white/40 font-display
    focus:outline-none focus:bg-white/15
    transition-all duration-200
    ${showErrors && !isValid
      ? 'border-red-400/70 focus:border-red-400'
      : 'border-white/20 focus:border-white/40'
    }
  `

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-semibold text-white mb-2">
          Vaši podatki
        </h2>
        <p className="text-white/60 font-display">
          Izpolnite podatke za dokončanje rezervacije
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-display text-sm mb-2">
                    Ime <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerData.firstName}
                    onChange={(e) => onUpdateCustomerData({ firstName: e.target.value })}
                    placeholder="Janez"
                    className={inputClasses(isFirstNameValid)}
                    required
                  />
                  {showErrors && !isFirstNameValid && (
                    <p className="text-red-400 text-xs font-display mt-1">Ime je obvezno</p>
                  )}
                </div>
                <div>
                  <label className="block text-white/70 font-display text-sm mb-2">
                    Priimek <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerData.lastName}
                    onChange={(e) => onUpdateCustomerData({ lastName: e.target.value })}
                    placeholder="Novak"
                    className={inputClasses(isLastNameValid)}
                    required
                  />
                  {showErrors && !isLastNameValid && (
                    <p className="text-red-400 text-xs font-display mt-1">Priimek je obvezen</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-white/70 font-display text-sm mb-2">
                  Telefon <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => onUpdateCustomerData({ phone: e.target.value })}
                  placeholder="+386 40 123 456"
                  className={inputClasses(isPhoneValid)}
                  required
                />
                {showErrors && !isPhoneValid && (
                  <p className="text-red-400 text-xs font-display mt-1">Telefon je obvezen</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-white/70 font-display text-sm mb-2">
                  E-pošta <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => onUpdateCustomerData({ email: e.target.value })}
                  placeholder="janez@email.com"
                  className={inputClasses(isEmailValid)}
                  required
                />
                {showErrors && !isEmailValid && (
                  <p className="text-red-400 text-xs font-display mt-1">
                    {customerData.email.trim() === ''
                      ? 'E-pošta je obvezna'
                      : 'Vnesite veljavno e-poštno naslov'}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-white/70 font-display text-sm mb-2">Spol</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Moški', 'Ženska', 'Drugo'] as const).map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => onUpdateCustomerData({ gender })}
                      className={`
                        py-2.5 px-3 rounded-xl font-display font-medium text-sm transition-all duration-200
                        ${customerData.gender === gender
                          ? 'text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                        }
                      `}
                      style={customerData.gender === gender ? {
                        backgroundColor: theme.primaryColor,
                      } : {}}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-white/70 font-display text-sm mb-2">Opombe</label>
                <textarea
                  value={customerData.notes}
                  onChange={(e) => onUpdateCustomerData({ notes: e.target.value })}
                  placeholder="Posebne želje ali opombe..."
                  rows={3}
                  className={`${inputClasses(true)} resize-none`}
                />
              </div>

              {/* Marketing Consent */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={customerData.marketingConsent}
                    onChange={(e) => onUpdateCustomerData({ marketingConsent: e.target.checked })}
                    className="sr-only"
                  />
                  <div
                    className={`
                      w-5 h-5 rounded-md border-2 transition-all duration-200
                      flex items-center justify-center
                      ${customerData.marketingConsent
                        ? 'border-transparent'
                        : 'border-white/30 group-hover:border-white/50'
                      }
                    `}
                    style={customerData.marketingConsent ? {
                      backgroundColor: theme.primaryColor,
                    } : {}}
                  >
                    {customerData.marketingConsent && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </div>
                </div>
                <span className="text-white/60 font-display text-sm">
                  Želim prejemati novice in posebne ponudbe
                </span>
              </label>
            </form>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-lg font-display font-semibold text-white mb-6">
              Povzetek rezervacije
            </h3>

            <div className="space-y-4">
              {/* Employee */}
              <div>
                <p className="text-xs font-display text-white/50">Oseba</p>
                <p className="text-white font-display font-medium">
                  {anyPerson ? 'Kdorkoli' : selectedEmployee?.label}
                </p>
              </div>

              {/* Service */}
              {selectedService && (
                <div>
                  <p className="text-xs font-display text-white/50">Storitev</p>
                  <p className="text-white font-display font-medium">{getServiceName(selectedService)}</p>
                  {getServiceDuration(selectedService) != null && (
                    <p className="text-white/60 font-display text-sm">{getServiceDuration(selectedService)} min</p>
                  )}
                </div>
              )}

              {/* Date & Time */}
              {selectedDate && selectedTime && (
                <div>
                  <p className="text-xs font-display text-white/50">Datum in čas</p>
                  <p className="text-white font-display font-medium">
                    {format(parseISO(selectedDate), 'd. MMMM yyyy', { locale: sl })}
                  </p>
                  <p className="text-white/60 font-display text-sm">ob {selectedTime}</p>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-white/10 my-4" />

              {/* Total */}
              {selectedService && getServicePrice(selectedService) != null && (
                <div className="flex items-center justify-between">
                  <span className="text-white/70 font-display">Skupaj</span>
                  <span
                    className="text-3xl font-display font-bold"
                    style={{ color: theme.primaryColor }}
                  >
                    {Number(getServicePrice(selectedService)).toFixed(2)} €
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button - Desktop */}
            <motion.button
              whileHover={{ scale: isFormValid && !submitting ? 1.02 : 1 }}
              whileTap={{ scale: isFormValid && !submitting ? 0.98 : 1 }}
              onClick={() => {
                if (!isFormValid) {
                  setShowErrors(true)
                  return
                }
                if (!submitting) onSubmit()
              }}
              disabled={submitting}
              className={`
                hidden lg:flex w-full mt-6 py-4 rounded-xl font-display font-semibold text-white
                items-center justify-center gap-2 transition-all duration-300
                ${!isFormValid || submitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={{
                backgroundColor: theme.primaryColor,
                boxShadow: isFormValid && !submitting ? `0 10px 30px ${theme.primaryColor}40` : 'none',
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

            {/* Validation hint */}
            {showErrors && !isFormValid && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden lg:block mt-3 text-red-400 text-sm font-display text-center"
              >
                Prosimo, izpolnite vsa obvezna polja.
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
