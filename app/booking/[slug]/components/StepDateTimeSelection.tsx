'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Theme } from '@/lib/types'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
  getDay,
} from 'date-fns'
import { sl } from 'date-fns/locale'

interface StepDateTimeSelectionProps {
  theme: Theme
  selectedDate: string | null
  selectedTime: string | null
  availableSlots: string[]
  loadingSlots: boolean
  onSelectDate: (date: string) => void
  onSelectTime: (time: string) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
}

const WEEKDAY_NAMES = ['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned']

export default function StepDateTimeSelection({
  theme,
  selectedDate,
  selectedTime,
  availableSlots,
  loadingSlots,
  onSelectDate,
  onSelectTime,
}: StepDateTimeSelectionProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const today = startOfDay(new Date())

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null

  useEffect(() => {
    if (selectedDate) {
      const dateObj = new Date(selectedDate)
      if (!isSameMonth(dateObj, currentMonth)) {
        setCurrentMonth(dateObj)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate starting day offset (Monday = 0)
  const startDayOffset = (getDay(monthStart) + 6) % 7

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleSelectDate = (day: Date) => {
    if (isBefore(day, today)) return
    const dateString = format(day, 'yyyy-MM-dd')
    onSelectDate(dateString)
    onSelectTime('')
  }

  const canGoPrevMonth = !isSameMonth(currentMonth, new Date())

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
          Izberite datum in čas
        </h2>
        <p className="text-white/60 font-display">
          Kdaj bi želeli priti?
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20"
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                disabled={!canGoPrevMonth}
                className={`p-2 rounded-xl transition-all ${
                  canGoPrevMonth
                    ? 'hover:bg-white/10 text-white'
                    : 'text-white/30 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <h3 className="text-white font-display font-semibold capitalize">
                {format(currentMonth, 'LLLL yyyy', { locale: sl })}
              </h3>

              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-white/10 text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAY_NAMES.map((day) => (
                <div
                  key={day}
                  className="text-center text-white/50 font-display text-xs font-medium py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {days.map((day) => {
                const isPast = isBefore(day, today)
                const isSelected = selectedDateObj && isSameDay(day, selectedDateObj)
                const isDayToday = isToday(day)

                return (
                  <motion.button
                    key={day.toISOString()}
                    whileHover={!isPast ? { scale: 1.1 } : {}}
                    whileTap={!isPast ? { scale: 0.95 } : {}}
                    onClick={() => handleSelectDate(day)}
                    disabled={isPast}
                    className={`
                      aspect-square rounded-xl flex items-center justify-center text-sm font-display font-medium
                      transition-all duration-200
                      ${isPast
                        ? 'text-white/20 cursor-not-allowed'
                        : isSelected
                          ? 'text-white'
                          : isDayToday
                            ? 'text-white bg-white/10 hover:bg-white/20'
                            : 'text-white/80 hover:bg-white/10'
                      }
                    `}
                    style={isSelected ? {
                      backgroundColor: theme.primaryColor,
                      boxShadow: `0 4px 15px ${theme.primaryColor}50`,
                    } : {}}
                  >
                    {format(day, 'd')}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Time Slots */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20"
          >
            <h3 className="text-white font-display font-semibold mb-4">
              Razpoložljivi termini
            </h3>

            {!selectedDate ? (
              <div className="text-center py-12">
                <p className="text-white/60 font-display">
                  Najprej izberite datum
                </p>
              </div>
            ) : loadingSlots ? (
              <div className="py-12">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-3 sm:grid-cols-4 gap-2"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className="h-11 rounded-xl bg-white/10 animate-pulse"
                    />
                  ))}
                </motion.div>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60 font-display">
                  Ta dan ni prostih terminov
                </p>
                <p className="text-white/40 font-display text-sm mt-1">
                  Prosimo, izberite drug datum
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                  <motion.div
                    key={selectedDate}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-1"
                  >
                    {availableSlots.map((slot) => {
                      const isSelected = selectedTime === slot

                      return (
                        <motion.button
                          key={slot}
                          variants={itemVariants}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onSelectTime(slot)}
                          className={`
                            py-2.5 px-3 rounded-xl font-display font-medium text-sm transition-all duration-200
                            ${isSelected
                              ? 'text-white'
                              : 'bg-white/5 text-white/80 hover:bg-white/15 border border-white/10'
                            }
                          `}
                          style={isSelected ? {
                            backgroundColor: theme.primaryColor,
                            boxShadow: `0 4px 12px ${theme.primaryColor}40`,
                          } : {}}
                        >
                          {slot}
                        </motion.button>
                      )
                    })}
                  </motion.div>
                </div>
              </AnimatePresence>
            )}
          </motion.div>
        </div>

        {/* Selected Date/Time Display */}
        {selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
              <svg
                className="w-5 h-5"
                style={{ color: theme.primaryColor }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white font-display">
                {format(new Date(selectedDate), 'd. MMMM yyyy', { locale: sl })} ob {selectedTime}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
