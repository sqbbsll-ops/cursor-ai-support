import { onDisconnect, onValue, ref, remove, set, serverTimestamp } from 'firebase/database'
import { rtdb } from '../firebase/config'

function typingRef(chatId, userId) {
  return ref(rtdb, `typing/${chatId}/${userId}`)
}

/** Set whether the current user is typing in a chat */
export async function setTyping(chatId, userId, displayName, isTyping) {
  const userTypingRef = typingRef(chatId, userId)

  if (!isTyping) {
    await remove(userTypingRef)
    return
  }

  await set(userTypingRef, {
    displayName,
    isTyping: true,
    updatedAt: serverTimestamp(),
  })

  await onDisconnect(userTypingRef).remove()
}

/** Subscribe to typing users in a chat (excludes current user) */
export function subscribeTyping(chatId, currentUserId, onTypingUsers) {
  const chatTypingRef = ref(rtdb, `typing/${chatId}`)

  return onValue(chatTypingRef, (snapshot) => {
    const data = snapshot.val() ?? {}
    const typingUsers = Object.entries(data)
      .filter(([uid, value]) => uid !== currentUserId && value?.isTyping)
      .map(([uid, value]) => ({
        uid,
        displayName: value.displayName ?? 'Someone',
      }))
    onTypingUsers(typingUsers)
  })
}
