import { useEffect, useRef, useState } from 'react';
import { getMessages, markConversationRead, sendMessageRest } from '../../api/chat.api';
import { useAuth } from '../../context/AuthContext';
import './ChatWindow.css';

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Chat page ka right panel - selected conversation ki live messages.
// Socket.IO se real-time bhejta/receive karta hai; socket connect nahi hai
// to REST call se fallback ho jaata hai taaki message bhejna kabhi na ruke.
export default function ChatWindow({ conversationId, conversation, socket, connected, onBack, onMessageSent, onRead }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Conversation badalte hi purani messages (REST se) load karo aur unread
  // messages ko read mark kar do. Ye sirf conversationId pe depend karta
  // hai - socket ready ho ya na ho, purani history hamesha load honi chahiye.
  useEffect(() => {
    if (!conversationId) return undefined;

    setLoading(true);
    setMessages([]);
    setPeerTyping(false);

    getMessages(conversationId)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));

    markConversationRead(conversationId)
      .then(() => onRead?.(conversationId))
      .catch(() => {});
  }, [conversationId]);

  // Socket room join/leave - `connected` ko bhi dependency me rakha hai
  // kyunki page load hote hi socket turant connect nahi hota (async
  // handshake). Pehle sirf [conversationId] pe depend karta tha, isliye
  // agar effect socket connect hone se PEHLE chal jaata (jo aksar hota
  // tha), to `chat:join` kabhi emit hi nahi hota tha aur us conversation
  // ke real-time messages kabhi milte hi nahi the jab tak dusra
  // conversation select na karo. Ab connect/reconnect hote hi room
  // dobara join ho jaata hai.
  useEffect(() => {
    if (!conversationId || !connected) return undefined;

    const currentSocket = socket.current;
    if (!currentSocket) return undefined;

    currentSocket.emit('chat:join', conversationId);

    return () => {
      currentSocket.emit('chat:leave', conversationId);
    };
  }, [socket, conversationId, connected]);

  // Naye messages aur typing indicator ke liye socket events sunta hai.
  // Yahan bhi `connected` dependency zaroori hai - warna listener socket
  // ke actually connect hone se pehle hi (currentSocket null hone ki
  // wajah se) attach hone se reh jaata tha aur naye messages kabhi UI me
  // aate hi nahi the, chahe wo apna bheja hua ho ya doosre ka.
  useEffect(() => {
    if (!conversationId || !connected) return undefined;

    const currentSocket = socket.current;
    if (!currentSocket) return undefined;

    function handleIncoming(message) {
      if (String(message.conversation) !== String(conversationId)) return;
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(message._id))) return prev;
        return [...prev, message];
      });
      if (String(message.sender) !== String(user?._id)) {
        markConversationRead(conversationId).then(() => onRead?.(conversationId)).catch(() => {});
      }
    }

    function handleTyping({ conversationId: cid, userId, isTyping }) {
      if (String(cid) !== String(conversationId) || String(userId) === String(user?._id)) return;
      setPeerTyping(isTyping);
    }

    currentSocket.on('chat:message', handleIncoming);
    currentSocket.on('chat:typing', handleTyping);

    return () => {
      currentSocket.off('chat:message', handleIncoming);
      currentSocket.off('chat:typing', handleTyping);
    };
  }, [socket, conversationId, connected, user, onRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function handleTypingChange(value) {
    setText(value);
    const currentSocket = socket.current;
    if (!currentSocket || !conversationId) return;

    currentSocket.emit('chat:typing', { conversationId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      currentSocket.emit('chat:typing', { conversationId, isTyping: false });
    }, 1500);
  }

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || !conversationId) return;

    setSending(true);
    setText('');
    const currentSocket = socket.current;

    try {
      if (currentSocket?.connected) {
        currentSocket.emit('chat:message', { conversationId, text: trimmed }, (ack) => {
          if (!ack?.success) setText(trimmed);
        });
      } else {
        const message = await sendMessageRest(conversationId, trimmed);
        setMessages((prev) => [...prev, message]);
      }
      onMessageSent?.(conversationId, trimmed, new Date().toISOString());
    } catch {
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  if (!conversationId) {
    return (
      <section className="chat-window chat-window-empty">
        <div className="chat-window-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>Select a conversation to start chatting</p>
        </div>
      </section>
    );
  }

  const name = conversation?.otherUser?.name || 'Member';
  const initial = name.charAt(0).toUpperCase();

  return (
    <section className="chat-window">
      <header className="chat-window-header">
        <button type="button" className="chat-window-back" onClick={onBack} aria-label="Back to chats">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="conv-avatar chat-window-avatar">
          {conversation?.otherUser?.photo ? <img src={conversation.otherUser.photo} alt={name} /> : initial}
        </span>
        <div className="chat-window-title">
          <h3>{name}</h3>
          {peerTyping && <span className="chat-window-typing">typing...</span>}
        </div>
      </header>

      <div className="chat-window-messages">
        {loading && <p className="state-message">Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="chat-window-empty-msg">No messages yet. Say hello 👋</p>
        )}
        {!loading &&
          messages.map((message) => {
            const isMine = String(message.sender) === String(user?._id);
            return (
              <div key={message._id} className={`chat-bubble-row ${isMine ? 'chat-bubble-row-mine' : ''}`}>
                <div className={`chat-bubble ${isMine ? 'chat-bubble-mine' : ''}`}>
                  <p>{message.text}</p>
                  <span className="chat-bubble-time">{formatTime(message.createdAt)}</span>
                </div>
              </div>
            );
          })}
        <div ref={bottomRef} />
      </div>

      <form className="chat-window-input" onSubmit={handleSend}>
        <input
          type="text"
          value={text}
          onChange={(e) => handleTypingChange(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={!text.trim() || sending}>
          Send
        </button>
      </form>
    </section>
  );
}
