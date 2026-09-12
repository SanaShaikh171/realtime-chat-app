import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuth } from './context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSocket } from './context/SocketContext';
function Home() {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [students, setStudents] = useState([]);
  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    };
    fetchStudents();
  }, []);
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {' '}
      <h1>Welcome to CampusConnect, {user?.name}!</h1>{' '}
      <button onClick={logout}>Logout</button> <h3>Students</h3>{' '}
      <ul>
        {' '}
        {students.map((s) => (
          <li key={s._id}>
            {' '}
            {onlineUsers.includes(s._id) ? '🟢' : '⚪'} {s.name}{' '}
          </li>
        ))}{' '}
      </ul>{' '}
    </div>
  );
}
function App() {
  const { user } = useAuth();
  return (
    <Routes>
      {' '}
      <Route path="/signup" element={<Signup />} />{' '}
      <Route path="/login" element={<Login />} />{' '}
      <Route path="/" element={user ? <Home /> : <Login />} />{' '}
    </Routes>
  );
}
export default App;
