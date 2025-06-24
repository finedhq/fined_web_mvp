import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/SignInPage.css';

const SignInPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);


     setTimeout(() => {
    setLoading(false);
    navigate('/home');  
  }, 1000);
  };

  const handleGoogleLogin = () => {
    alert('Google sign-in (placeholder)');
    navigate('/dashboard');
  };

  const handleFacebookLogin = () => {
    alert('Facebook sign-in (placeholder)');
    navigate('/dashboard');
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <button className="back-button" onClick={() => navigate(-1)}>←</button>

        <img src="/logo.jpg" alt="FinEd Logo" className="logo" />

        <button className="social-btn fb" onClick={handleFacebookLogin}>
          <img src="https://img.icons8.com/color/48/facebook-new.png" alt="Facebook" />
          Continue with Facebook
        </button>

        <button className="social-btn google" onClick={handleGoogleLogin}>
          <img src="https://img.icons8.com/color/48/google-logo.png" alt="Google" />
          Continue with Google
        </button>

        <div className="divider"><span>OR</span></div>

        <form className="signin-form" onSubmit={handleSubmit}>
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

          <div className="forgot-password" onClick={() => navigate('/forgot-password')}>
            Forgot your password?
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="plain-line"></div>

        <div className="footer">
          Don't have an account?
        </div>

        <button className="login-btn" onClick={() => navigate('/signup')}>
          Create an account
        </button>
      </div>
    </div>
  );
};

export default SignInPage;