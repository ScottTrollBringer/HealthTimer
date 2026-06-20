import { Heart } from 'lucide-react'
import styles from './WipBand.module.css'

function WipBand(): React.JSX.Element {
  return (
    <div className={styles.band}>
      <Heart size={12} className={styles.icon} />
      <span className={styles.label}>WIP</span>
      <button className={styles.toggleBtn} disabled>
        ON/OFF
      </button>
    </div>
  )
}

export default WipBand
