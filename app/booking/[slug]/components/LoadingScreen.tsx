'use client'

import { motion } from 'framer-motion'
import { Theme } from '@/lib/types'

interface LoadingScreenProps {
  companyName?: string
  theme?: Theme
}

export default function LoadingScreen({ companyName }: LoadingScreenProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1e0a3c 0%, #0d1a4a 50%, #0a1f35 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Gradient spinner */}
        <div className="relative w-14 h-14">
          {/* Static track */}
          <div className="absolute inset-0 rounded-full border-[3px] border-white/10" />

          {/* Spinning gradient arc via SVG */}
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 56 56"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          >
            <defs>
              <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <circle
              cx="28"
              cy="28"
              r="25"
              fill="none"
              stroke="url(#spinner-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="100 58"
            />
          </motion.svg>
        </div>

        {/* Text */}
        {companyName && (
          <p className="text-white font-semibold text-lg tracking-tight">
            {companyName}
          </p>
        )}
      </motion.div>
    </div>
  )
}
