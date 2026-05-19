import styles from './TypingIndicator.module.css'

export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers.length) return null

  return (
    <div
      className={styles.wrapper}
      role="status"
      aria-live="polite"
      aria-label="Someone is typing"
    >
      <div className={styles.bubble}>
        <span className={styles.label}>
          typing
          <span className={styles.dots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </span>
      </div>
    </div>
  )
}
