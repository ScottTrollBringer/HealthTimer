import { useReducer, useEffect, useState, useRef } from 'react'
import { type LucideIcon } from 'lucide-react'
import { timerReducer, createInitialState } from './timerReducer'
import { formatSeconds } from '../utils/formatTime'
import { parseTimeInput } from '../utils/parseTime'
import styles from './TimerWidget.module.css'

type TimerWidgetProps = {
  icon: LucideIcon
  label: string
  defaultSeconds: number
}

export function TimerWidget({ icon: Icon, label, defaultSeconds }: TimerWidgetProps) {
  const [state, dispatch] = useReducer(timerReducer, defaultSeconds, createInitialState)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (state.status !== 'running') return
    const startedAt = Date.now()
    let lastTick = 0
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      while (elapsed > lastTick) {
        lastTick++
        dispatch({ type: 'TICK' })
      }
    }, 200)
    return () => clearInterval(id)
  }, [state.status])

  function startEditing() {
    if (state.status !== 'stopped') return
    cancelledRef.current = false
    setDraft(formatSeconds(state.remaining))
    setIsEditing(true)
  }

  function commitEdit() {
    if (cancelledRef.current) return
    setIsEditing(false)
    const parsed = parseTimeInput(draft)
    if (parsed !== null) {
      dispatch({ type: 'SET_DEFAULT', payload: parsed })
    }
  }

  function cancelEdit() {
    cancelledRef.current = true
    setIsEditing(false)
  }

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <Icon
          size={16}
          className={state.status === 'alert' ? `${styles.icon} ${styles.alerting}` : styles.icon}
          onClick={() => { if (state.status === 'alert') dispatch({ type: 'DISMISS_ALERT' }) }}
        />
        <span className={styles.label}>{label}</span>
        {isEditing && state.status === 'stopped' ? (
          <input
            type="text"
            className={styles.timeInput}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
              else if (e.key === 'Escape') cancelEdit()
            }}
            onBlur={commitEdit}
            onFocus={(e) => e.target.select()}
            autoFocus
          />
        ) : (
          <span
            className={state.status === 'stopped' ? `${styles.time} ${styles.timeEditable}` : styles.time}
            onClick={startEditing}
          >
            {formatSeconds(state.remaining)}
          </span>
        )}
      </div>
      <div className={styles.controls}>
        {state.status === 'stopped' && (
          <button className={styles.btn} onClick={() => dispatch({ type: 'START' })}>Start</button>
        )}
        {state.status === 'running' && (
          <button className={styles.btn} onClick={() => dispatch({ type: 'PAUSE' })}>Pause</button>
        )}
        {state.status === 'paused' && (
          <button className={styles.btn} onClick={() => dispatch({ type: 'RESUME' })}>Resume</button>
        )}
        {state.status !== 'stopped' && (
          <button className={styles.btn} onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
        )}
      </div>
    </div>
  )
}
