import { motion, useReducedMotion } from 'motion/react'
import Icon from './Icon'

export default function Spinner() {
  const reduceMotion = useReducedMotion()
  return <motion.span className="spinner" aria-hidden="true" animate={{ rotate: reduceMotion ? 0 : 360 }}
    transition={reduceMotion ? { duration: 0 } : { duration: 1, repeat: Infinity, ease: 'linear' }}>
    <Icon name="loader" />
  </motion.span>
}
