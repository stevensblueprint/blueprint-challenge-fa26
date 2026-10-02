import { motion, useReducedMotion } from 'motion/react'
import Icon from './Icon'

export default function Feedback({ message, error = false }: { message: string; error?: boolean }) {
  const reduceMotion = useReducedMotion()
  if (!message) return null
  return <motion.p key={message} className={`${error ? 'error' : 'notice'} feedback`} role={error ? 'alert' : 'status'}
    initial={{ opacity: 0, y: reduceMotion ? 0 : -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}>
    <Icon name={error ? 'error' : 'check'} size={21} /><span>{message}</span>
  </motion.p>
}
