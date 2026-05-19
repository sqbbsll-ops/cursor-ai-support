import { useCallback, useEffect, useRef, useState } from 'react'
import { setTyping, subscribeTyping } from '../services/typing'

const TYPING_STOP_MS = 2000

export function useTyping(chatId, user) {
  const [typingUsers, setTypingUsers] = useState([])
  const stopTimer = useRef(null)

  useEffect(() => {
    if (!chatId || !user?.uid) return undefined
    return subscribeTyping(chatId, user.uid, setTypingUsers)
  }, [chatId, user?.uid])

  const notifyTyping = useCallback(
    (isTyping) => {
      if (!chatId || !user?.uid) return

      const displayName = user.displayName || user.email || 'User'

      if (stopTimer.current) {
        clearTimeout(stopTimer.current)
        stopTimer.current = null
      }

      if (!isTyping) {
        setTyping(chatId, user.uid, displayName, false)
        return
      }

      setTyping(chatId, user.uid, displayName, true)

      stopTimer.current = setTimeout(() => {
        setTyping(chatId, user.uid, displayName, false)
        stopTimer.current = null
      }, TYPING_STOP_MS)
    },
    [chatId, user],
  )

  useEffect(() => {
    return () => {
      if (stopTimer.current) clearTimeout(stopTimer.current)
      if (chatId && user?.uid) {
        const displayName = user.displayName || user.email || 'User'
        setTyping(chatId, user.uid, displayName, false)
      }
    }
  }, [chatId, user])

  return { typingUsers, notifyTyping }
}
