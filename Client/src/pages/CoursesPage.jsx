import React, { useEffect, useState, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import instance from "../lib/axios"
import { useAuth0 } from '@auth0/auth0-react'
import toast from 'react-hot-toast'
import { FiMenu, FiX } from "react-icons/fi"

export default function CoursesHomePage() {
    const navigate = useNavigate()
    const location = useLocation()

    const { user, isLoading, isAuthenticated, logout, loginWithRedirect } = useAuth0()
    const [role, setrole] = useState("")

    const [email, setEmail] = useState("")
    const [courses, setCourses] = useState([])
    const [ongoingCourse, setOngoingCourse] = useState({})
    const [isFetchingOngoing, setIsFetchingOngoing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [warning, setWarning] = useState("")
    const [error, setError] = useState("")

    const carouselRef = useRef(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

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
        setIsFetchingOngoing(true)
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
        } finally {
            setIsFetchingOngoing(false)
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
        setLeft(scrollLeft > 2)
        setRight(scrollLeft < maxScrollLeft - 2)
    }

    const scrollLeft = (ref) => {
        const el = ref.current;
        if (el) {
            const scrollAmount = window.innerWidth <= 768 ? 332 : window.innerWidth >= 1400 ? 930 : 620;
            el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    };

    const scrollRight = (ref) => {
        const el = ref.current;
        if (el) {
            const scrollAmount = window.innerWidth <= 768 ? 332 : window.innerWidth >= 1400 ? 930 : 620;
            el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const el = carouselRef.current;

        const handler = () => checkScroll(el, setCanScrollLeft, setCanScrollRight)

        if (el) {
            el.addEventListener('scroll', handler)
            checkScroll(el, setCanScrollLeft, setCanScrollRight)
        }

        return () => {
            if (el) el.removeEventListener('scroll', handler)
        }
    }, [courses])

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
        <div className="bg-gray-100 min-h-screen flex flex-col">
            {isAuthenticated ?
                <header className="flex flex-col md:flex-row md:items-center h-auto md:h-[63px] bg-gray-100 box-border mb-4">
                    {/* Mobile and Tablet Header */}
                    <div className="flex justify-between items-center w-full mt-4 xl:hidden px-4">
                        <div onClick={() => navigate('/')} className="flex items-center gap-2 font-bold text-lg max-w-[180px] overflow-hidden whitespace-nowrap cursor-pointer">
                            <img src="logo.jpg" alt="FinEd Logo" className="h-[48px] w-auto object-contain" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div onClick={() => navigate("/notifications")} className="relative bg-white rounded-full p-2 shadow-md cursor-pointer">
                                <img src="bell.png" alt="Bell Icon" className='w-6' />
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
                    <div className="hidden xl:flex xl:flex-row xl:items-center w-full mt-8 px-10 justify-between">
                        <div onClick={() => navigate('/home')} className="flex items-center gap-2 font-bold text-lg max-w-[180px] overflow-hidden whitespace-nowrap cursor-pointer">
                            <img src="logo.jpg" alt="FinEd Logo" className="h-[60px] w-auto object-contain rounded-b-md" />
                        </div>
                        <nav className="flex flex-wrap justify-center gap-5">
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
                            <img src="bell.png" alt="Bell Icon" width="24" />
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
                                className={`px-4 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors text-left ${location.pathname === '/courses' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
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
                :
                <div>
                    <header className="flex flex-col sm:flex-row justify-between items-center px-6 sm:px-10 lg:px-16 py-6 bg-gray-100">
                        <div className="flex items-center justify-between w-full sm:w-auto mb-4 sm:mb-0">
                            <div onClick={() => navigate('/')} className="flex items-center gap-3 font-bold text-lg max-w-[200px] overflow-hidden whitespace-nowrap cursor-pointer">
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
                            <Link to="/courses" aria-label="View courses" className="px-6 py-2 rounded-full font-medium transition-colors duration-200 text-base sm:text-lg text-white bg-amber-400">Courses</Link>
                            <Link to="/articles" aria-label="View articles" className="font-medium transition-colors duration-200 text-base sm:text-lg text-gray-700 hover:text-blue-700" >Articles</Link>
                            <Link to="/about" aria-label="About us" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-base sm:text-lg">About Us</Link>
                            <button onClick={loginWithRedirect} className="px-5 py-2 bg-amber-400 text-white rounded-lg font-bold hover:bg-amber-500 transition-colors duration-200 text-base sm:text-lg cursor-pointer">Sign up / Login</button>
                        </nav>
                    </header>
                    <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out sm:hidden z-50`}>
                        <div className="flex justify-between items-center p-5 border-b">
                            <span className="font-bold text-lg">Menu</span>
                            <button onClick={toggleSidebar} className="text-gray-800 focus:outline-none" aria-label="Close menu">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <nav role="navigation" aria-label="Mobile navigation" className="flex flex-col p-5 space-y-5">
                            <Link to="/courses" aria-label="View courses" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-lg" onClick={toggleSidebar}>Courses</Link>
                            <Link to="/articles" aria-label="View articles" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-lg" onClick={toggleSidebar}>Articles</Link>
                            <Link to="/about" aria-label="About us" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-lg" onClick={toggleSidebar}>About Us</Link>
                            <button onClick={() => { loginWithRedirect(); toggleSidebar(); }} className="px-5 py-2 bg-amber-400 text-white rounded-lg font-bold hover:bg-amber-500 transition-colors duration-200 text-lg cursor-pointer">Sign up / Login</button>
                        </nav>
                    </div>
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-white bg-opacity-80 sm:hidden z-40"
                            onClick={toggleSidebar}
                            aria-hidden="true"
                        ></div>
                    )}
                </div>
            }
            {isAuthenticated ?

                <main className="flex-grow px-4 sm:px-10 sm:pt-5">
                    {loading ?
                        <div className="min-h-screen w-full px-4 sm:px-10 pt-5 bg-gray-100 space-y-12 animate-pulse">
                            {/* Skeleton for Continue Learning section */}
                            <div>
                                <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                                <div className="flex gap-12 mb-6">
                                    {[...Array(1)].map((_, i) => (
                                        <div key={i} className="bg-gray-100 rounded-xl px-4 py-3 w-full sm:w-1/4 h-44 space-y-3 shrink-0 ml-1 border border-gray-300">
                                            <div>
                                                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                            </div>
                                            <div className="flex justify-between">
                                                <div className="w-2/5 h-20 bg-gray-300 rounded-md"></div>
                                                <div className="flex flex-col justify-center items-center w-3/5">
                                                    <div className="flex gap-2 mb-2">
                                                        <div className="h-3 w-14 bg-gray-300 rounded"></div>
                                                        <div className="h-3 w-2 bg-gray-300 rounded"></div>
                                                        <div className="h-3 w-14 bg-gray-300 rounded"></div>
                                                    </div>
                                                    <div className="h-8 w-24 bg-gray-300 rounded-full mt-2"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skeleton for Recommended Courses section */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                                    <div className="flex space-x-2">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-y-6 gap-x-[34px] mx-4 mb-10 h-[740px] overflow-hidden">
                                    {[...Array(6)].map((_, i) => (
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
                        :
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
                            <div className="flex gap-12 w-full mb-6 px-4" >
                                {isFetchingOngoing ? (
                                    <div className="bg-white rounded-xl px-4 py-3 w-full sm:w-1/4 space-y-3 sm:shrink-0 border border-gray-300 animate-pulse">
                                        <div>
                                            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                        </div>
                                        <div className="flex justify-between">
                                            <div className="w-2/5 h-20 bg-gray-300 rounded-md"></div>
                                            <div className="flex flex-col justify-center items-center w-3/5">
                                                <div className="flex gap-2 mb-2">
                                                    <div className="h-3 w-14 bg-gray-300 rounded"></div>
                                                    <div className="h-3 w-2 bg-gray-300 rounded"></div>
                                                    <div className="h-3 w-14 bg-gray-300 rounded"></div>
                                                </div>
                                                <div className="h-8 w-24 bg-gray-300 rounded-full mt-2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl hover:shadow-md transition px-4 py-3 w-full sm:w-1/4 h-fit space-y-3 sm:shrink-0 border border-gray-300">
                                        <div>
                                            <h3 className="font-semibold text-cyan-800 text-base tracking-wide sm:mb-2">
                                                {ongoingCourse?.title || courses[5]?.title}
                                            </h3>
                                            <p className="text-xs text-gray-600 mb-2">
                                                {ongoingCourse?.description || courses[5]?.description}
                                            </p>
                                        </div>
                                        <div className="flex justify-between">
                                            <img
                                                src={ongoingCourse?.thumbnail_url || courses[5]?.thumbnail_url}
                                                alt={ongoingCourse?.title || courses[5]?.title}
                                                className="w-2/5 h-20 object-cover rounded-md"
                                            />
                                            <div className="flex flex-col justify-center items-center w-3/5">
                                                <div className="flex gap-1">
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        {ongoingCourse?.modules_count || courses[5]?.modules_count} Modules
                                                    </p>
                                                    <p className="text-xs text-gray-500 mb-1">&bull;</p>
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        {ongoingCourse?.duration || courses[5]?.duration} mins
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`course/${ongoingCourse?.id || courses[5]?.id}`)}
                                                    className="bg-amber-400 text-white px-3 py-1 sm:px-6 sm:py-2 rounded-full self-end mt-2 cursor-pointer"
                                                >
                                                    {ongoingCourse?.id ? "Continue Learning" : "Start Now"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="w-full pb-10">
                                <div className="flex justify-between" >
                                    <h2 className="text-xl font-semibold">Recommended Courses</h2>
                                    <div className="flex space-x-2 mr-2 mb-6 sm:mb-2">
                                        <button
                                            className={`w-10 h-10 rounded-full text-lg flex items-center justify-center 
              transition-all duration-200 cursor-pointer 
              ${canScrollLeft ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-white text-amber-300'}`}
                                            onClick={() => scrollLeft(carouselRef)}
                                            disabled={!canScrollLeft}
                                        >
                                            ❮
                                        </button>

                                        <button
                                            className={`w-10 h-10 rounded-full text-lg flex items-center justify-center 
              transition-all duration-200 cursor-pointer 
              ${canScrollRight ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-white text-amber-300'}`}
                                            onClick={() => scrollRight(carouselRef)}
                                            disabled={!canScrollRight}
                                        >
                                            ❯
                                        </button>
                                    </div>
                                </div>
                                <div ref={carouselRef} className="flex flex-col flex-wrap gap-y-4 gap-x-[34px] h-[740px] mx-4 overflow-hidden">
                                    {courses.map((course) => (
                                        <CourseCard key={course.id} course={course} isAuthenticated={isAuthenticated} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                </main>
                :
                <div className="w-full px-4 sm:px-10 py-5">
                    <div className="flex justify-between" >
                        <h2 className="text-xl font-semibold">Recommended Courses</h2>
                        <div className="flex space-x-2 mr-2 mb-4 sm:mb-2">
                            <button
                                className={`w-10 h-10 rounded-full text-lg flex items-center justify-center 
              transition-all duration-200 cursor-pointer 
              ${canScrollLeft ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-white text-amber-300'}`}
                                onClick={() => scrollLeft(carouselRef)}
                                disabled={!canScrollLeft}
                            >
                                ❮
                            </button>

                            <button
                                className={`w-10 h-10 rounded-full text-lg flex items-center justify-center 
              transition-all duration-200 cursor-pointer 
              ${canScrollRight ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-white text-amber-300'}`}
                                onClick={() => scrollRight(carouselRef)}
                                disabled={!canScrollRight}
                            >
                                ❯
                            </button>
                        </div>
                    </div>
                    <div ref={carouselRef} className="flex flex-col flex-wrap gap-y-4 gap-x-[36px] h-[740px] mx-4 overflow-hidden">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} isAuthenticated={isAuthenticated} />
                        ))}
                    </div>
                </div>
            }

            <footer className="bg-[#f7fafc] p-6 sm:px-20 sm:py-10 flex flex-col sm:flex-row flex-wrap justify-between text-[#333] font-sans">

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
                    <Link to={isAuthenticated ? "/fin-tools" : "#"} onClick={(e) => {
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

function CourseCard({ course, isAuthenticated }) {
    const navigate = useNavigate()
    return (
        <div
            onClick={() => {
                if (isAuthenticated) {
                    navigate(`course/${course.id}`);
                } else {
                    toast.error("Please sign in");
                }
            }}
            className="bg-white rounded-xl border border-gray-300 hover:shadow-md transition h-80 sm:w-80 sm:h-[360px] cursor-pointer">
            <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-40 sm:h-48 object-cover rounded-xl mb-2"
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
