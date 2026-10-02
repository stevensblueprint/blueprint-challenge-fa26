import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'

export default function ActionButton({ children, disabled, ...props }: HTMLMotionProps<'button'>) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.button
      type="button" disabled={disabled}
      whileHover={disabled || reduceMotion ? undefined : { y: -1 }}
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 440, damping: 28 }}
      {...props}
    >{children}</motion.button>
  )
}
