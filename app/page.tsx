'use client'

import { motion } from 'framer-motion'
import { Calendar, TrendingUp, Palette, Sparkles } from 'lucide-react'

function G({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: 'linear-gradient(90deg, #a78bfa, #60a5fa, #22d3ee)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  )
}

const cards = [
  {
    Icon: Calendar,
    title: 'Book in a few clicks',
    description: (
      <>
        Schedule an appointment in a few clicks — <G>anywhere</G>, <G>anytime</G>.
        Simple for clients, powerful for your business.
      </>
    ),
  },
  {
    Icon: TrendingUp,
    title: 'Grow effortlessly',
    description: (
      <>
        <G>Fewer calls.</G> <G>More bookings.</G> <G>24/7 scheduling.</G>{' '}
        <G>Professional impression.</G>
      </>
    ),
  },
  {
    Icon: Palette,
    title: 'Your brand, your design',
    description: (
      <>
        Choose your style. Set <G>colors</G> that match your brand — and let the platform handle the rest.
      </>
    ),
  },
  {
    Icon: Sparkles,
    title: 'Built for conversion',
    description: (
      <>
        Create a <G>booking experience</G> that brings your clients from discovery to reservation — seamlessly.
      </>
    ),
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Home() {
  return (
    <main
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-6 py-20"
      style={{
        background: 'linear-gradient(135deg, #1e0a3c 0%, #0d1a4a 40%, #062a3f 70%, #0a1f35 100%)',
      }}
    >
      {/* Blob 1 — top left, violet */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: '-40px',
          left: '-40px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          opacity: 0.20,
          filter: 'blur(120px)',
        }}
      />
      {/* Blob 2 — right center, blue */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: '33.33%',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)',
          opacity: 0.15,
          filter: 'blur(120px)',
        }}
      />
      {/* Blob 3 — bottom left, cyan */}
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: '-80px',
          left: '33.33%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
          opacity: 0.15,
          filter: 'blur(100px)',
        }}
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center mb-16 relative z-10"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-5 text-white">
          <span
            style={{
              background: 'linear-gradient(90deg, #a78bfa, #60a5fa, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Jedro+
          </span>{' '}
          booking platform
        </h1>
        <p className="text-base md:text-lg text-white/70 max-w-xl mx-auto">
          A modern appointment scheduling platform for your business.
        </p>
      </motion.div>

      {/* Cards grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl w-full relative z-10"
      >
        {cards.map(({ Icon, title, description }, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            className="rounded-2xl p-6 flex flex-col gap-4"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <Icon className="w-5 h-5 text-white/80" />
            </div>
            <h3 className="text-white font-semibold text-base">{title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{description}</p>
          </motion.div>
        ))}
      </motion.div>
    </main>
  )
}
