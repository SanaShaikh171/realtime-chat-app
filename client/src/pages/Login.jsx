import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };
  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '4rem auto',
        fontFamily: 'sans-serif',
      }}
    >
      {' '}
      <h2>Login to CampusConnect</h2>{' '}
      <form onSubmit={handleSubmit}>
        {' '}
        <input
          placeholder="College Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            display: 'block',
            width: '100%',
            marginBottom: '1rem',
            padding: '0.5rem',
          }}
        />{' '}
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            display: 'block',
            width: '100%',
            marginBottom: '1rem',
            padding: '0.5rem',
          }}
        />{' '}
        {error && <p style={{ color: 'red' }}>{error}</p>}{' '}
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Login
        </button>{' '}
      </form>{' '}
      <p>
        New here? <Link to="/signup">Sign up</Link>
      </p>{' '}
    </div>
  );
}
export default Login;
