import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConversationList from '../../components/ConversationList/ConversationList';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import { getConversations } from '../../api/chat.api';
import { useChatSocket } from '../../hooks/useChatSocket';
import './Chat.css';

// WhatsApp jaisa split-view chat page: left side matched profiles ki
// conversations, right side selected conversation ki live chat.
// PublicProfile ke "Message" button se seedha /chat/:conversationId khulta
// hai; Navbar ke "Messages" link se plain /chat (list only).
export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { socket, connected } = useChatSocket();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConversations = useCallback(() => {
    getConversations()
      .then(setConversations)
      .catch((err) => setError(err.response?.data?.message || 'Conversations load nahi ho payi.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Kisi bhi conversation me naya message aane pe list ko re-order/update
  // karta hai, chahe wo conversation abhi khuli ho ya nahi.
  // `connected` dependency zaroori hai - pehle sirf [socket] pe depend
  // karta tha (socket ek stable ref hai isliye ye effect sirf ek baar
  // chalta tha), aur agar wo ek baar socket.current abhi null tha (socket
  // connect hone se pehle), to listener kabhi attach hi nahi hota tha aur
  // list kabhi live update nahi hoti thi.
  useEffect(() => {
    if (!connected) return undefined;

    const currentSocket = socket.current;
    if (!currentSocket) return undefined;

    function handleConversationUpdated(summary) {
      setConversations((prev) => {
        const others = prev.filter((c) => String(c._id) !== String(summary._id));
        return [summary, ...others];
      });
    }

    currentSocket.on('chat:conversation-updated', handleConversationUpdated);
    return () => currentSocket.off('chat:conversation-updated', handleConversationUpdated);
  }, [socket, connected]);

  function handleSelectConversation(id) {
    navigate(`/chat/${id}`);
  }

  function handleMessageSent(id, textSent, createdAt) {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        String(c._id) === String(id) ? { ...c, lastMessage: textSent, lastMessageAt: createdAt } : c
      );
      const target = updated.find((c) => String(c._id) === String(id));
      const others = updated.filter((c) => String(c._id) !== String(id));
      return target ? [target, ...others] : updated;
    });
  }

  function handleConversationRead(id) {
    setConversations((prev) =>
      prev.map((c) => (String(c._id) === String(id) ? { ...c, unreadCount: 0 } : c))
    );
  }

  const activeConversation = conversations.find((c) => String(c._id) === String(conversationId));

  return (
    <div className="chat-page-container">
      <button type="button" className="chat-back-link" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className={`chat-shell ${conversationId ? 'chat-shell-active' : ''}`}>
        <ConversationList
          conversations={conversations}
          loading={loading}
          error={error}
          activeId={conversationId}
          onSelect={handleSelectConversation}
        />

        <ChatWindow
          conversationId={conversationId}
          conversation={activeConversation}
          socket={socket}
          connected={connected}
          onBack={() => navigate('/chat')}
          onMessageSent={handleMessageSent}
          onRead={handleConversationRead}
        />
      </div>
    </div>
  );
}