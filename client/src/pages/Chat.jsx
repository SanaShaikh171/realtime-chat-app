import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/Chat.css';
function Chat() {
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
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
    if (!text.trim() || !activeConversation) return;
    socket.emit('send_message', {
      conversationId: activeConversation._id,
      senderId: user.id,
      text,
    });
    setText('');
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
              {s.name}{' '}
            </div>
          ))}{' '}
        </div>{' '}
      </div>{' '}
      <div className="chat-main">
        {' '}
        {activeConversation ? (
          <>
            {' '}
            <div className="chat-header">
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
            <div className="messages-area">
              {' '}
              {messages.map((m) => {
                const isOwn = m.sender._id === user.id || m.sender === user.id;
                return (
                  <div
                    key={m._id}
                    className={`message-row ${isOwn ? 'own' : 'other'}`}
                  >
                    {' '}
                    <div className={`bubble ${isOwn ? 'own' : 'other'}`}>
                      {' '}
                      {m.text}{' '}
                      <span className="bubble-time">
                        {' '}
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                      </span>{' '}
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
