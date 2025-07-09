import React, { useEffect, useState, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import instance from "../lib/axios"
import { useAuth0 } from '@auth0/auth0-react'
import toast from 'react-hot-toast'

export default function CoursesHomePage() {
    const navigate = useNavigate()
    const location = useLocation()

    const { user, isLoading, isAuthenticated, logout } = useAuth0()
    const [role, setrole] = useState("")

    const [email, setEmail] = useState("")
    const [courses, setCourses] = useState([])
    const [ongoingCourse, setOngoingCourse] = useState({})
    const [loading, setLoading] = useState(true)
    const [warning, setWarning] = useState("")
    const [error, setError] = useState("")

    const carouselRef1 = useRef(null)
    const carouselRef2 = useRef(null)
    const [canScrollLeft1, setCanScrollLeft1] = useState(false)
    const [canScrollRight1, setCanScrollRight1] = useState(false)
    const [canScrollLeft2, setCanScrollLeft2] = useState(false)
    const [canScrollRight2, setCanScrollRight2] = useState(false)

    const [enteredEmail, setEnteredEmail] = useState("")
    const [isEnteredEmail, setIsEnteredEmail] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/")
        } else if (!isLoading && isAuthenticated) {
            setEmail(user?.email || "")
            const roles = user?.["https://fined.com/roles"]
            setrole(roles?.[0] || "")
        }
    }, [isLoading, isAuthenticated])

    async function fetchCourses() {
        setLoading(true)
        try {
            const res = await instance.get("/courses/getall")
            if (res.data.length > 0) {
                setCourses(res.data)
                setLoading(false)
            }
        } catch (err) {
            setError("Failed to load courses.")
        }
    }

    async function fetchOngoingCourses() {
        try {
            const res = await instance.post("/courses/getongoingcourse", { email })
            console.log(res.data)
            if (res.data?.title) {
                setOngoingCourse(res.data)
            }
            else {
                toast.error("No ongoing course found. Start a course.")
            }
        } catch (err) {
            setWarning("Failed to load ongoing course.")
        }
    }

    useEffect(() => {
        fetchCourses()
    }, [email])

    useEffect(() => {
        if (!email) return
        fetchOngoingCourses()
    }, [email])

    const checkScroll = (el, setLeft, setRight) => {
        if (!el) return
        const scrollLeft = el.scrollLeft
        const maxScrollLeft = el.scrollWidth - el.clientWidth
        setLeft(scrollLeft > 0)
        setRight(scrollLeft < maxScrollLeft)
    }

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
        const el2 = carouselRef2.current;

        const handler1 = () => checkScroll(el1, setCanScrollLeft1, setCanScrollRight1)
        const handler2 = () => checkScroll(el2, setCanScrollLeft2, setCanScrollRight2)

        if (el1) {
            el1.addEventListener('scroll', handler1)
            checkScroll(el1, setCanScrollLeft1, setCanScrollRight1)
        }
        if (el2) {
            el2.addEventListener('scroll', handler2)
            checkScroll(el2, setCanScrollLeft2, setCanScrollRight2)
        }

        return () => {
            if (el1) el1.removeEventListener('scroll', handler1)
            if (el2) el2.removeEventListener('scroll', handler2)
        }
    }, [courses])

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
        <div className="bg-gray-100 min-h-screen flex flex-col px-10 pt-5">
            <header className="flex justify-between items-center h-[63px] py-6 bg-gray-100 box-border">

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

                <div onClick={() => navigate("/notifications")} className="bg-white rounded-full p-3 shadow-md cursor-pointer">
                    <img src="bell.png" alt="Bell Icon" width="24" />
                </div>
            </header>

            <main className="flex-grow py-10">
                {loading ?
                    <div className="min-h-screen w-full p-10 bg-gray-50 space-y-10 animate-pulse">
                        <div className="flex gap-6 overflow-hidden">
                            <div className="bg-white h-[360px] w-96 rounded-xl shadow flex flex-col">
                                <div className="h-40 bg-gray-300 rounded-t-xl"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-3 w-1/2 bg-gray-300 rounded"></div>
                                    <div className="h-4 w-full bg-gray-300 rounded"></div>
                                    <div className="h-3 w-5/6 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white h-[360px] w-96 rounded-xl shadow flex flex-col">
                                    <div className="h-40 bg-gray-300 rounded-t-xl"></div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-3 w-1/2 bg-gray-300 rounded"></div>
                                        <div className="h-4 w-full bg-gray-300 rounded"></div>
                                        <div className="h-3 w-5/6 bg-gray-300 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                            <div>
                                <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="bg-white h-[360px] rounded-xl shadow flex flex-col">
                                            <div className="h-40 bg-gray-300 rounded-t-xl"></div>
                                            <div className="p-4 space-y-3">
                                                <div className="h-3 w-1/2 bg-gray-300 rounded"></div>
                                                <div className="h-4 w-full bg-gray-300 rounded"></div>
                                                <div className="h-3 w-5/6 bg-gray-300 rounded"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="bg-white h-[360px] w-72 rounded-xl shadow">
                                            <div className="h-40 bg-gray-300 rounded-t-xl"></div>
                                            <div className="p-4 space-y-3">
                                                <div className="h-3 w-1/2 bg-gray-300 rounded"></div>
                                                <div className="h-4 w-full bg-gray-300 rounded"></div>
                                                <div className="h-3 w-5/6 bg-gray-300 rounded"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <div>
                        <div className="flex justify-between mb-4" >
                            <h2 className="text-xl font-semibold">Continue Learning</h2>
                            <div className="flex space-x-2 justify-end">
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
                        <div className="flex gap-12 w-full h-[400px] mb-4" >
                            <div className="bg-white rounded-xl hover:shadow-md transition w-1/4 h-96 shrink-0 ml-1 border border-gray-300">
                                <img
                                    src={ongoingCourse?.thumbnail_url || courses[5]?.thumbnail_url}
                                    alt={ongoingCourse?.title || courses[5]?.title}
                                    className="w-full h-44 object-cover rounded-md mb-2"
                                />
                                <div className="p-4 flex flex-col justify-between h-48" >
                                    <div>
                                        <div className="flex gap-1" >
                                            <p className="text-xs text-gray-500 mb-1">{ongoingCourse?.modules_count || courses[5]?.modules_count}  Modules</p>
                                            <p className="text-xs text-gray-500 mb-1">&bull;</p>
                                            <p className="text-xs text-gray-500 mb-1">{ongoingCourse?.duration || courses[5]?.duration} mins</p>
                                        </div>
                                        <h3 className="font-semibold text-cyan-800 text-base tracking-wide mb-2">
                                            {ongoingCourse?.title || courses[5]?.title}
                                        </h3>
                                        <p className="text-xs text-gray-600 mb-2">{ongoingCourse?.description || courses[5]?.description}</p>
                                    </div>
                                    <button onClick={() => navigate(`course/${ongoingCourse?.id || courses[5]?.id}`)} className="bg-amber-400 text-white px-6 py-2 rounded-full self-end mt-2 cursor-pointer" >{ongoingCourse?.id ? "Continue Learning" : "Start Now"}</button>
                                </div>
                            </div>
                            <div ref={carouselRef1} className="w-full flex overflow-hidden gap-[21px] px-1" >
                                {courses.map((course, index) =>
                                    <div key={index} className="bg-white rounded-xl border border-gray-300 hover:shadow-md transition w-80 h-96 shrink-0">
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-44 object-cover rounded-md mb-2"
                                        />
                                        <div className="p-4 flex flex-col justify-between h-48" >
                                            <div>
                                                <div className="flex gap-1" >
                                                    <p className="text-xs text-gray-500 mb-1">{course.modules_count}  Modules</p>
                                                    <p className="text-xs text-gray-500 mb-1">&bull;</p>
                                                    <p className="text-xs text-gray-500 mb-1">{course.duration} mins</p>
                                                </div>
                                                <h3 className="font-semibold text-cyan-800 text-base tracking-wide mb-2">
                                                    {course.title}
                                                </h3>
                                                <p className="text-xs text-gray-600 mb-2">{course.description}</p>
                                            </div>
                                            <button onClick={() => navigate(`course/${course.id}`)} className="bg-amber-400 text-white px-6 py-2 rounded-full self-end mt-2 cursor-pointer" >Start Now</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <section className="w-full flex">
                            <div className="w-[780px] px-2" >
                                <h2 className="text-xl font-semibold mb-7">Recommended Courses</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                                    {courses.slice(0, 4).map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            </div>
                            <div className="w-4/5" >
                                <div className="flex justify-between mb-4" >
                                    <h2 className="text-xl font-semibold">Trending Courses</h2>
                                    <div className="flex space-x-2">
                                        <button
                                            className={`w-10 h-10 rounded-full text-lg flex items-center justify-center 
              transition-all duration-200 cursor-pointer 
              ${canScrollLeft2 ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-white text-amber-300'}`}
                                            onClick={() => scrollLeft(carouselRef2)}
                                            disabled={!canScrollLeft2}
                                        >
                                            ❮
                                        </button>

                                        <button
                                            className={`w-10 h-10 rounded-full text-lg flex items-center justify-center 
              transition-all duration-200 cursor-pointer 
              ${canScrollRight2 ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-white text-amber-300'}`}
                                            onClick={() => scrollRight(carouselRef2)}
                                            disabled={!canScrollRight2}
                                        >
                                            ❯
                                        </button>
                                    </div>
                                </div>
                                <div ref={carouselRef2} className="flex border border-gray-100 flex-col flex-wrap gap-3 h-[740px] overflow-hidden">
                                    {courses.map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                }
            </main>

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
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] space-y-4">
                        <p className="text-xl font-bold text-red-600">⚠️ Alert</p>
                        <p className="text-md font-semibold text-gray-700">
                            {error}
                        </p>
                        <div className="flex justify-end pt-4">
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

        </div>
    );
}

function CourseCard({ course }) {
    const navigate = useNavigate()
    return (
        <div onClick={() => navigate(`course/${course.id}`)} className="bg-white rounded-xl border border-gray-300 hover:shadow-md transition w-68 h-[360px] cursor-pointer">
            <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-40 object-cover rounded-md mb-2"
            />
            <div className="p-4 space-y-2" >
                <div className="flex gap-1" >
                    <p className="text-xs text-gray-500 mb-1">{course.modules_count}  Modules</p>
                    <p className="text-xs text-gray-500 mb-1">&bull;</p>
                    <p className="text-xs text-gray-500 mb-1">{course.duration} mins</p>
                </div>
                <h3 className="font-semibold text-cyan-800 text-base tracking-wide mb-2">
                    {course.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2">{course.description}</p>
            </div>
        </div>
    );
}
