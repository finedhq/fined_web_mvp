import React, { useEffect, useState, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import instance from "../lib/axios"
import { useAuth0 } from '@auth0/auth0-react'
import toast from 'react-hot-toast'
import { FiMenu, FiX } from "react-icons/fi"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function CoursesHomePage() {
    const navigate = useNavigate()
    const location = useLocation()

    const { user, isLoading, isAuthenticated, logout, loginWithPopup } = useAuth0()
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
            const scrollAmount = window.innerWidth <= 768 ? 330 : window.innerWidth >= 1400 ? 1060 : 620;
            el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    };

    const scrollRight = (ref) => {
        const el = ref.current;
        if (el) {
            const scrollAmount = window.innerWidth <= 768 ? 330 : window.innerWidth >= 1400 ? 1060 : 620;
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
        <div className="bg-gray-100 min-h-screen flex flex-col pb-5">

            <Navbar />

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
                                                {ongoingCourse?.title || courses[courses.length - 1]?.title}
                                            </h3>
                                            <p className="text-xs text-gray-600 mb-2 max-h-16 whitespace-pre-wrap truncate">
                                                {ongoingCourse?.description || courses[courses.length - 1]?.description}
                                            </p>
                                        </div>
                                        <div className="flex gap-5">
                                            <img
                                                src={ongoingCourse?.thumbnail_url || courses[courses.length - 1]?.thumbnail_url}
                                                alt={ongoingCourse?.title || courses[courses.length - 1]?.title}
                                                className="w-2/5 h-20 object-cover rounded-md"
                                            />
                                            <div className="flex flex-col justify-center items-center w-full">
                                                <div className="flex gap-1">
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        {ongoingCourse?.modules_count || courses[courses.length - 1]?.modules_count} Modules
                                                    </p>
                                                    <p className="text-xs text-gray-500 mb-1">&bull;</p>
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        {ongoingCourse?.duration || courses[courses.length - 1]?.duration} mins
                                                    </p>
                                                </div>
                                                <div className="w-full" >
                                                    <button
                                                        onClick={() => navigate(`course/${ongoingCourse?.id || courses[courses.length - 1]?.id}`)}
                                                        className="bg-amber-400 text-white px-4 py-1 w-full sm:px-4 sm:py-2 rounded-full self-end mt-2 cursor-pointer"
                                                    >
                                                        {ongoingCourse?.id ? "Continue" : "Start Now"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="w-full pb-10">
                                <div className="flex justify-between" >
                                    <h2 className="text-xl font-semibold mb-4">Recommended Courses</h2>
                                    {/* <div className="flex space-x-2 mr-2 mb-6 sm:mb-2">
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
                                    </div> */}
                                </div>
                                {/* <div ref={carouselRef} className="flex flex-col flex-wrap gap-y-4 gap-x-[34px] h-[740px] mx-4 px-2 sm:px-0 overflow-x-auto">
                                    {courses.map((course) => (
                                        <CourseCard key={course.id} course={course} isAuthenticated={isAuthenticated} />
                                    ))}
                                </div> */}
                                <div ref={carouselRef} className="flex flex-col sm:flex-row gap-6">
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
                        {/* <div className="flex space-x-2 mr-2 mb-4 sm:mb-2">
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
                        </div> */}
                    </div>
                    {/* <div ref={carouselRef} className="flex flex-col flex-wrap gap-y-4 gap-x-[36px] h-[740px] mx-4 overflow-x-auto">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} isAuthenticated={isAuthenticated} />
                        ))}
                    </div> */}
                    <div ref={carouselRef} className="flex flex-col sm:flex-row gap-6 mt-4">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} isAuthenticated={isAuthenticated} />
                        ))}
                    </div>
                </div>
            }

            <Footer />

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
                <p className="text-xs text-gray-600 mb-2 whitespace-pre-wrap h-16 truncate">{course.description}</p>
            </div>
        </div>
    );
}
