import { useState } from 'react'
import { Droplet, Coffee, Eye, Armchair } from 'lucide-react'
import { TimerWidget } from './timer/TimerWidget'
import WipBand from './wip/WipBand'
import {
  DEFAULT_HEALTH_SECONDS,
  DEFAULT_LONG_BREAK_SECONDS,
  DEFAULT_EYE_SECONDS,
  DEFAULT_SITTING_SECONDS,
} from './timer/timerReducer'
import styles from './App.module.css'

function App(): React.JSX.Element {
  const [alwaysOnTop, setAlwaysOnTopState] = useState(false)

  function handleToggle() {
    const next = !alwaysOnTop
    setAlwaysOnTopState(next)
    window.electronAPI?.setAlwaysOnTop(next)
  }

  return (
    <div className={styles.app}>
      <button
        className={`${styles.toggleBtn} ${alwaysOnTop ? styles.toggleBtnActive : ''}`}
        aria-pressed={alwaysOnTop}
        onClick={handleToggle}
      >
        Always on top
      </button>
      <TimerWidget icon={Droplet} label="Health gestures" defaultSeconds={DEFAULT_HEALTH_SECONDS} />
      <TimerWidget icon={Coffee} label="Long break" defaultSeconds={DEFAULT_LONG_BREAK_SECONDS} />
      <TimerWidget icon={Eye} label="Eye rest" defaultSeconds={DEFAULT_EYE_SECONDS} />
      <TimerWidget icon={Armchair} label="Sitting" defaultSeconds={DEFAULT_SITTING_SECONDS} />
      <WipBand />
    </div>
  )
}

export default App
