'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Theme, BookingConfirmation, Service } from '@/lib/types'

interface StepConfirmationProps {
  theme: Theme
  bookingConfirmation: BookingConfirmation | null
  selectedService: Service | null
  selectedDate: string | null
  selectedTime: string | null
  companyName: string
  onNewBooking: () => void
  onStartOver: () => void
}

const getServicePrice = (service: Service) => service.cena ?? service.price
const getServiceDuration = (service: Service) => service.trajanjeMin ?? service.duration

function generateICS(params: {
  serviceName: string
  date: string
  time: string
  durationMin: number
  companyName: string
}): string {
  const [year, month, day] = params.date.split('-').map(Number)
  const [hour, minute] = params.time.split(':').map(Number)

  const pad = (n: number) => n.toString().padStart(2, '0')
  const formatDate = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`

  const start = new Date(year, month - 1, day, hour, minute)
  const end = new Date(start.getTime() + params.durationMin * 60000)

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Booking//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${params.serviceName}`,
    `DESCRIPTION:Rezervacija pri ${params.companyName}`,
    `LOCATION:${params.companyName}`,
    `UID:booking-${Date.now()}@jedroplus`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export default function StepConfirmation({
  theme,
  bookingConfirmation,
  selectedService,
  selectedDate,
  selectedTime,
  companyName,
  onNewBooking,
  onStartOver,
}: StepConfirmationProps) {
  const [copied, setCopied] = useState(false)

  const price = selectedService ? getServicePrice(selectedService) : null
  const durationMin = selectedService ? (getServiceDuration(selectedService) ?? 60) : 60
  const serviceName = bookingConfirmation?.storitev || (selectedService?.naziv ?? selectedService?.name ?? 'Rezervacija')

  const handleAddToCalendar = () => {
    if (!selectedDate || !selectedTime) return

    const icsContent = generateICS({
      serviceName,
      date: selectedDate,
      time: selectedTime,
      durationMin: Number(durationMin),
      companyName,
    })

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'rezervacija.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const text = [
      `Rezervacija: ${serviceName}`,
      bookingConfirmation?.datum ? `Datum: ${bookingConfirmation.datum}` : '',
      bookingConfirmation?.cas ? `Čas: ${bookingConfirmation.cas}` : '',
      companyName ? `Pri: ${companyName}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Rezervacija – ${companyName}`,
          text,
          url: window.location.href,
        })
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {
        // clipboard not available
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-[var(--s2)] backdrop-blur-xl rounded-3xl p-8 border border-[var(--b2)] text-center relative overflow-hidden">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${theme.primaryColor}30` }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Success Message */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-display font-semibold text-[var(--t-primary)] mb-3"
        >
          Rezervacija uspešna!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-[var(--t-soft)] font-display mb-8"
        >
          {bookingConfirmation?.message || 'Vaša rezervacija je bila potrjena. Hvala za zaupanje!'}
        </motion.p>

        {/* Booking Details */}
        {bookingConfirmation && (bookingConfirmation.storitev || bookingConfirmation.datum || bookingConfirmation.cas || price != null) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-[var(--s1)] rounded-2xl p-5 mb-6 text-left"
          >
            <h3 className="text-[var(--t-soft)] font-display text-sm font-medium mb-4 uppercase tracking-wide">
              Podatki rezervacije
            </h3>

            <div className="space-y-3">
              {bookingConfirmation.storitev && (
                <div>
                  <p className="text-[var(--t-faint)] font-display text-xs">Storitev</p>
                  <p className="text-[var(--t-primary)] font-display font-medium">{bookingConfirmation.storitev}</p>
                </div>
              )}

              {bookingConfirmation.datum && (
                <div>
                  <p className="text-[var(--t-faint)] font-display text-xs">Datum</p>
                  <p className="text-[var(--t-primary)] font-display font-medium">{bookingConfirmation.datum}</p>
                </div>
              )}

              {bookingConfirmation.cas && (
                <div>
                  <p className="text-[var(--t-faint)] font-display text-xs">Čas</p>
                  <p className="text-[var(--t-primary)] font-display font-medium">{bookingConfirmation.cas}</p>
                </div>
              )}

              {price != null && (
                <>
                  <div className="border-t border-[var(--b1)] pt-3 flex items-center justify-between">
                    <p className="text-[var(--t-faint)] font-display text-xs">Cena termina</p>
                    <p
                      className="font-display font-bold text-lg"
                      style={{ color: theme.primaryColor }}
                    >
                      {Number(price).toFixed(2)} €
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Calendar & Share Buttons */}
        {(selectedDate && selectedTime) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="flex gap-3 mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCalendar}
              className="flex-1 py-3 rounded-xl font-display font-medium text-sm text-[var(--t-soft)] bg-[var(--s2)] border border-[var(--b2)] hover:bg-[var(--s3)] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Dodaj v koledar
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className="flex-1 py-3 rounded-xl font-display font-medium text-sm text-[var(--t-soft)] bg-[var(--s2)] border border-[var(--b2)] hover:bg-[var(--s3)] transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Kopirano!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Deli
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewBooking}
            className="w-full py-4 rounded-xl font-display font-semibold text-white transition-all duration-300"
            style={{
              backgroundColor: theme.primaryColor,
              boxShadow: `0 10px 30px ${theme.primaryColor}40`,
            }}
          >
            Nova rezervacija
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartOver}
            className="w-full py-4 rounded-xl font-display font-semibold text-[var(--t-soft)] bg-[var(--s2)] border border-[var(--b2)] hover:bg-[var(--s3)] transition-all duration-300"
          >
            Začni znova
          </motion.button>
        </motion.div>

        {/* Confetti-like particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: i % 2 === 0 ? theme.primaryColor : theme.secondaryColor,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 1, scale: 0 }}
              animate={{
                opacity: [1, 0],
                scale: [0, 1],
                y: [0, Math.random() * 100 - 50],
                x: [0, Math.random() * 100 - 50],
              }}
              transition={{
                delay: 0.3 + i * 0.05,
                duration: 1,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
