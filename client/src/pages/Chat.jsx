import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/Chat.css';
function Chat() {
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const fileInputRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeStudent, setActiveStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL;
  useEffect(() => {
    axios
      .get(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStudents(res.data.filter((s) => s._id !== user.id)));
  }, []);
  useEffect(() => {
    if (!socket) return;
    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => socket.off('receive_message');
  }, [socket]);
  useEffect(() => {
    if (!socket) return;
    socket.on('message_deleted', (messageId) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });
    return () => socket.off('message_deleted');
  }, [socket]);
  const openChatWith = async (student) => {
    setActiveStudent(student);
    const res = await axios.post(
      `${API}/api/conversations/dm`,
      { otherUserId: student._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const conversation = res.data;
    setActiveConversation(conversation);
    const msgRes = await axios.get(`${API}/api/messages/${conversation._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessages(msgRes.data);
    socket.emit('join_room', conversation._id);
  };
  const sendMessage = () => {
    if (!activeConversation) return;
    if (!text.trim()) return;
    socket.emit('send_message', {
      conversationId: activeConversation._id,
      senderId: user.id,
      text,
    });
    setText('');
  };
  const sendMediaMessage = (file) => {
    if (!file || !activeConversation) return;
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) return;

    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('send_message', {
        conversationId: activeConversation._id,
        senderId: user.id,
        text: reader.result,
        attachmentType: isImage ? 'image' : 'pdf',
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    sendMediaMessage(file);
    event.target.value = '';
  };
  const deleteMessage = (messageId) => {
    socket.emit('delete_message', {
      messageId,
      conversationId: activeConversation._id,
      userId: user.id,
    });
  };
  const hideStudent = async (studentId, e) => {
    e.stopPropagation();
    await axios.patch(
      `${API}/api/users/hide/${studentId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setStudents((prev) => prev.filter((s) => s._id !== studentId));
  };
  const deleteConversation = async () => {
    if (!activeConversation) return;
    const confirmed = window.confirm(
      'Delete this entire conversation? This cannot be undone.'
    );
    if (!confirmed) return;
    await axios.delete(`${API}/api/conversations/${activeConversation._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setActiveConversation(null);
    setActiveStudent(null);
    setMessages([]);
  };
  const initials = (name) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  return (
    <div className="chat-page">
      {' '}
      <div className="sidebar">
        {' '}
        <div className="sidebar-header">
          {' '}
          <div className="sidebar-user">
            {' '}
            <div className="avatar-circle">{initials(user?.name)}</div>{' '}
            <span>{user?.name}</span>{' '}
          </div>{' '}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {' '}
            <ThemeToggle />{' '}
            <button className="icon-btn" onClick={logout} title="Logout">
              ⏻
            </button>{' '}
          </div>{' '}
        </div>{' '}
        <div className="sidebar-title">Students</div>{' '}
        <div style={{ overflowY: 'auto' }}>
          {' '}
          {students.map((s) => (
            <div
              key={s._id}
              onClick={() => openChatWith(s)}
              className={`student-item ${activeStudent?._id === s._id ? 'active' : ''}`}
            >
              {' '}
              <span
                className={`status-dot ${onlineUsers.includes(s._id) ? 'online' : 'offline'}`}
              ></span>{' '}
              <span style={{ flex: 1 }}>{s.name}</span>{' '}
              <button
                onClick={(e) => hideStudent(s._id, e)}
                className="hide-btn"
                title="Remove from list"
              >
                ✕
              </button>{' '}
            </div>
          ))}{' '}
        </div>{' '}
      </div>{' '}
      <div className="chat-main">
        {' '}
        {activeConversation ? (
          <>
            {' '}
            <div
              className="chat-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                {' '}
                {activeStudent?.name}{' '}
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginLeft: '0.6rem',
                    fontFamily: 'Inter',
                  }}
                >
                  {' '}
                  {onlineUsers.includes(activeStudent?._id)
                    ? 'Online'
                    : 'Offline'}{' '}
                </span>{' '}
              </div>{' '}
              <button
                onClick={deleteConversation}
                className="delete-conv-btn"
                title="Delete conversation"
              >
                🗑️
              </button>{' '}
            </div>{' '}
            <div className="messages-area">
              {' '}
              {messages.map((m) => {
                const isOwn = m.sender._id === user.id || m.sender === user.id;
                const renderAttachment = () => {
                  if (!m.attachmentType) return m.text;
                  if (m.attachmentType === 'image') {
                    return (
                      <img
                        src={m.text}
                        alt={m.fileName || 'Shared image'}
                        className="message-attachment image"
                      />
                    );
                  }
                  if (m.attachmentType === 'pdf') {
                    return (
                      <a
                        href={m.text}
                        target="_blank"
                        rel="noreferrer"
                        className="message-attachment pdf"
                      >
                        {m.fileName || 'Open PDF'}
                      </a>
                    );
                  }
                  return m.text;
                };
                return (
                  <div
                    key={m._id}
                    className={`message-row ${isOwn ? 'own' : 'other'}`}
                  >
                    {' '}
                    <div className={`bubble ${isOwn ? 'own' : 'other'}`}>
                      {' '}
                      {renderAttachment()}
                      <span className="bubble-time">
                        {' '}
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                      </span>{' '}
                      {isOwn && (
                        <button
                          onClick={() => deleteMessage(m._id)}
                          className="delete-msg-btn"
                          title="Delete message"
                        >
                          ✕
                        </button>
                      )}{' '}
                    </div>{' '}
                  </div>
                );
              })}{' '}
            </div>{' '}
            <div className="message-input-row">
              {' '}
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
              />{' '}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                className="attach-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Send image or PDF"
              >
                📎
              </button>{' '}
              <button className="send-btn" onClick={sendMessage}>
                Send
              </button>{' '}
            </div>{' '}
          </>
        ) : (
          <div className="empty-state">Pick a classmate to start chatting</div>
        )}{' '}
      </div>{' '}
    </div>
  );
}
export default Chat;
