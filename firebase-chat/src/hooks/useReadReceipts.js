import { useEffect } from 'react'
import { markMessagesAsRead } from '../services/messages'

/**
 * 当用户查看聊天室时，将他人未读消息批量标记 readAt
 */
export function useReadReceipts(roomId, currentUserId, messages) {
  useEffect(() => {
    if (!roomId || !currentUserId || !messages.length) return

    const hasUnreadFromOthers = messages.some(
      (m) => m.senderId !== currentUserId && m.readAt == null,
    )

    if (hasUnreadFromOthers) {
      markMessagesAsRead(roomId, currentUserId).catch(console.error)
    }
  }, [roomId, currentUserId, messages])
}
