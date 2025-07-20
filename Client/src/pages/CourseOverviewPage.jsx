import React, { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import instance from "../lib/axios"
import { useAuth0 } from '@auth0/auth0-react'
import toast from "react-hot-toast"
import { FiMenu, FiX } from "react-icons/fi"

const imageAssets = {
  completed: "/FcomplitedModule.png",
  incompleted: "/start.png",
  locked: "/locked.png",
  pathLeftToRight: "/FpathLtoR.png",
  pathRightToLeft: "/FpathRtoL.png",
}

export default function CourseOverviewPage() {
  const navigate = useNavigate()
  const { course_id } = useParams()

  const { user, isLoading, isAuthenticated, logout } = useAuth0()
  const [role, setrole] = useState("")

  const [email, setEmail] = useState("")
  const [courseTitle, setCourseTitle] = useState("")
  const [course, setCourse] = useState([])
  const [showLockedAlert, setShowLockedAlert] = useState(false)
  const [warning, setWarning] = useState("")
  const [loading, setLoading] = useState(true)

  const [hasUnseen, setHasUnseen] = useState(false)
  const [enteredEmail, setEnteredEmail] = useState("")
  const [isEnteredEmail, setIsEnteredEmail] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/")
    } else if (!isLoading && isAuthenticated) {
      setEmail(user?.email)
      const roles = user?.["https://fined.com/roles"]
      setrole(roles?.[0] || "")
    }
  }, [isLoading, isAuthenticated])

  async function fetchCourse() {
    setLoading(true)
    try {
      const res = await instance.post(`/courses/course/${course_id}`, { email })
      console.log(res.data)
      setCourseTitle(res.data.title)
      setCourse(res.data.data)
      setLoading(false)
    } catch (err) {
      setWarning("Failed to load course.")
    }
  }

  useEffect(() => {
    if (email)
      fetchCourse()
  }, [email])

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
      toast.success("🎉 Subscribed successfully.")
      setIsEnteredEmail(true)
    } catch (err) {
      setWarning("Failed to save email.")
    } finally {
      setIsSaved(false)
    }
  }

  const removeEmail = async () => {
    setIsSaved(true)
    try {
      await instance.post("/articles/removeemail", { email, enteredEmail })
      toast.success("Unsubscibed successfully.")
      setEnteredEmail("")
      setIsEnteredEmail(false)
    } catch (err) {
      setWarning("Failed to remove email.")
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

    <div className="min-h-screen px-4 sm:px-10 sm:pt-4 bg-white" >
      <header className="flex flex-col md:flex-row md:items-center h-auto md:h-[63px] bg-white box-border mb-4 2xl:max-w-[1400px] 2xl:mx-auto">
        {/* Mobile and Tablet Header */}
        <div className="flex justify-between items-center w-full mt-4 xl:hidden">
          <div onClick={() => navigate('/')} className="flex items-center gap-2 font-bold text-lg max-w-[180px] overflow-hidden whitespace-nowrap cursor-pointer">
            <img src="/logo.jpg" alt="FinEd Logo" className="h-[48px] w-auto object-contain" />
          </div>
          <div className="flex items-center gap-4">
            <div onClick={() => navigate("/notifications")} className="relative bg-white rounded-full p-2 shadow-md cursor-pointer">
              <img src="/bell.png" alt="Bell Icon" className='w-6' />
              {hasUnseen && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-amber-400 rounded-full" />
              )}
            </div>
            <button className="p-2 text-2xl" onClick={toggleSidebar}>
              {isSidebarOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden xl:flex xl:flex-row xl:items-center w-full justify-between">
          <div onClick={() => navigate('/home')} className="flex items-center gap-2 font-bold text-lg max-w-[180px] overflow-hidden whitespace-nowrap cursor-pointer">
            <img src="/logo.jpg" alt="FinEd Logo" className="h-[60px] w-auto object-contain rounded-b-md" />
          </div>
          <nav className="flex flex-wrap justify-center gap-5">
            <button
              className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/home' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              onClick={() => navigate('/home')}
            >
              Home
            </button>
            <button
              className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname.startsWith('/courses') ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
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
            {role === "Admin" && (
              <button
                className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/admin' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                onClick={() => navigate('/admin')}
              >
                Admin Dashboard
              </button>
            )}
            <button
              className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors bg-white text-gray-700 hover:bg-gray-200`}
              onClick={() => {
                sessionStorage.setItem("forceReload", "true");
                logout({ logoutParams: { returnTo: window.location.origin } })
              }}
            >
              LogOut
            </button>
          </nav>
          <div onClick={() => navigate("/notifications")} className="relative bg-white rounded-full p-3 shadow-md cursor-pointer">
            <img src="/bell.png" alt="Bell Icon" width="24" />
            {hasUnseen && (
              <div className="absolute top-0 right-1 w-3 h-3 bg-amber-400 rounded-full" />
            )}
          </div>
        </div>

        {/* Sidebar for mobile and tablet */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} xl:hidden`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold">Menu</h2>
            <button onClick={toggleSidebar} className="text-2xl">
              <FiX />
            </button>
          </div>
          <nav className="flex flex-col p-4 gap-2">
            <button
              className={`px-4 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors text-left ${location.pathname === '/home' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              onClick={() => { navigate('/home'); setIsSidebarOpen(false); }}
            >
              Home
            </button>
            <button
              className={`px-4 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors text-left ${location.pathname.startsWith('/courses') ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              onClick={() => { navigate('/courses'); setIsSidebarOpen(false); }}
            >
              Courses
            </button>
            <button
              className={`px-4 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors text-left ${location.pathname === '/articles' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              onClick={() => { navigate('/articles'); setIsSidebarOpen(false); }}
            >
              Articles
            </button>
            <button
              className={`px-4 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors text-left ${location.pathname === '/fin-tools' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              onClick={() => { navigate('/fin-tools'); setIsSidebarOpen(false); }}
            >
              FinTools
            </button>
            {role === "Admin" && (
              <button
                className={`px-4 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors text-left ${location.pathname === '/admin' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                onClick={() => { navigate('/admin'); setIsSidebarOpen(false); }}
              >
                Admin Dashboard
              </button>
            )}
            <button
              className={`px-4 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors text-left bg-white text-gray-700 hover:bg-gray-200`}
              onClick={() => {
                logout({ logoutParams: { returnTo: window.location.origin } });
                setIsSidebarOpen(false);
              }}
            >
              LogOut
            </button>
          </nav>
        </div>
        {
          isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={toggleSidebar}
            ></div>
          )
        }
      </header>

      {loading ?
        <div className="flex flex-col gap-8 items-center my-20">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[50%] h-24 bg-gray-300 rounded-2xl animate-pulse" />
          ))}
        </div>
        :
        <div className="py-5 sm:py-10 bg-white min-h-screen">
          <div className="bg-violet-800 text-white rounded-2xl overflow-hidden mb-6 w-full sm:max-w-3xl sm:mx-auto">
            <div className="flex items-center px-4 py-3 border-b border-white/40">
              <button onClick={() => navigate('/courses')} className="text-lg sm:text-xl mr-4 cursor-pointer">←</button>
              <h2 className="text-md sm:text-lg font-semibold">{courseTitle}</h2>
            </div>
            <div className="px-4 py-2">
              <div className="font-medium sm:font-semibold">Module 1</div>
              <div>{course[0]?.moduleTitle}</div>
            </div>
          </div>

          {course.map((module, index) => (
            <div key={index} className="mb-20 mx-auto max-w-3xl">
              {index !== 0 && (
                <div className="bg-violet-800 text-white px-4 py-2 rounded-2xl font-medium text-left w-full">
                  <div className="font-medium sm:font-semibold">Module {index + 1}</div>
                  <div className="font-normal">{module.moduleTitle}</div>
                </div>
              )}

              <div className="mt-10 flex flex-col items-center gap-14 px-4 sm:px-0">
                {module.cards.map((card, i) => {
                  const isClickable = i === 0 || module.cards[i - 1].status === "completed"

                  return (
                    <div key={i} className={`relative w-full flex ${i % 2 === 0 ? "justify-start sm:pl-20" : "justify-end sm:pr-20"}`}>
                      <div className={`flex flex-col items-center w-1/6 ${i % 2 === 0 ? 'ml-0 sm:ml-[125px]' : 'sm:mr-[120px]'}`}>
                        <button
                          onClick={() => {
                            if (isClickable) {
                              navigate(`module/${module.moduleId}/card/${card.card_id}`)
                            } else {
                              setShowLockedAlert(true)
                            }
                          }}
                          className="transition-transform duration-200 hover:scale-110 focus:scale-90 cursor-pointer"
                        >
                          <img
                            src={imageAssets[
                              card.status === "completed"
                                ? "completed"
                                : i === 0
                                  ? "incompleted"
                                  : "locked"
                            ]}
                            alt="status icon"
                            className="w-16 h-16 object-contain"
                          />
                        </button>
                        <p className="text-center w-96 h-12 overflow-hidden text-ellipsis">
                          {card.title}
                        </p>
                      </div>

                      {i !== module.cards.length - 1 && (
                        <img
                          src={i % 2 === 0 ? imageAssets.pathLeftToRight : imageAssets.pathRightToLeft}
                          alt="path"
                          className="absolute mt-12 top-12 left-1/2 transform -translate-x-1/2 w-6/7 sm:w-1/3"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      }
      <footer className="bg-[#f7fafc] py-10 -mx-10 px-10 flex flex-wrap justify-between text-[#333] font-sans">

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
          <Link to="/fin-tools" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">FinTools</Link>
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
                <button onClick={removeEmail} className="p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border">
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
                <button onClick={saveEmail} className="p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border">
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
      {warning && (
        <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] space-y-4">
            <p className="text-xl font-bold text-red-600">⚠️ Alert</p>
            <p className="text-md font-semibold text-gray-700">
              {warning}
            </p>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => { setWarning(false); setLoading(false); navigate("/courses") }}
                className={`bg-amber-400 hover:bg-amber-500 transition-all duration-200 text-white px-4 py-2 rounded-lg ${isSaved ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showLockedAlert && (
        <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] space-y-4">
            <p className="text-xl font-bold text-red-600">⚠️ Card Locked</p>
            <p className="text-md font-semibold text-gray-700">
              Please complete the previous card to unlock this one.
            </p>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowLockedAlert(false)}
                className="bg-amber-400 hover:bg-amber-500 transition-all duration-200 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}