import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5002/api/auth/login', { email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-container">
      <div className="auth-card fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <ShieldAlert size={48} color="var(--primary-blue)" />
        </div>
        <h2>Sign In</h2>
        {error && <div className="safety-suggestion">{error}</div>}
        
        <form onSubmit={submitHandler} style={{ marginTop: '2rem' }}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          New user? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
