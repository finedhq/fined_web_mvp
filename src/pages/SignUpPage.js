import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/SignUpPage.css';

const SignUpPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword] = useState(false);
  const [showConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);


     setTimeout(() => {
    setLoading(false);
    navigate('/home');  
  }, 1000);
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <button className="back-button" onClick={() => navigate(-1)}>←</button>

        <img src="/logo.jpg" alt="FinEd Logo" className="logo" />

        <button className="social-btn fb">
          <img src="https://img.icons8.com/color/48/facebook-new.png" alt="Facebook" />
          Continue with Facebook
        </button>

        <button className="social-btn google">
          <img src="https://img.icons8.com/color/48/google-logo.png" alt="Google" />
          Continue with Google
        </button>

        <div className="divider"><span>OR</span></div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-wrapper">
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="password-wrapper">
            <input 
              type={showConfirm ? 'text' : 'password'} 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <label className="checkbox-container">
            <input type="checkbox" />
            Subscribe to our newsletter
          </label>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <div className="plain-line"></div>

        <div className="footer">
          Already have an account?
        </div>

        <button className="login-btn" onClick={() => navigate('/signin')}>
          Log In
        </button>
      </div>
    </div>
  );
};

export default SignUpPage;
