'use client'
import { motion } from 'framer-motion'
import type { MouseEventHandler, ReactNode } from 'react'

const PRESS_TRANSITION = { duration: 0.05 }
const RELEASE_TRANSITION = { type: 'spring', stiffness: 400, damping: 15 } as const

interface Props {
  children: ReactNode
  className?: string
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  'aria-label'?: string
  type?: 'button' | 'submit' | 'reset'
}

export function AnimatedButton({ disabled, children, ...props }: Props) {
  return (
    <motion.button
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.95, transition: PRESS_TRANSITION }}
      transition={RELEASE_TRANSITION}
      {...props}
    >
      {children}
    </motion.button>
  )
}
