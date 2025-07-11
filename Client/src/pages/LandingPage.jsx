import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast"


export default function LandingPage() {

  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  console.log(isAuthenticated, user);
  useEffect(() => {
    if (!isLoading && isAuthenticated && location.pathname === '/') {
      navigate('/home');
    }
  }, [isAuthenticated, isLoading, location.pathname]);



  return (
    <div className="min-h-screen bg-white text-gray-800 font-inter">
      <header className="flex justify-between items-center px-12 py-6 bg-white shadow-sm">
        <div className="flex items-center gap-2 font-bold text-lg max-w-[180px] overflow-hidden whitespace-nowrap">
          <img src="/logo.jpg" alt="FinEd logo" className="h-[70px] w-auto object-contain" />
        </div>
        <nav className="flex items-center">
          <Link to="/courses" className="ml-8 text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200">Courses</Link>
          <Link to="/articles" className="ml-8 text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200">Articles</Link>
          <Link to="/about" className="ml-8 text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200">About Us</Link>
          <button onClick={loginWithRedirect} className="ml-8 px-4 py-2 bg-amber-400 text-white rounded-lg font-bold hover:bg-amber-500 transition-colors duration-200">Sign up / Login</button>
        </nav>
      </header>

      <main className="flex justify-between items-center px-12 py-20">
        <div className="max-w-xl">
          <h1 className="text-4xl mb-4 font-semibold">Take Control of Your Financial Future—For Free</h1>
          <p className="text-lg text-gray-600">
            FinEd simplifies finance with bite-sized, engaging courses designed to help you save more, invest smarter and take control of your money - all for free!
          </p>
        </div>
        <div className="hero-image">
          <img src="/dashboard.png" alt="Code preview" className="w-[600px] rounded-2xl shadow-xl" />
        </div>
      </main>

      <section className="bg-[#3B0DAD] text-white py-20 px-8 text-center relative custom-wave-top">

        <h2 className="text-3xl mb-4">Jump into your first course</h2>
        <p className="text-base mb-8">no sign-in, no hassle. Start learning about money in just one click.</p>
        <Link to="/course/1" className="bg-[#fbbf24] text-white py-3 px-6 rounded-lg font-bold no-underline">Give It a Go →</Link>
      </section>



      <div className="py-10 px-8 md:px-24 flex flex-col md:flex-row justify-between items-center bg-white mb-0">
        <div className="flex-1 basis-full md:basis-[45%] text-center md:text-left md:pr-24 mb-8 md:mb-0">
          <h2 className="text-4xl font-bold mb-5">Small Lessons. Big Impact.</h2>
          <ul className="list-none p-0 mb-5">
            <li className="relative pl-8 mb-4 leading-relaxed text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1.5">Step-by-step roadmaps to guide your journey</li>
            <li className="relative pl-8 mb-4 leading-relaxed text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1.5">Quizzes that reinforce learning, not test memory</li>
            <li className="relative pl-8 mb-4 leading-relaxed text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1.5 before:text-xs before:absolute before:left-0 before:top-1.5">Real-life examples to make concepts stick</li>
            <li className="relative pl-8 mb-4 leading-relaxed text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1.5 before:text-xs before:absolute before:left-0 before:top-1.5">Zero jargon—just clear, practical explanations</li>
          </ul>
          <p>Perfect for busy minds with big goals.</p>
        </div>
        <div className="flex-1 basis-full md:basis-[45%] flex justify-center items-center">
          <img src="/dashboard.png" alt="Dashboard preview 1" className="w-full max-w-[550px] h-auto rounded-lg shadow-lg" />
        </div>
      </div>


      <div className="py-10 px-8 md:px-24 flex flex-col-reverse md:flex-row justify-between items-center bg-white mb-0">
        <div className="flex-1 basis-full md:basis-[45%] flex justify-center items-center md:pr-24 mb-8 md:mb-0">
          <img src="/dashboard.png" alt="Dashboard preview 2" className="w-full max-w-[550px] h-auto rounded-lg shadow-lg" />
        </div>
        <div className="flex-1 basis-full md:basis-[45%] text-center md:text-left">
          <h2 className="text-4xl font-bold mb-5">Knowledge Pays—Literally.</h2>
          <ul className="list-none p-0 mb-5">
            <li className="relative pl-8 mb-4 leading-relaxed text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1.5">Collect FinStars as you complete lessons and quizzes</li>
            <li className="relative pl-8 mb-4 leading-relaxed text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1.5 before:text-xs before:absolute before:left-0 before:top-1.5">Climb the leaderboard and track your progress</li>
            <li className="relative pl-8 mb-4 leading-relaxed text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1.5 before:text-xs before:absolute before:left-0 before:top-1.5">Unlock real rewards—from gift cards to exclusive perks</li>
          </ul>
          <p>
            Learn smart, earn smarter with our rewards system.<br />
            Because learning finance should feel as rewarding as it is impactful.
          </p>
        </div>
      </div>


      <div className="py-10 px-8 md:px-24 flex flex-col md:flex-row justify-between items-center bg-white mb-0">
        <div className="flex-1 basis-full md:basis-[45%] text-center md:text-left md:pr-24 mb-8 md:mb-0">
          <h2 className="text-4xl font-bold mb-5">Turn Knowledge into Action</h2>
          <ul className="list-none p-0 mb-5">
            <li className="relative pl-8 mb-4 leading-relaxed text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1.5">Interactive tools that bridge learning with real-life money moves</li>
            <li className="relative pl-8 mb-4 leading-relaxed text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1.5 before:text-xs before:absolute before:left-0 before:top-1.5">Built for everyday use, from quick decisions to long-term planning</li>
            <li className="relative pl-8 mb-4 leading-relaxed text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1.5 before:text-xs before:absolute before:left-0 before:top-1.5">Designed for simplicity, so you can focus on what matters</li>
          </ul>
          <p>
            Learning is just the start—our tools help you make it real from budget trackers to smart goal planners, we have something for everyone.
          </p>
        </div>
        <div className="flex-1 basis-full md:basis-[45%] flex justify-center items-center">
          <img src="/dashboard.png" alt="Organization Overview" className="w-full max-w-[550px] h-auto rounded-lg shadow-lg" />
        </div>
      </div>

      <section className="bg-[#431FCE] text-white py-16 px-10 relative">
        <div className="flex justify-between items-center mb-5 px-5">
          <h2 className="text-4xl font-semibold">Explore Courses</h2>
          <Link to="/courses" className="text-base text-white hover:underline">View More →</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-5 mb-16">
          <div className="bg-white text-gray-900 rounded-xl p-10 shadow-md flex flex-col justify-between h-48 transition-transform duration-200 hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl text-purple-800 font-semibold">Stock Market Basics</h3>
              <img src="/stock.png" alt="Stock Market" className="w-24 h-24 object-contain" />
            </div>
            <div className="mt-auto">
              <p className="text-sm text-gray-700">5 modules • 25 mins</p>
            </div>
          </div>

          <div className="bg-white text-gray-900 rounded-xl p-10 shadow-md flex flex-col justify-between h-48 transition-transform duration-200 hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl text-purple-800 font-semibold">Investing 101</h3>
              <img src="/stock.png" alt="Investing" className="w-24 h-24 object-contain" />
            </div>
            <div className="mt-auto">
              <p className="text-sm text-gray-700">6 modules • 30 mins</p>
            </div>
          </div>

          <div className="bg-white text-gray-900 rounded-xl p-10 shadow-md flex flex-col justify-between h-48 transition-transform duration-200 hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl text-purple-800 font-semibold">Mutual Funds</h3>
              <img src="/stock.png" alt="Mutual Funds" className="w-24 h-24 object-contain" />
            </div>
            <div className="mt-auto">
              <p className="text-sm text-gray-700">4 modules • 20 mins</p>
            </div>
          </div>

          <div className="bg-white text-gray-900 rounded-xl p-10 shadow-md flex flex-col justify-between h-48 transition-transform duration-200 hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl text-purple-800 font-semibold">Crypto Explained</h3>
              <img src="/stock.png" alt="Crypto" className="w-24 h-24 object-contain" />
            </div>
            <div className="mt-auto">
              <p className="text-sm text-gray-700">5 modules • 22 mins</p>
            </div>
          </div>
        </div>

        <div className="wave absolute bottom-0 left-0 w-full h-24 overflow-hidden leading-none">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="relative block w-full h-24">
            <path d="M0.00,49.98 C150.00,150.00 349.90,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      <section className="bg-white py-16 px-10">
        <div className="flex justify-between items-center mb-5 px-5">
          <h2 className="text-4xl font-semibold">Articles</h2>
          <Link to="/articles" className="text-base text-gray-900 hover:underline">View More →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 px-5">
          <div className="bg-white text-gray-900 rounded-xl p-10 shadow-md flex flex-col justify-between h-48 transition-transform duration-200 hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <strong className="text-3xl text-purple-800 font-semibold">Stock Market Basics</strong>
              <img src="/stock.png" alt="Stock Market Basics" className="w-24 h-24 object-contain" />
            </div>
            <div className="mt-auto">
              <p className="text-sm text-gray-700">5 modules • 25 mins</p>
            </div>
          </div>

          <div className="bg-white text-gray-900 rounded-xl p-10 shadow-md flex flex-col justify-between h-48 transition-transform duration-200 hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <strong className="text-3xl text-purple-800 font-semibold">Finance Tips</strong>
              <img src="/stock.png" alt="Finance Tips" className="w-24 h-24 object-contain" />
            </div>
            <div className="mt-auto">
              <p className="text-sm text-gray-700">3 modules • 15 mins</p>
            </div>
          </div>

          <div className="bg-white text-gray-900 rounded-xl p-10 shadow-md flex flex-col justify-between h-48 transition-transform duration-200 hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <strong className="text-3xl text-purple-800 font-semibold">Invest Smart</strong>
              <img src="/stock.png" alt="Invest Smart" className="w-24 h-24 object-contain" />
            </div>
            <div className="mt-auto">
              <p className="text-sm text-gray-700">6 modules • 30 mins</p>
            </div>
          </div>

          <div className="bg-white text-gray-900 rounded-xl p-10 shadow-md flex flex-col justify-between h-48 transition-transform duration-200 hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <strong className="text-3xl text-purple-800 font-semibold">Crypto Crash Course</strong>
              <img src="/stock.png" alt="Crypto Crash Course" className="w-24 h-24 object-contain" />
            </div>
            <div className="mt-auto">
              <p className="text-sm text-gray-700">4 modules • 20 mins</p>
            </div>
          </div>
        </div>
      </section>



      <footer className="bg-[#f7fafc] py-10 px-6 md:px-12 flex flex-wrap justify-between text-[#333] font-sans">

        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] flex flex-col items-center md:items-start">
          <img src="/logo.jpg" alt="FinEd Logo" className="h-[50px] mb-3" />
          <p className="text-base text-gray-700 mb-4 text-center md:text-left">Financial Education made Easy.</p>
          <div className="flex gap-4">
            <a href="https://www.linkedin.com/company/fined-personal-finance/"><img src="/linkedin.png" alt="LinkedIn" className="w-8 h-8 transition-transform duration-200 hover:scale-110 cursor-pointer" /></a>
            <a href="https://instagram.com/fined.personalfinance"><img src="/insta.jpg" alt="Instagram" className="w-8 h-8 transition-transform duration-200 hover:scale-110 cursor-pointer" /></a>
          </div>
        </div>
        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] text-center md:text-left">
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">FEATURED</h4>
          <Link to="/courses" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Courses</Link>
          <Link to="/articles" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Articles</Link>
          <Link onClick={() => toast.error("Please sign in")} className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">FinTools</Link>
          <Link to="/about" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">About Us</Link>
        </div>
        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] text-center md:text-left">
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">OTHER</h4>
          <Link to="/help" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Help</Link>
          <Link to="/contact" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Contact Us</Link>
          <Link to="/feedback" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Feedback</Link>
        </div>
        <div className="newsletter">
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-4">NEWSLETTER</h4>
          <input type="email" placeholder="Enter your email address" className="p-3 w-full mb-3 border border-gray-200 rounded-md text-sm box-border" />
          <button onClick={() => toast.error("Please sign in")} className="p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border">
            Subscribe Now
          </button>
        </div>
      </footer>

      <p className="text-center justify-center w-full my-10 text-xs">
        © Copyright {new Date().getFullYear()}, All Rights Reserved by FinEd.
      </p>

    </div>
  );
}