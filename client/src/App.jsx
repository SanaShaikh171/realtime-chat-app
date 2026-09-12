import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuth } from './context/AuthContext';
function Home() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {' '}
      <h1>Welcome to CampusConnect, {user?.name}!</h1>{' '}
      <button onClick={logout}>Logout</button>{' '}
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
