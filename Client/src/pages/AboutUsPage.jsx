import React, { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import instance from "../lib/axios"
import { useAuth0 } from '@auth0/auth0-react'
import toast from 'react-hot-toast'

const AboutUs = () => {

  const navigate = useNavigate()
  const location = useLocation()

  const { user, isLoading, isAuthenticated, logout, loginWithRedirect } = useAuth0()
  const [role, setrole] = useState("")

  const [email, setEmail] = useState("")

  const [hasUnseen, setHasUnseen] = useState(false)
  const [enteredEmail, setEnteredEmail] = useState("")
  const [isEnteredEmail, setIsEnteredEmail] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setEmail(user?.email || "")
      const roles = user?.["https://fined.com/roles"]
      setrole(roles?.[0] || "")
    }
  }, [isLoading, isAuthenticated])

  async function fetchHasUnseen() {
    try {
      const res = await instance.post("/home/hasunseen", { email })
      if (res) {
        setHasUnseen(res.data)
      }
    } catch (error) {
      toast.error("Failed to fetch notifications status.")
    }
  }

  async function fetchEnteredEmail() {
    try {
      const res = await instance.post("/articles/getenteredemail", { email })
      if (res.data[0]?.enteredEmail) {
        setEnteredEmail(res.data[0]?.enteredEmail || null)
        setIsEnteredEmail(true)
      }
    } catch (error) {
      setEnteredEmail("")
      setIsEnteredEmail(false)
    }
  }

  useEffect(() => {
    if (!email) return
    fetchEnteredEmail()
    fetchHasUnseen()
  }, [email])

  const saveEmail = async () => {
    if (enteredEmail === "") return
    setIsSaved(true)
    try {
      await instance.post("/articles/saveemail", { email, enteredEmail })
      setWarning("🎉 Subscribed successfully.")
      setIsEnteredEmail(true)
    } catch (err) {
      toast.success("Failed to save email.")
    } finally {
      setIsSaved(false)
    }
  }

  const removeEmail = async () => {
    setIsSaved(true)
    try {
      await instance.post("/articles/removeemail", { email, enteredEmail })
      setWarning("Unsubscibed successfully.")
      setEnteredEmail("")
      setIsEnteredEmail(false)
    } catch (err) {
      toast.success("Failed to remove email.")
    } finally {
      setIsSaved(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    if (isSidebarOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="bg-gray-100 h-full w-full flex flex-col">

      {isAuthenticated ?
        <header className="flex justify-between items-center h-[63px] px-10 py-12 bg-gray-100 box-border">

          <div className="flex items-center gap-2 font-bold text-lg max-w-[180px] overflow-hidden whitespace-nowrap">
            <img src="logo.jpg" alt="FinEd Logo" className="h-[60px] w-auto object-contain" />
          </div>

          <nav className="flex gap-5">
            <button
              className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/home' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              onClick={() => navigate('/home')}
            >
              Home
            </button>
            <button
              className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/courses' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              onClick={() => navigate('/courses')}
            >
              Courses
            </button>
            <button
              className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/articles' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              onClick={() => navigate('/articles')}
            >
              Articles
            </button>
            <button
              className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/fin-tools' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              onClick={() => navigate('/fin-tools')}
            >
              FinTools
            </button>

            {role === "Admin" ? <button
              className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/fin-tools' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              onClick={() => navigate('/admin')}
            >Admin DashBoard</button> : ""}

            {isAuthenticated && <button
              className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors bg-white text-gray-700 hover:bg-gray-200`}
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              LogOut
            </button>}
          </nav>

          <div onClick={() => { isAuthenticated ? navigate("/notifications") : toast.error("Please sign in") }} className="relative bg-white rounded-full p-3 shadow-md cursor-pointer">
            <img src="bell.png" alt="Bell Icon" width="24" />
            {hasUnseen && (
              <div className="absolute top-0 right-1 w-3 h-3 bg-amber-400 rounded-full" />
            )}
          </div>
        </header>
        :
        <header className="flex flex-col sm:flex-row justify-between items-center px-6 sm:px-10 lg:px-16 py-6 bg-gray-100">
          <div className="flex items-center justify-between w-full sm:w-auto mb-4 sm:mb-0">
            <div className="flex items-center gap-3 font-bold text-lg max-w-[200px] overflow-hidden whitespace-nowrap">
              <img
                src="/logo.jpg"
                srcSet="/logo-320w.jpg 320w, /logo-640w.jpg 640w, /logo.jpg 1280w"
                sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
                alt="FinEd logo"
                loading="lazy"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </div>
            <button
              className="sm:hidden text-gray-800 focus:outline-none p-2"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
              </svg>
            </button>
          </div>
          <nav role="navigation" aria-label="Main navigation" className="hidden sm:flex flex-wrap items-center justify-center sm:justify-end gap-6 sm:gap-10">
            <Link to="/courses" aria-label="View courses" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-base sm:text-lg">Courses</Link>
            <Link to="/articles" aria-label="View articles" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-base sm:text-lg">Articles</Link>
            <Link to="/about" aria-label="About us" className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 text-base sm:text-lg ${location.pathname === '/about' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>About Us</Link>
            <button onClick={loginWithRedirect} className="px-5 py-2 bg-amber-400 text-white rounded-lg font-bold hover:bg-amber-500 transition-colors duration-200 text-base sm:text-lg cursor-pointer">Sign up / Login</button>
          </nav>
        </header>
      }

      <div className="max-w-5xl self-center py-10 space-y-10" >
        {/* About Us Section */}
        <section className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">About Us</h1>
            <p>
              A free, bite-sized financial education platform built for India’s youth — because understanding
              money should be simple and accessible for everyone.
            </p>
          </div>
          <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
            {/* Replace this with your actual logo */}
            <img src="/logo.jpg" />
          </div>
        </section>

        {/* Who We Are */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Who We Are</h2>
          <p>
            At FinEd, we believe that understanding money is a basic life skill — not a luxury. We’re building
            a platform that makes financial literacy easy, engaging, and free for everyone.
          </p>
          <p>
            From bite-sized lessons and practical tools to tailored financial schemes and insightful articles,
            everything is designed to help you cut through the noise and build real financial awareness—at your
            own pace.
          </p>
        </section>

        {/* Why We Started */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Why We Started</h2>
          <p>
            Most of us grow up without ever being taught how to manage money. Schools don’t cover it, financial
            products are confusing, and the internet is full of myths.
          </p>
          <p>
            This lack of clarity holds people back — leading to poor decisions, debt, and missed opportunities.
            FinEd was created to change that.
          </p>
        </section>

        {/* What We're Building */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">What We’re Building</h2>
          <p>
            We’re building more than just a learning platform. FinEd is designed to be your personal financial
            growth companion.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>✅ Byte-sized, easy-to-understand courses</li>
            <li>✅ Smart tools to help you budget, save, and invest — with more coming soon</li>
            <li>✅ Personalized financial schemes based on your needs — not generic suggestions</li>
            <li>✅ Progress tracking so you always know how far you've come in your financial journey</li>
          </ul>
        </section>

        {/* Our Vision */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Our Vision</h2>
          <p>
            We envision a future where every Indian — no matter their background — can understand, manage, and
            grow their money confidently.
          </p>
          <p>
            With FinEd, financial literacy becomes not just accessible, but something you actually enjoy
            learning.
          </p>
        </section>

        {/* For Financial Institutions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">For Financial Institutions</h2>
          <p>
            FinEd is also a powerful partner for financial institutions. We help banks, NBFCs, and credit
            unions to educate their users, build trust, and drive smarter product adoption by:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>🔹 Offering customized literacy courses</li>
            <li>🔹 Bridging product awareness gaps</li>
            <li>🔹 Providing user insights for better targeting</li>
          </ul>
        </section>

        {/* Mascot */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">A Friendly Face: Meet Finix</h2>
          <p>
            Our mascot, Finix, adds a friendly face to your learning journey. While finance is serious
            business, learning it doesn’t have to be dull.
          </p>
          <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
            {/* Replace this with actual mascot image */}
            <span>Mascot Photo</span>
          </div>
        </section>

        {/* Meet the Team */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Meet the Team</h2>
          <p>[Leave blank for now]</p>
        </section>

      </div>

      <footer className="bg-[#f7fafc] py-10 px-20 flex flex-wrap justify-between text-[#333] font-sans">

        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] flex flex-col items-center md:items-start">
          <img src="/logo.jpg" alt="FinEd Logo" className="h-[50px] mb-3" />
          <p className="text-base text-gray-700 mb-4 text-center md:text-left">Financial Education made Easy.</p>
          <div className="flex gap-4">
            <Link to="https://www.linkedin.com/company/fined-personal-finance/"><img src="/linkedin.png" alt="LinkedIn" className="w-8 h-8 transition-transform duration-200 hover:scale-110 cursor-pointer" /></Link>
            <Link to="https://www.instagram.com/fined.personalfinance"><img src="/insta.jpg" alt="Instagram" className="w-8 h-8 transition-transform duration-200 hover:scale-110 cursor-pointer" /></Link>
          </div>
        </div>
        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] font-semibold text-center md:text-left">
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">FEATURED</h4>
          <Link to="/courses" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Courses</Link>
          <Link to="/articles" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Articles</Link>
          <Link to={isAuthenticated ? "fin-tools" : "#"} onClick={(e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              toast.error("Please sign in");
            }
          }} className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">FinTools</Link>
          <Link to="/about" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">About Us</Link>
        </div>
        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] font-semibold text-center md:text-left">
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">OTHER</h4>
          <Link to="/help" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Help</Link>
          <Link to="/contact" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Contact Us</Link>
          <Link to="/feedback" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Feedback</Link>
        </div>
        <div className="newsletter m-5">
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-4">NEWSLETTER</h4>
          {isEnteredEmail ?
            <div>
              <p className="py-3 pl-3 pr-28 w-full mb-3 border border-gray-200 rounded-md text-sm box-border" >{enteredEmail}</p>
              {isSaved ?
                <div className="flex items-center justify-center gap-2 text-[#fbbf24] font-semibold">
                  <svg className="animate-spin h-5 w-5 text-[#fbbf24]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Unsubscribing...
                </div>
                :
                <button
                  onClick={() => { isAuthenticated ? removeEmail() : toast.error("Please sign in") }}
                  className="p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border">
                  Unubscribe
                </button>
              }
            </div>
            :
            <div>
              <input value={enteredEmail} onChange={(e) => setEnteredEmail(e.target.value.trim())} type="email" placeholder="Enter your email address" className="p-3 w-full mb-3 border border-gray-200 rounded-md text-sm box-border" />
              {isSaved ?
                <button className="flex items-center justify-center gap-2 p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border">
                  <svg className="animate-spin h-5 w-5 text-[#fbbf24]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Subscribing...
                </button>
                :
                <button onClick={() => { isAuthenticated ? saveEmail() : toast.error("Please sign in") }} className="p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border">
                  Subscribe Now
                </button>
              }
            </div>
          }
        </div>
      </footer>

      <p className="text-center justify-center w-full my-10 text-xs">
        © Copyright {new Date().getFullYear()}, All Rights Reserved by FinEd.
      </p>

    </div>
  );
};

export default AboutUs;
