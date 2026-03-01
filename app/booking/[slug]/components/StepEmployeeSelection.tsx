'use client'

import { motion } from 'framer-motion'
import { Theme, EmployeeUI } from '@/lib/types'

interface StepEmployeeSelectionProps {
  theme: Theme
  employees: EmployeeUI[]
  selectedEmployeeId: string | null
  anyPerson: boolean
  onSelectEmployee: (employee: EmployeeUI | null) => void
  onSelectAnyPerson: (value: boolean) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { y: 20 },
  visible: { y: 0, transition: { duration: 0.28 } },
}

export default function StepEmployeeSelection({
  theme,
  employees,
  selectedEmployeeId,
  anyPerson,
  onSelectEmployee,
  onSelectAnyPerson,
}: StepEmployeeSelectionProps) {
  const handleSelectEmployee = (employee: EmployeeUI) => {
    onSelectAnyPerson(false)
    onSelectEmployee(employee)
  }

  const handleSelectAnyPerson = () => {
    onSelectEmployee(null)
    onSelectAnyPerson(true)
  }

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
          Izberite osebo
        </h2>
        <p className="text-white/60 font-display">
          Kdo naj izvede vašo storitev?
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 max-w-2xl mx-auto"
      >
        {/* Any Person Option */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSelectAnyPerson}
          className={`
            relative p-5 rounded-2xl border-2 transition-all duration-300
            flex items-center gap-4 text-left w-full
            ${anyPerson
              ? 'bg-white/20 border-white'
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }
          `}
          style={anyPerson ? {
            borderColor: theme.primaryColor,
            boxShadow: `0 10px 30px ${theme.primaryColor}30`,
          } : {}}
        >
          <div className="flex-1">
            <p className="text-white font-display font-semibold text-lg">Kdorkoli</p>
            <p className="text-white/60 font-display text-sm">Izberite najboljši termin zame</p>
          </div>

          {anyPerson && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/40 text-sm font-display">ali izberite osebo</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Employees */}
        {employees.map((employee) => {
          const isSelected = selectedEmployeeId === employee.id && !anyPerson

          return (
            <motion.button
              key={employee.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectEmployee(employee)}
              className={`
                relative p-5 rounded-2xl backdrop-blur-xl border-2 transition-all duration-300
                flex items-center gap-4 text-left w-full
                ${isSelected
                  ? 'bg-white/20 border-white'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
              style={isSelected ? {
                borderColor: theme.primaryColor,
                boxShadow: `0 10px 30px ${theme.primaryColor}30`,
              } : {}}
            >
              <div className="flex-1">
                <p className="text-white font-display font-semibold text-lg">{employee.label}</p>
                {employee.subtitle && (
                  <p className="text-white/60 font-display text-sm">{employee.subtitle}</p>
                )}
              </div>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
