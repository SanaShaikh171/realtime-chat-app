import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/Auth.css';
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
        { email, password }
      );
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };
  return (
    <div className="auth-page">
      {' '}
      <div className="auth-hero">
        {' '}
        <ThemeToggle /> <div className="auth-hero-brand">
          CampusConnect
        </div>{' '}
        <h1>
          Somewhere on campus, someone's still awake on the same problem set.
        </h1>{' '}
        <p>
          Find your classmates, ask the question you didn't get to in class, and
          keep your study group in one quiet place.
        </p>{' '}
      </div>{' '}
      <div className="auth-form-panel">
        {' '}
        <form onSubmit={handleSubmit}>
          {' '}
          <h2>Welcome back</h2>{' '}
          <p className="auth-subtext">Log in to see who's online.</p>{' '}
          {error && <p className="error-text">{error}</p>}{' '}
          <div className="field">
            {' '}
            <label>College email</label>{' '}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />{' '}
          </div>{' '}
          <div className="field">
            {' '}
            <label>Password</label>{' '}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />{' '}
          </div>{' '}
          <button type="submit" className="btn-primary">
            Log in
          </button>{' '}
          <p className="auth-switch">
            New here? <Link to="/signup">Create an account</Link>
          </p>{' '}
        </form>{' '}
      </div>{' '}
    </div>
  );
}
export default Login;
