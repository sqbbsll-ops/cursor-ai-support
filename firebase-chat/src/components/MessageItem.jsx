import styles from './MessageItem.module.css'

function formatTime(timestamp) {
  if (!timestamp?.toDate) return ''
  return timestamp.toDate().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function MessageItem({ message, isOwn }) {
  const time = formatTime(message.createdAt)

  return (
    <div
      className={`${styles.message} ${isOwn ? styles.own : styles.other}`}
    >
      {!isOwn && (
        <span className={styles.sender}>{message.senderName}</span>
      )}

      <div className={styles.bubble}>
        <p className={styles.text}>{message.text}</p>
        {time && <time className={styles.time}>{time}</time>}
      </div>

      {isOwn && message.readAt && (
        <span className={styles.readLabel}>Read</span>
      )}
    </div>
  )
}
