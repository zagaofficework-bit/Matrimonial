import './ConversationList.css';

function timeAgo(dateString) {
  if (!dateString) return '';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// Chat page ka left panel - matched profiles ki conversations, WhatsApp ki
// chats list jaisa. Har item pe naam, last message aur unread badge.
export default function ConversationList({ conversations, loading, error, activeId, onSelect }) {
  return (
    <aside className="conv-list">
      <div className="conv-list-header">
        <h2>Messages</h2>
      </div>

      <div className="conv-list-body">
        {loading && <p className="state-message">Loading chats...</p>}
        {!loading && error && <p className="state-message">{error}</p>}
        {!loading && !error && conversations.length === 0 && (
          <p className="conv-list-empty">
            No conversations yet. Visit a match's profile and hit "Message" to start chatting!
          </p>
        )}

        {!loading &&
          !error &&
          conversations.map((conversation) => {
            const name = conversation.otherUser?.name || 'Member';
            const initial = name.charAt(0).toUpperCase();
            const isActive = String(conversation._id) === String(activeId);

            return (
              <button
                type="button"
                key={conversation._id}
                className={`conv-item ${isActive ? 'conv-item-active' : ''}`}
                onClick={() => onSelect(conversation._id)}
              >
                <span className="conv-avatar">
                  {conversation.otherUser?.photo ? (
                    <img src={conversation.otherUser.photo} alt={name} />
                  ) : (
                    initial
                  )}
                </span>

                <span className="conv-item-body">
                  <span className="conv-item-top">
                    <span className="conv-item-name">{name}</span>
                    <span className="conv-item-time">{timeAgo(conversation.lastMessageAt)}</span>
                  </span>
                  <span className="conv-item-bottom">
                    <span className="conv-item-preview">{conversation.lastMessage || 'Say hello 👋'}</span>
                    {conversation.unreadCount > 0 && (
                      <span className="conv-item-badge">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
      </div>
    </aside>
  );
}
