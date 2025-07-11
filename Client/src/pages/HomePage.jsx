import { useAuth0 } from '@auth0/auth0-react'
import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import instance from '../lib/axios'
import toast from 'react-hot-toast'
import FinScoreChart from '../components/finScoreChart'
import { IoIosInformationCircleOutline } from "react-icons/io"

const HomePage = () => {

  const { user, isLoading, isAuthenticated, logout } = useAuth0()
  const [role, setrole] = useState("")

  const [email, setEmail] = useState("")
  const [enteredEmail, setEnteredEmail] = useState("")
  const [isEnteredEmail, setIsEnteredEmail] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const [warning, setWarning] = useState("")
  const [error, setError] = useState("")

  const [featuredArticle, setFeaturedArticle] = useState({})
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [ongoingCourse, setOngoingCourse] = useState({})
  const [tasks, setTasks] = useState({})
  const [hasUnseen, setHasUnseen] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const carouselRef1 = useRef(null)
  const [canScrollLeft1, setCanScrollLeft1] = useState(false)
  const [canScrollRight1, setCanScrollRight1] = useState(false)
  const [userData, setUserData] = useState({})
  const [showLeaderBoard, setShowLeaderBoard] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [finScoreLog, setFinScoreLog] = useState([])
  const [showFinScoreLog, setShowFinScoreLog] = useState(false)
  const [isFetchingLog, setIsFechingLog] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/")
    } else if (!isLoading && isAuthenticated) {
      setEmail(user?.email)
      const roles = user?.["https://fined.com/roles"]
      setrole(roles?.[0] || "")
    }
  }, [isLoading, isAuthenticated])

  const checkScroll = (el, setLeft, setRight) => {
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;

    setLeft(scrollLeft > 0);
    setRight(scrollLeft < maxScrollLeft - 2);
  };

  const scrollLeft = (ref) => {
    const el = ref.current;
    if (el) {
      const width = el.getBoundingClientRect().width;
      el.scrollBy({ left: -width, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref) => {
    const el = ref.current;
    if (el) {
      const width = el.getBoundingClientRect().width;
      el.scrollBy({ left: width, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el1 = carouselRef1.current;

    const handler1 = () => checkScroll(el1, setCanScrollLeft1, setCanScrollRight1)

    if (el1) {
      el1.addEventListener('scroll', handler1)
      checkScroll(el1, setCanScrollLeft1, setCanScrollRight1)
    }

    return () => {
      if (el1) el1.removeEventListener('scroll', handler1)
    }
  }, [recommendedCourses])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await instance.post("/home/getdata", { email, userId: user?.sub })
      if (res.data?.userData) {
        setUserData(res.data.userData)
        setFeaturedArticle(res.data.featuredArticle)
        setRecommendedCourses(res.data.recommendedCourses)
        setOngoingCourse(res.data.ongoingCourseData)
        setTasks(res.data.tasks)
        setFinScoreLog(res.data.logData)
        setTimeout(() => {
          setShowFeedback(res.data.showFeedback)
        }, 2000)
        setLoading(false)
      }
    } catch (error) {
      setError("Failed to fetch your data.")
    }
  }

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

  useEffect(() => {
    if (!email) return
    fetchData()
    fetchHasUnseen()
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
      toast.error("Failed to fetch your subscription email.")
    }
  }

  useEffect(() => {
    if (email) {
      fetchEnteredEmail()
    }
  }, [email])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const res = await instance.get("/home/leaderboard")
      setLeaderboard(res.data || [])
    } catch (err) {
      toast.error("Failed to load leaderboard.", err)
      setShowLeaderBoard(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchFinScoreLog = async () => {
    setIsFechingLog(true)
    try {
      const res = await instance.post("/home/finscorelog", { email })
      setFinScoreLog(res.data || [])
    } catch (err) {
      toast.error("Failed to load fin score history.", err)
      setShowFinScoreLog(false)
    } finally {
      setIsFechingLog(false)
    }
  }

  useEffect(() => {
    if (showLeaderBoard) fetchLeaderboard()
    if (showFinScoreLog) fetchFinScoreLog()
  }, [showLeaderBoard, showFinScoreLog])

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

  const navigate = useNavigate()
  const location = useLocation()


  return (
    <div className="mx-auto bg-gray-100 font-inter text-[#1e1e1e] px-10 py-5">

      <header className="flex justify-between items-center h-[63px] bg-gray-100 box-border">

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

          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors bg-white text-gray-700 hover:bg-gray-200`}
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            LogOut
          </button>
        </nav>

        <div onClick={() => navigate("/notifications")} className="relative bg-white rounded-full p-3 shadow-md cursor-pointer">
          <img src="bell.png" alt="Bell Icon" width="24" />
          {hasUnseen && (
            <div className="absolute top-0 right-1 w-3 h-3 bg-amber-400 rounded-full" />
          )}
        </div>
      </header>
      {loading && !showLeaderBoard ?
        <div className="p-4 animate-pulse space-y-6">
          <div className="flex gap-5 items-start pt-6">
            <div className="flex-none space-y-6">
              <div className="bg-gray-300 rounded-2xl w-[460px] h-[170px]" />
              <div className="bg-gray-300 rounded-2xl w-[460px] h-[110px]" />
            </div>
            <div className="w-[550px] h-[300px] bg-gray-300 rounded-2xl" />
            <div className="w-[480px] h-[300px] bg-gray-300 rounded-2xl" />
          </div>
          <div className="flex gap-6 pt-8">
            <div className="flex-1 space-y-4">
              <div className="w-48 h-6 bg-gray-300 rounded" />
              <div className="flex gap-4 overflow-hidden bg-gray-300 rounded-2xl">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-[310px] h-[350px] bg-gray-300 rounded-2xl" />
                ))}
              </div>
            </div>
            <div className="w-[420px] h-[390px] bg-gray-300 rounded-2xl" />
          </div>
        </div>
        :
        <div className='pt-5' >
          <main className="flex gap-5 items-start bg-gray-100 mb-5">

            <div className="flex flex-col h-80 w-1/3 gap-4">

              <section className="bg-[#4E00E3] p-4 h-[194px] rounded-2xl text-white text-center flex flex-col justify-center items-center gap-4 flex-1">
                <div>
                  <div className="relative w-[75px] h-[75px] mx-auto">
                    <img src={user?.picture} onError={(e) => { e.currentTarget.src = "/profile.png" }} alt="Profile" className="w-[75px] h-[75px] object-cover rounded-full border-2 border-gray-300" />
                    <img src="edit.png" className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white bg-gray-200 p-1" alt="Edit" />
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-white text-center">{user?.name}</h3>
                </div>
                <div className="flex justify-center gap-10">
                  <div title="FinStars are earned by completing tasks like reading articles, completing modules, and logging expenses." className="bg-white px-3 py-2 w-20 rounded-full flex items-center justify-center gap-4 font-semibold shadow-sm text-gray-900">
                    <img src="star.png" alt="fin-stars" className="w-5 h-5" />
                    <p>{userData?.fin_stars}</p>
                  </div>
                  <div title={`🔥 Current Streak: You've been active for ${userData?.streak_count || 0} day${userData?.streak_count === 1 ? '' : 's'} in a row.`} className="bg-white px-3 py-2 w-20 rounded-full flex items-center justify-center gap-4 font-semibold shadow-sm text-gray-900">
                    <img src="flame.png" alt="streak" className="w-6 h-5" />
                    <p>{userData?.streak_count}</p>
                  </div>
                  <div title={`🏅 Your Rank: You're currently ranked #${userData?.rank || 'N/A'} based on your FinStars.`} onClick={() => setShowLeaderBoard(true)} className="bg-white px-3 py-2 w-20 rounded-full flex items-center justify-center gap-4 font-semibold shadow-sm text-gray-900 cursor-pointer">
                    <img src="badge.png" alt="leaderboard" className="w-5 h-5" />
                    <p>{userData?.rank}</p>
                  </div>
                </div>
              </section>


              <section className="flex items-center bg-white rounded-2xl p-2 gap-6 border border-gray-300">
                <img src={ongoingCourse?.thumbnail_url || recommendedCourses[5]?.thumbnail_url} alt="Course" className="w-[140px] h-[90px] object-cover rounded-xl flex-shrink-0" />
                <div className="flex flex-col justify-between h-full w-full">
                  <h3 className="text-md font-semibold">{ongoingCourse?.title || recommendedCourses[5]?.title}</h3>
                  <button onClick={() => navigate(`/courses/course/${ongoingCourse?.id || recommendedCourses[5]?.id}`)} className="bg-[#fbbf24] border-none px-4 py-1 rounded-xl font-semibold text-white cursor-pointer flex items-center justify-between shadow-md transition-colors hover:bg-[#c09e2b]">
                    <p>{ongoingCourse?.title ? "Continue Learning" : "Start Learning"}</p>
                    <span className="text-2xl">→</span>
                  </button>
                </div>
              </section>
            </div>


            <section className="bg-white px-5 py-2 rounded-2xl font-sans flex flex-col justify-between w-1/3 h-80 border border-gray-300">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Featured</h3>
                <div onClick={() => navigate("/articles")} className='flex items-center gap-2 font-semibold cursor-pointer' >
                  <span>View More</span>
                  <span className="text-2xl">→</span>
                </div>
              </div>
              <div className="flex-grow flex flex-col items-center justify-center gap-2 px-6 py-3">
                <img src={featuredArticle?.image_url} alt="Featured" className="w-[360px] h-56 object-cover rounded-2xl" />
                <p className="text-lg font-semibold leading-tight">{featuredArticle?.title}</p>
              </div>
            </section>


            <section onClick={() => setShowFinScoreLog(true)} className="bg-white rounded-2xl px-5 py-2 text-center flex flex-col flex-1 w-1/3 h-80 border border-gray-300 cursor-pointer">
              <div className="flex justify-between items-center mb-4">
                <h3 className="m-0 text-lg font-bold">FinScore</h3>
                <IoIosInformationCircleOutline className='text-2xl' />
              </div>
              <div className='flex justify-center items-center' >
                <FinScoreChart score={userData.fin_score} />
              </div>
              <p className="text-[15px] text-gray-700 mt-4">
                Every expert was once a <b className="font-bold">beginner</b>.
                <br />
                Keep Going!
              </p>
            </section>
          </main>

          <div className="flex justify-between gap-5 pb-8 items-start bg-gray-100">

            <div className="flex flex-col flex-1 bg-transparent relative min-h-full">
              <div className="relative flex justify-between items-center mb-4 w-[60vw]">
                <h2 className="text-3xl font-semibold">Recommended Courses</h2>
                <div className="absolute top-0 right-0 flex gap-3">
                  <button
                    className={`w-10 h-10 rounded-full text-lg flex items-center justify-center 
              transition-all duration-200 cursor-pointer 
              ${canScrollLeft1 ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-white text-amber-300'}`}
                    onClick={() => scrollLeft(carouselRef1)}
                    disabled={!canScrollLeft1}
                  >
                    ❮
                  </button>

                  <button
                    className={`w-10 h-10 rounded-full text-lg flex items-center justify-center 
              transition-all duration-200 cursor-pointer 
              ${canScrollRight1 ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-white text-amber-300'}`}
                    onClick={() => scrollRight(carouselRef1)}
                    disabled={!canScrollRight1}
                  >
                    ❯
                  </button>
                </div>
              </div>

              <div ref={carouselRef1} style={{ scrollbarWidth: 'none' }} className="carousel-track bg-white rounded-2xl flex overflow-x-auto overflow-hidden w-[60vw] border border-gray-300">
                {recommendedCourses.length > 0 && recommendedCourses.map((course, index) => (
                  <div onClick={() => navigate(`/courses/course/${course.id}`)} className="bg-white rounded-2xl px-4 py-8 w-[305px] shrink-0 space-y-1 h-96 cursor-pointer" key={index}>
                    <img src={course.thumbnail_url} alt="Course" className="w-full h-44 rounded-xl object-cover" />
                    <div className="flex justify-between my-2.5 px-2 text-sm text-gray-600">
                      <span className="bg-purple-300 text-black rounded-lg px-2 py-0.5 text-xs">Basic</span>
                      <span className='font-medium' >{course.modules_count} modules • {course.duration} mins</span>
                    </div>
                    <h3 className='font-semibold px-2' >{course.title}</h3>
                    <p className='text-sm px-2' >{course.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl px-5 py-2 text-center flex flex-col justify-between w-full h-[435px] border border-gray-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="m-0 text-lg font-bold">Tasks</h3>
                <IoIosInformationCircleOutline className='text-2xl' />
              </div>
              <div className="flex-grow flex flex-col justify-around">
                <label className="flex items-center px-6 py-3 border-2 border-gray-300 rounded-full mb-3 text-lg gap-4 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 cursor-pointer" checked={tasks?.login} readOnly />
                  <span className={tasks?.login ? "line-through text-gray-500" : ""}>
                    Log in to your FinEd account
                  </span>
                </label>

                <label className="flex items-center px-6 py-3 border-2 border-gray-300 rounded-full mb-3 text-lg gap-4 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 cursor-pointer" checked={tasks?.module} readOnly />
                  <span className={tasks?.module ? "line-through text-gray-500" : ""}>
                    Complete any module today
                  </span>
                </label>

                <label className="flex items-center px-6 py-3 border-2 border-gray-300 rounded-full mb-3 text-lg gap-4 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 cursor-pointer" checked={tasks?.article} readOnly />
                  <span className={tasks?.article ? "line-through text-gray-500" : ""}>
                    Read any article today
                  </span>
                </label>

                <label className="flex items-center px-6 py-3 border-2 border-gray-300 rounded-full mb-3 text-lg gap-4 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 cursor-pointer" checked={tasks?.transaction} readOnly />
                  <span className={tasks?.transaction ? "line-through text-gray-500" : ""}>
                    Add and save today’s transaction details
                  </span>
                </label>
              </div>

            </div>
          </div>
        </div>
      }

      <footer className="bg-[#f7fafc] -mx-10 p-10 flex flex-wrap justify-between text-[#333] font-sans">

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

      <p className="text-center justify-center w-full mt-10 my-5 text-xs">
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
                onClick={() => setWarning("")}
                className={`bg-amber-400 hover:bg-amber-500 transition-all duration-200 text-white px-4 py-2 rounded-lg ${isSaved ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 rounded-2xl shadow-xl w-[500px] space-y-4">
            <p className="text-xl font-bold text-red-600">⚠️ Alert</p>
            <p className="text-md font-semibold text-gray-700">
              {error}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => { setError(""); setLoading(false); navigate("/home") }}
                className={`bg-amber-400 hover:bg-amber-500 transition-all duration-200 text-white px-4 py-2 rounded-lg ${isSaved ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaderBoard && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-xl rounded-2xl shadow-xl p-6 relative">
            <h2 className="text-2xl font-bold text-center mb-4">🏆 FinStars Leaderboard</h2>
            <button
              onClick={() => setShowLeaderBoard(false)}
              className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-black cursor-pointer"
            >
              &times;
            </button>

            {loading ? (
              <div className="overflow-y-auto max-h-[400px] divide-y divide-gray-100 px-4">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                      <div className="w-32 h-5 rounded bg-gray-300"></div>
                    </div>
                    <div className="w-16 h-5 rounded bg-gray-300"></div>
                  </div>
                ))}
                <div className="flex justify-between items-center px-2 pt-5">
                  <div className="w-40 h-5 rounded-lg bg-gray-300 animate-pulse"></div>
                  <div className="w-28 h-5 rounded-lg bg-gray-300 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[400px] divide-y divide-gray-200">

                {(() => {
                  const leaderboardWithRanks = [];
                  let rank = 1;
                  let lastStars = null;
                  let skip = 0;

                  const sortedLeaderboard = [...leaderboard].sort(
                    (a, b) => b.fin_stars - a.fin_stars
                  );

                  for (let i = 0; i < sortedLeaderboard.length; i++) {
                    const current = sortedLeaderboard[i];
                    if (current.fin_stars === lastStars) {
                      skip++;
                    } else {
                      rank += skip;
                      skip = 1;
                      lastStars = current.fin_stars;
                    }
                    leaderboardWithRanks.push({ ...current, rank });
                  }

                  return (
                    <>
                      {leaderboardWithRanks.map((entry, index) => {
                        const isCurrentUser = user?.email === entry.email;
                        const name = entry.email?.split("@")[0] || "User";
                        const rankEmoji =
                          entry.rank === 1
                            ? "🥇"
                            : entry.rank === 2
                              ? "🥈"
                              : entry.rank === 3
                                ? "🥉"
                                : `#${entry.rank}`;

                        return (
                          <div
                            key={entry.user_sub || index}
                            className={`flex justify-between items-center px-4 py-3 text-lg transition-all duration-200 ${isCurrentUser
                              ? "bg-yellow-100 font-semibold rounded-md"
                              : ""
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{rankEmoji}</span>
                              <span>{name}</span>
                            </div>
                            <span className="font-bold text-indigo-600">
                              {entry.fin_stars} ⭐
                            </span>
                          </div>
                        );
                      })}

                      <div className="flex justify-between items-center px-12 pt-5 text-lg font-semibold">
                        <p>
                          Your rank:{" "}
                          {
                            leaderboardWithRanks.find(
                              (entry) => entry.email === user?.email
                            )?.rank ?? "N/A"
                          }
                        </p>
                        <p>Your finstars: {userData?.fin_stars}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {showFinScoreLog && (
        <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-xl w-[500px] max-h-[80vh] overflow-y-auto space-y-4">
            <div className='flex justify-between'>
              <p className="text-xl font-bold text-indigo-700">🕓 FinScore History</p>
              <button
                onClick={() => setShowFinScoreLog(false)}
                className="text-2xl text-gray-500 hover:text-black cursor-pointer -mt-2"
              >
                &times;
              </button>
            </div>

            {isFetchingLog ? (
              <ul className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <li key={i} className="bg-gray-100 p-3 rounded-lg animate-pulse space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 w-16 bg-gray-300 rounded"></div>
                      <div className="h-3 w-24 bg-gray-300 rounded"></div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : finScoreLog && finScoreLog.length > 0 ? (
              <ul className="space-y-3">
                {finScoreLog.map((log, index) => (
                  <li key={index} className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-800">
                      {log.description}
                    </p>
                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                      <span>{log.change > 0 ? `+${log.change}` : log.change} pts</span>
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No recent FinScore changes logged.</p>
            )}
          </div>
        </div>
      )}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-gray-800">We’d love your feedback!</h2>
            <p className="text-gray-600">Please take a moment to tell us how we're doing.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowFeedback(false);
                  navigate("/feedback");
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg font-semibold cursor-pointer"
              >
                Give Feedback
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;