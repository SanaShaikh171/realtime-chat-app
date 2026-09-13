import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
function Chat() {
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [students, setStudents] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const token = localStorage.getItem('token');
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/users`, {
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
  const openChatWith = async (otherUserId) => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/conversations/dm`,
      { otherUserId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const conversation = res.data;
    setActiveConversation(conversation);
    const msgRes = await axios.get(
      `http://localhost:5000/api/messages/${conversation._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
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
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {' '}
      <div
        style={{
          width: '250px',
          borderRight: '1px solid #ccc',
          padding: '1rem',
        }}
      >
        {' '}
        <h3>{user?.name}</h3> <button onClick={logout}>Logout</button>{' '}
        <h4>Students</h4>{' '}
        {students.map((s) => (
          <div
            key={s._id}
            onClick={() => openChatWith(s._id)}
            style={{
              padding: '0.5rem',
              cursor: 'pointer',
              background: activeConversation?.participants?.some(
                (p) => p._id === s._id
              )
                ? '#eee'
                : 'transparent',
            }}
          >
            {' '}
            {onlineUsers.includes(s._id) ? '🟢' : '⚪'} {s.name}{' '}
          </div>
        ))}{' '}
      </div>{' '}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
        }}
      >
        {' '}
        {activeConversation ? (
          <>
            {' '}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
              {' '}
              {messages.map((m) => (
                <div key={m._id} style={{ marginBottom: '0.5rem' }}>
                  {' '}
                  <strong>{m.sender.name}:</strong> {m.text}{' '}
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#888',
                      marginLeft: '0.5rem',
                    }}
                  >
                    {' '}
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                  </span>{' '}
                </div>
              ))}{' '}
            </div>{' '}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {' '}
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '0.5rem' }}
              />{' '}
              <button onClick={sendMessage}>Send</button>{' '}
            </div>{' '}
          </>
        ) : (
          <p>Select a student to start chatting</p>
        )}{' '}
      </div>{' '}
    </div>
  );
}
export default Chat;
