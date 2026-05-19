import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config'

function messagesRef(roomId) {
  return collection(db, 'rooms', roomId, 'messages')
}

/** 发送消息，readAt 初始为 null */
export async function sendMessage(roomId, { text, senderId, senderName }) {
  return addDoc(messagesRef(roomId), {
    text: text.trim(),
    senderId,
    senderName,
    createdAt: serverTimestamp(),
    readAt: null,
  })
}

/** 实时订阅房间消息（按时间升序） */
export function subscribeMessages(roomId, onMessages, onError) {
  const q = query(messagesRef(roomId), orderBy('createdAt', 'asc'))
  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      onMessages(messages)
    },
    onError,
  )
}

/** 将他人发送且未读的消息标记为已读 */
export async function markMessagesAsRead(roomId, currentUserId) {
  const q = query(messagesRef(roomId), where('readAt', '==', null))
  const snapshot = await getDocs(q)
  const unreadFromOthers = snapshot.docs.filter(
    (d) => d.data().senderId !== currentUserId,
  )
  if (!unreadFromOthers.length) return

  const batch = writeBatch(db)
  unreadFromOthers.forEach((messageDoc) => {
    batch.update(messageDoc.ref, { readAt: serverTimestamp() })
  })
  await batch.commit()
}

/** 单条消息标记已读（可选） */
export async function markMessageAsRead(roomId, messageId) {
  const messageRef = doc(db, 'rooms', roomId, 'messages', messageId)
  await updateDoc(messageRef, { readAt: serverTimestamp() })
}
