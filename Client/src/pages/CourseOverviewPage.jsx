import React, { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import instance from "../lib/axios"
import { useAuth0 } from '@auth0/auth0-react'

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

  const [enteredEmail, setEnteredEmail] = useState("")
  const [isEnteredEmail, setIsEnteredEmail] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

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
    if (email)
      fetchEnteredEmail()
  }, [email])

  const saveEmail = async () => {
    if (enteredEmail === "") return
    setIsSaved(true)
    try {
      await instance.post("/articles/saveemail", { email, enteredEmail })
      setWarning("Subscribed successfully.")
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
      setWarning("Unsubscibed successfully.")
      setEnteredEmail("")
      setIsEnteredEmail(false)
    } catch (err) {
      setWarning("Failed to remove email.")
    } finally {
      setIsSaved(false)
    }
  }

  return (

    <div className="min-h-screen px-10 pt-5 bg-white" >
      <header className="flex justify-between items-center h-[63px] bg-white box-border">

        <div className="flex items-center gap-2 font-bold text-lg max-w-[180px] overflow-hidden whitespace-nowrap">
          <img src="/logo.jpg" alt="FinEd Logo" className="h-[60px] w-auto object-contain" />
        </div>

        <nav className="flex gap-5">
          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/home' ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/home')}
          >
            Home
          </button>
          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname.startsWith('/courses') ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/courses')}
          >
            Courses
          </button>
          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname.startsWith('/articles') ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/articles')}
          >
            Articles
          </button>
          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/fin-tools' ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/fin-tools')}
          >
            FinTools
          </button>

          {role === "Admin" ? <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/fin-tools' ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/admin')}
          >Admin DashBoard</button> : ""}

          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200`}
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            LogOut
          </button>
        </nav>

        <div onClick={() => navigate("/notifications")} className="bg-white rounded-full p-3 shadow-md cursor-pointer">
          <img src="/bell.png" alt="Bell Icon" width="24" />
        </div>
      </header>

      {loading ?
        <div className="flex flex-col gap-8 items-center my-20">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[50%] h-24 bg-gray-300 rounded-2xl animate-pulse" />
          ))}
        </div>
        :
        <div className="py-10 bg-white min-h-screen">
          <div className="bg-violet-800 text-white rounded-2xl overflow-hidden mb-6 w-full max-w-3xl mx-auto">
            <div className="flex items-center px-4 py-3 border-b border-white/40">
              <button onClick={() => navigate('/courses')} className="text-xl mr-4 cursor-pointer">←</button>
              <h2 className="text-lg font-semibold">{courseTitle}</h2>
            </div>
            <div className="px-4 py-2">
              <div className="font-semibold">Module 1</div>
              <div className="text-m">{course[0]?.moduleTitle}</div>
            </div>
          </div>

          {course.map((module, index) => (
            <div key={index} className="mb-20 mx-auto max-w-3xl">
              {index !== 0 && (
                <div className="bg-violet-800 text-white px-4 py-2 rounded-2xl font-medium text-left w-full">
                  <div className="font-semibold">Module {index + 1}</div>
                  <div className="text-sm font-normal">{module.moduleTitle}</div>
                </div>
              )}

              <div className="mt-10 flex flex-col items-center gap-14">
                {module.cards.map((card, i) => {
                  const isClickable = i === 0 || module.cards[i - 1].status === "completed"

                  return (
                    <div key={i} className={`relative w-full flex ${i % 2 === 0 ? "justify-start pl-20" : "justify-end pr-20"}`}>
                      <div className={`flex flex-col items-center w-28 ${i % 2 === 0 ? 'ml-[125px]' : 'mr-[120px] mt-4'}`}>
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
                          {card.content_text}
                        </p>
                      </div>

                      {i !== module.cards.length - 1 && (
                        <img
                          src={i % 2 === 0 ? imageAssets.pathLeftToRight : imageAssets.pathRightToLeft}
                          alt="path"
                          className="absolute mt-16 top-12 left-1/2 transform -translate-x-1/2 w-64"
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
            <a href="https://linkedin.com"><img src="/linkedin.png" alt="LinkedIn" className="w-8 h-8 transition-transform duration-200 hover:scale-110 cursor-pointer" /></a>
            <a href="https://instagram.com"><img src="/insta.jpg" alt="Instagram" className="w-8 h-8 transition-transform duration-200 hover:scale-110 cursor-pointer" /></a>
          </div>
        </div>
        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] font-semibold text-center md:text-left">
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">FEATURED</h4>
          <Link to="/courses" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Courses</Link>
          <Link to="/articles" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Articles</Link>
          <Link to="/tools" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">FinTools</Link>
          <Link to="/about" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">About Us</Link>
        </div>
        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] font-semibold text-center md:text-left">
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">OTHER</h4>
          <Link to="/leaderboard" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Leaderboard</Link>
          <Link to="/rewards" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Rewards</Link>
          <Link to="/contact" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Contact Us</Link>
          <Link to="/feedback" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Feedback</Link>
        </div>
        <div className="newsletter m-5">
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-4">NEWSLETTER</h4>
          {isEnteredEmail ?
            <div>
              <p className="py-3 pl-3 pr-28 w-full mb-3 border border-gray-200 rounded-md text-sm box-border" >{enteredEmail}</p>
              <button onClick={removeEmail} className="p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border">
                Unubscribe
              </button>
            </div>
            :
            <div>
              <input value={enteredEmail} onChange={(e) => setEnteredEmail(e.target.value.trim())} type="email" placeholder="Enter your email address" className="p-3 w-full mb-3 border border-gray-200 rounded-md text-sm box-border" />
              <button onClick={saveEmail} className="p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border">
                Subscribe Now
              </button>
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
