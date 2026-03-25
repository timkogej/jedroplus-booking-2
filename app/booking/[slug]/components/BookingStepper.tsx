'use client'

import { motion } from 'framer-motion'
import { Theme } from '@/lib/types'

interface BookingStepperProps {
  currentStep: number
  theme: Theme
}

const steps = [
  { number: 1, label: 'Kategorija' },
  { number: 2, label: 'Storitev' },
  { number: 3, label: 'Oseba' },
  { number: 4, label: 'Termin' },
  { number: 5, label: 'Podatki' },
]

export default function BookingStepper({ currentStep, theme }: BookingStepperProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-[var(--b2)] -translate-y-1/2 z-0" />

        {/* Active progress line */}
        <motion.div
          className="absolute left-0 top-5 h-0.5 -translate-y-1/2 z-0"
          style={{ backgroundColor: theme.primaryColor }}
          initial={{ width: '0%' }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {steps.map((step) => {
          const isActive = currentStep === step.number
          const isCompleted = currentStep > step.number

          return (
            <motion.div
              key={step.number}
              className="flex flex-col items-center z-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: step.number * 0.1 }}
            >
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center font-display font-semibold text-sm transition-all duration-300"
                style={{
                  backgroundColor: isActive || isCompleted ? theme.primaryColor : 'var(--s2)',
                  color: isActive || isCompleted ? 'white' : 'var(--t-faint)',
                  boxShadow: isActive ? `0 4px 20px ${theme.primaryColor}60` : 'none',
                  border: isActive ? `2px solid ${theme.secondaryColor}` : '2px solid transparent',
                }}
                whileHover={{ scale: 1.05 }}
              >
                {isCompleted ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                ) : (
                  step.number
                )}
              </motion.div>
              <span
                className="mt-2 text-xs font-display font-medium hidden sm:block"
                style={{
                  color: isActive || isCompleted ? 'var(--t-primary)' : 'var(--t-faint)',
                }}
              >
                {step.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
