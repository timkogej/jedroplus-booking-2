'use client'

import { motion } from 'framer-motion'
import { Theme, Service, EmployeeUI } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { sl } from 'date-fns/locale'

interface SummaryPanelProps {
  theme: Theme
  selectedEmployee: EmployeeUI | null
  anyPerson: boolean
  selectedService: Service | null
  selectedDate: string | null
  selectedTime: string | null
}

// Helper to get service fields (supports both Slovenian and English field names)
const getServiceName = (service: Service) => service.naziv || service.name || ''
const getServiceDuration = (service: Service) => service.trajanjeMin ?? service.duration
const getServicePrice = (service: Service) => service.cena ?? service.price

export default function SummaryPanel({
  theme,
  selectedEmployee,
  anyPerson,
  selectedService,
  selectedDate,
  selectedTime,
}: SummaryPanelProps) {
  const hasContent = selectedEmployee || anyPerson || selectedService || selectedDate

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-[var(--s2)] backdrop-blur-xl rounded-3xl p-6 border border-[var(--b2)] sticky top-8"
    >
      <h3 className="text-lg font-display font-semibold text-[var(--t-primary)] mb-6">
        Povzetek rezervacije
      </h3>

      {!hasContent ? (
        <p className="text-[var(--t-faint)] font-display text-sm">
          Začnite z izbiro za prikaz povzetka...
        </p>
      ) : (
        <div className="space-y-4">
          {/* Employee */}
          {(selectedEmployee || anyPerson) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs font-display text-[var(--t-faint)]">Oseba</p>
              <p className="text-[var(--t-primary)] font-display font-medium">
                {anyPerson ? 'Kdorkoli' : selectedEmployee?.label}
              </p>
            </motion.div>
          )}

          {/* Service */}
          {selectedService && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs font-display text-[var(--t-faint)]">Storitev</p>
              <p className="text-[var(--t-primary)] font-display font-medium">{getServiceName(selectedService)}</p>
              {getServiceDuration(selectedService) != null && (
                <p className="text-[var(--t-muted)] font-display text-sm">{getServiceDuration(selectedService)} min</p>
              )}
            </motion.div>
          )}

          {/* Date & Time */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs font-display text-[var(--t-faint)]">Datum in čas</p>
              <p className="text-[var(--t-primary)] font-display font-medium">
                {format(parseISO(selectedDate), 'd. MMMM yyyy', { locale: sl })}
              </p>
              {selectedTime && (
                <p className="text-[var(--t-muted)] font-display text-sm">ob {selectedTime}</p>
              )}
            </motion.div>
          )}

          {/* Divider */}
          {selectedService && getServicePrice(selectedService) != null && (
            <>
              <div className="border-t border-[var(--b1)] my-4" />

              {/* Total */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between"
              >
                <span className="text-[var(--t-soft)] font-display">Skupaj</span>
                <span
                  className="text-2xl font-display font-bold"
                  style={{ color: theme.primaryColor }}
                >
                  {Number(getServicePrice(selectedService)).toFixed(2)} €
                </span>
              </motion.div>
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}
