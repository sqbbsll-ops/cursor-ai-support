import { useEffect, useState } from 'react'
import { subscribeMessages } from '../services/messages'

export function useMessages(roomId) {
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return undefined

    setLoading(true)
    const unsubscribe = subscribeMessages(
      roomId,
      (nextMessages) => {
        setMessages(nextMessages)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [roomId])

  return { messages, error, loading }
}
