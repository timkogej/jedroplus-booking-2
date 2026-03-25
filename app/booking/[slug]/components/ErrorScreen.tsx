'use client'

import { motion } from 'framer-motion'
import { Theme, DEFAULT_THEME, computeCssVars } from '@/lib/types'

interface ErrorScreenProps {
  error: string
  theme?: Theme
  onRetry?: () => void
}

export default function ErrorScreen({ error, theme = DEFAULT_THEME, onRetry }: ErrorScreenProps) {
  const cssVars = computeCssVars(theme)
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgTo})`,
        ...cssVars,
      } as React.CSSProperties}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[var(--s2)] backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center border border-[var(--b2)]"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center"
        >
          <svg
            className="w-10 h-10 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-display text-[var(--t-primary)] font-semibold mb-3"
        >
          Ups, nekaj je šlo narobe
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[var(--t-muted)] mb-6"
        >
          {error}
        </motion.p>

        {onRetry && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="px-6 py-3 rounded-xl font-medium text-white transition-all"
            style={{
              backgroundColor: theme.primaryColor,
              boxShadow: `0 10px 30px ${theme.primaryColor}40`,
            }}
          >
            Poskusi znova
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
