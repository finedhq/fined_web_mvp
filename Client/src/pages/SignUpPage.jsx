import { useAuth0 } from '@auth0/auth0-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const SignUpPage = () => {
  const navigate = useNavigate();
  const {loginWithRedirect}=useAuth0();

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
    <div className="font-sans bg-gray-50 py-10"> 
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl p-10 shadow-lg text-center relative"> 
        <button className="absolute top-5 left-5 bg-transparent border-none text-2xl cursor-pointer text-gray-600" onClick={() => navigate(-1)}>
          ←
        </button>

        <img src="/logo.jpg" alt="FinEd Logo" className="w-24 mx-auto my-5" /> 

        <button className="w-11/12 py-2.5 px-4 mx-auto my-2.5 rounded-full cursor-pointer border border-black transition-colors duration-300 flex items-center justify-center bg-white max-w-sm hover:bg-gray-100" onClick={loginWithRedirect}> {/* .social-btn */}
          <img src="https://img.icons8.com/color/48/facebook-new.png" alt="Facebook" className="w-6 h-6 mr-2" /> 
          Continue with Facebook
        </button>

        <button className="w-11/12 py-2.5 px-4 mx-auto my-2.5 rounded-full cursor-pointer border border-black transition-colors duration-300 flex items-center justify-center bg-white max-w-sm hover:bg-gray-100" onClick={loginWithRedirect}> {/* .social-btn */}
          <img src="https://img.icons8.com/color/48/google-logo.png" alt="Google" className="w-6 h-6 mr-2" /> 
          Continue with Google
        </button>

        <div className="flex items-center justify-center my-5 text-sm text-gray-500"> 
          <span className="flex-grow h-px bg-gray-400 mx-3"></span>
          <span>OR</span>
          <span className="flex-grow h-px bg-gray-400 mx-3"></span> 
        </div>

        <form className="flex flex-col pb-3" onSubmit={handleSubmit}> 
          
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-11/12 max-w-sm mx-auto my-2 py-3 px-4 border border-gray-300 rounded-xl text-sm outline-none block mb-5 focus:border-blue-500"
          />

          <div className="password-wrapper">
            
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-11/12 max-w-sm mx-auto my-2 py-3 px-4 border border-gray-300 rounded-xl text-sm outline-none block mb-5 focus:border-blue-500"
            />
          </div>

          <div className="password-wrapper"> 

            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-11/12 max-w-sm mx-auto my-2 py-3 px-4 border border-gray-300 rounded-xl text-sm outline-none block mb-5 focus:border-blue-500"
            />
          </div>

         
          <label className="flex items-center text-sm mx-auto mt-1 mb-0 pl-0.5 w-11/12 max-w-sm">
            <input type="checkbox" className="mr-2" /> 
            Subscribe to our newsletter
          </label>

          {error && <div className="text-red-500 mt-2.5">{error}</div>}

          
          <button type="submit" className="w-11/12 py-2.5 px-4 mx-auto my-2.5 text-base font-bold rounded-full cursor-pointer mt-5 transition-colors duration-300 ease-in-out bg-yellow-400 text-white border-none hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <div className="w-full h-px bg-gray-300 my-4"></div> 

        
        <div className="mt-2.5 text-lg text-black bg-white">
          Already have an account?
        </div>

        
        <button className="w-11/12 py-2.5 px-4 mx-auto my-2.5 text-base font-bold rounded-full cursor-pointer mt-5 transition-colors duration-300 ease-in-out bg-white text-black border border-black hover:bg-gray-200 -mt-2.5" onClick={() => navigate('/signin')}>
          Log In
        </button>
      </div>
    </div>
  );
};

export default SignUpPage;