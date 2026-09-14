import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/Auth.css';
function Signup() {
  const [name, setName] = useState('');
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
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        { name, email, password }
      );
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
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
        <h1>Your study group, minus the group project chaos.</h1>{' '}
        <p>
          One quiet place for direct messages and study rooms — no lost WhatsApp
          threads, no chasing people down.
        </p>{' '}
      </div>{' '}
      <div className="auth-form-panel">
        {' '}
        <form onSubmit={handleSubmit}>
          {' '}
          <h2>Create your account</h2>{' '}
          <p className="auth-subtext">Takes less than a minute.</p>{' '}
          {error && <p className="error-text">{error}</p>}{' '}
          <div className="field">
            {' '}
            <label>Full name</label>{' '}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />{' '}
          </div>{' '}
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
            Sign up
          </button>{' '}
          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>{' '}
        </form>{' '}
      </div>{' '}
    </div>
  );
}
export default Signup;
