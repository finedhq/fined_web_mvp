import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import instance from "../lib/axios"
import { useAuth0 } from '@auth0/auth0-react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { FiMenu, FiX } from "react-icons/fi"

const ArticlesPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { user, isLoading, isAuthenticated, logout, loginWithRedirect } = useAuth0()
  const [role, setrole] = useState("")

  const [email, setEmail] = useState("")
  const [articles, setArticles] = useState([])
  const carouselRef1 = useRef(null)
  const carouselRef2 = useRef(null)
  const [canScrollLeft1, setCanScrollLeft1] = useState(false)
  const [canScrollRight1, setCanScrollRight1] = useState(false)
  const [canScrollLeft2, setCanScrollLeft2] = useState(false)
  const [canScrollRight2, setCanScrollRight2] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [isArticleClosed, setIsArticleClosed] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const selectedIndex = selectedArticle ? articles.findIndex(a => a.id === selectedArticle.id) : -1
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef1 = useRef(null)
  const loaderRef2 = useRef(null)
  const [pendingNextAfterFetch, setPendingNextAfterFetch] = useState(false)
  const [prefetchingNext, setPrefetchingNext] = useState(false)
  const [fetchingArticle, setFetchingArticle] = useState(false)
  const ARTICLES_PER_PAGE = 30
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [articleRating, setArticleRating] = useState(0)
  const [fetchedArticleRating, setFetchedArticleRating] = useState(null)
  const [hasUnseen, setHasUnseen] = useState(false)
  const [enteredEmail, setEnteredEmail] = useState("")
  const [isEnteredEmail, setIsEnteredEmail] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [warning, setWarning] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setEmail(user?.email || "");
      const roles = user?.["https://fined.com/roles"];
      setrole(roles?.[0] || "");
    }
  }, [isLoading, isAuthenticated]);

  const checkScroll = (el, setLeft, setRight) => {
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;

    setLeft(scrollLeft > 2);
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

  const fetchArticles = async () => {
    if (!hasMore) return
    setFetchingArticle(true)
    if (offset === 0 && articles.length > 0) return
    try {
      const limit = offset === 0 ? 37 : ARTICLES_PER_PAGE
      const res = await instance.post("/articles/getall", { limit, offset })
      if (res.data.length < limit) setHasMore(false)

      setArticles(prev => [...prev, ...res.data])
      setOffset(prev => prev + limit)
    } catch (err) {
      setError("Failed to load articles.")
    } finally {
      setFetchingArticle(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

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
    setLoading(true)
    try {
      const res = await instance.post("/articles/getenteredemail", { email })
      if (res.data[0]?.enteredEmail) {
        setEnteredEmail(res.data[0]?.enteredEmail || null)
        setIsEnteredEmail(true)
      }
    } catch (error) {
      setEnteredEmail("")
      setIsEnteredEmail(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!email) return
    fetchEnteredEmail()
    fetchHasUnseen()
  }, [email])

  useEffect(() => {
    const el1 = carouselRef1.current;
    const el2 = carouselRef2.current;

    const updateScrollStates = () => {
      checkScroll(el1, setCanScrollLeft1, setCanScrollRight1);
      checkScroll(el2, setCanScrollLeft2, setCanScrollRight2);
    };

    const handler1 = () => checkScroll(el1, setCanScrollLeft1, setCanScrollRight1);
    const handler2 = () => checkScroll(el2, setCanScrollLeft2, setCanScrollRight2);

    if (el1) {
      el1.addEventListener('scroll', handler1);
    }
    if (el2) {
      el2.addEventListener('scroll', handler2);
    }

    const resizeObserver = new ResizeObserver(updateScrollStates);
    const mutationObserver = new MutationObserver(updateScrollStates);

    if (el1) {
      resizeObserver.observe(el1);
      mutationObserver.observe(el1, { childList: true, subtree: true });
    }
    if (el2) {
      resizeObserver.observe(el2);
      mutationObserver.observe(el2, { childList: true, subtree: true });
    }

    updateScrollStates();

    return () => {
      if (el1) {
        el1.removeEventListener('scroll', handler1);
        resizeObserver.unobserve(el1);
        mutationObserver.disconnect();
      }
      if (el2) {
        el2.removeEventListener('scroll', handler2);
        resizeObserver.unobserve(el2);
        mutationObserver.disconnect();
      }
    };
  }, [articles]);


  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = 'hidden'

      const currentIndex = articles.findIndex(a => a.id === selectedArticle.id)
      const isLastArticle = currentIndex === articles.length - 1

      if (isLastArticle && hasMore && !loading && !prefetchingNext) {
        setPrefetchingNext(true)
        fetchArticles().then(() => setPrefetchingNext(false))
      }
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedArticle])

  useEffect(() => {
    if (offset === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          fetchArticles()
        }
      },
      { threshold: 1 }
    )

    if (loaderRef1.current) {
      observer.observe(loaderRef1.current)
    }
    if (loaderRef2.current) {
      observer.observe(loaderRef2.current)
    }

    return () => {
      if (loaderRef1.current) {
        observer.unobserve(loaderRef1.current)
      }
      if (loaderRef2.current) {
        observer.unobserve(loaderRef2.current)
      }
    }
  }, [articles, loading, hasMore])

  useEffect(() => {
    if (pendingNextAfterFetch && !loading && !prefetchingNext) {
      const currentIndex = articles.findIndex(a => a.id === selectedArticle?.id)
      const nextArticle = articles[currentIndex + 1]
      if (nextArticle) {
        setSelectedArticle(nextArticle)
        setPendingNextAfterFetch(false)
      }
    }
  }, [articles, loading, prefetchingNext])

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

  const fetchArticleRating = async ({ email, articleId }) => {
    setFetchedArticleRating(null)
    setArticleRating(0)
    try {
      const res = await instance.post("/articles/fetchrating", {
        email,
        articleId
      })
      if (res.data?.rating) {
        setFetchedArticleRating(res.data.rating)
        setArticleRating(res.data.rating)
      } else {
        setFetchedArticleRating(null)
        setArticleRating(0)
      }
    } catch (err) {
      toast.error("Something went wrong while fethcing article rating.")
    }
  }

  const saveArticleRating = async ({ email, articleId, rating }) => {
    try {
      const res = await instance.post("/articles/rate", {
        email,
        articleId,
        rating
      })

      if (res.status === 200) {
        toast.success("Thanks for rating the article!")
      } else {
        toast.error("Failed to submit rating.")
      }
    } catch (err) {
      toast.error("Something went wrong while rating.")
    }
  }

  const openArticle = async (article) => {
    setSelectedArticle(article)
    setIsArticleClosed(false)
    setIsFadingOut(false)
    await fetchArticleRating({ email, articleId: article.id })
    try {
      await instance.post("/articles/updatetask", { email })
    } catch (err) {
      toast.error("Failed to upload tasks.")
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
    <div className="bg-gray-100 font-inter text-[#1e1e1e] 2xl:max-w-[2000px] 2xl:mx-auto">

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
              <Link to="/courses" aria-label="View courses" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-base sm:text-lg">Courses</Link>
              <Link to="/articles" aria-label="View articles" className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 text-base sm:text-lg ${location.pathname === '/articles' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>Articles</Link>
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
        loading ?
          <div className="min-h-screen w-full p-4 sm:p-10 bg-gray-100 space-y-10 animate-pulse">
            <div className="flex flex-col sm:flex-row gap-10">
              <div className="bg-gray-300 rounded-3xl shadow-md sm:w-1/2 h-80"></div>
              <div className="flex flex-col gap-8 sm:w-1/2">
                <div className="h-6 bg-gray-300 rounded sm:w-2/3"></div>
                <div className="h-4 bg-gray-300 rounded sm:w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded sm:w-full"></div>
                <div className="h-4 bg-gray-300 rounded sm:w-5/6"></div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-12">
              <div className="flex flex-col gap-4 sm:w-1/2">
                <div className="h-72 bg-gray-300 rounded-2xl w-full"></div>
                <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
              <div className="flex flex-col gap-4 sm:w-1/2">
                <div className="h-5 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-64 bg-gray-300 rounded-2xl w-full"></div>
              </div>
            </div>
            <div className="sm:grid grid-cols-2 gap-6 hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-5 mb-6 p-4 bg-white rounded-lg shadow">
                  <div className="w-32 h-32 bg-gray-300 rounded-md"></div>
                  <div className="flex flex-col gap-3 w-full">
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-5 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          :
          <div>
            <div className="flex flex-col sm:flex-row px-4 sm:px-10 py-5 sm:py-10 gap-6">

              <div onClick={() => openArticle(articles[0])} className="bg-white min-w-1/2 rounded-3xl overflow-hidden cursor-pointer">
                <div className="relative">
                  <img src={articles[0]?.image_url || "_"} alt="article_image_1" onLoad={() => checkScroll(carouselRef1.current, setCanScrollLeft1, setCanScrollRight1)} className="w-full h-48 sm:h-96 object-cover" />
                  <span className="absolute top-4 left-4 bg-white text-sm px-3 py-1 rounded-full font-semibold shadow">Featured</span>
                </div>
                <div className="p-6">
                  <h2 className="text-base sm:text-xl font-semibold text-gray-900 mb-2">{articles[0]?.title || ""}</h2>
                  <p className="text-gray-600 text-justify text-sm max-h-10 overflow-hidden">{articles[0]?.content || ""}</p>
                  <p className='text-gray-600 text-sm mb-4' >[ . . . ]</p>
                  <p className="text-xs text-gray-400">{new Date(articles[0]?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
                </div>
              </div>


              <div className="flex flex-col gap-6 min-w-1/2">

                <div className="flex justify-end items-center space-x-2 sm:mr-6">
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
                <div ref={carouselRef1} style={{ scrollbarWidth: 'none', overflowX: 'auto', columnGap: '0rem' }} className="h-72 w-[327px] sm:h-[500px] sm:w-[690px] columns-1 carousel-track-1 space-y-[22px]" >
                  {articles.slice(3).map((article, index) =>
                    <div onClick={() => openArticle(article)} key={index + 4} className="flex gap-4 sm:gap-6 cursor-pointer h-20 w-80 sm:h-36 sm:w-[690px]">
                      <img src={article?.image_url || "_"} alt={`article_image_${index + 4}`} className="w-24 h-20 sm:w-40 sm:h-36 object-cover" />
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-400 sm:mb-1">{new Date(article?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
                        <h3 className="text-xs sm:text-lg font-semibold text-gray-900 mb-1">{article?.title || ""}</h3>
                        <p className="text-gray-600 text-justify text-[10px] sm:text-sm max-h-8 sm:max-h-16 overflow-hidden">{articles[0]?.content || ""}</p>
                        <p className='text-gray-600 text-[8px] sm:text-sm' >[ . . . ]</p>
                      </div>
                    </div>
                  )}
                  <div ref={loaderRef1} className="h-1 w-20"></div>
                  {fetchingArticle && (
                    <div className="text-center py-4 text-gray-500">Loading more articles...</div>
                  )}
                  {!hasMore && (
                    <div className="text-center py-4 text-gray-500">✔️ You're all caught up.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 px-4 sm:px-10 py-12 bg-gray-100">

              <div onClick={() => openArticle(articles[1])} className='cursor-pointer min-w-1/2' >
                <img src={articles[1]?.image_url || "_"} alt="article_image_2" onLoad={() => checkScroll(carouselRef2.current, setCanScrollLeft2, setCanScrollRight2)} className="rounded-2xl w-full h-40 sm:h-72 object-cover mb-4 sm:mb-6" />
                <h2 className="text-md sm:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">{articles[1]?.title || ""}</h2>
                <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p>{new Date(articles[1]?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
                </div>
                <p className="text-gray-600 text-justify text-xs sm:text-sm h-12 sm:max-h-10 overflow-hidden">{articles[0]?.content || ""}</p>
                <p className='text-gray-600 text-xs sm:text-sm' >[ . . . ]</p>
              </div>

              <hr className='sm:hidden' />

              <div onClick={() => openArticle(articles[2])} className="flex flex-col gap-4 sm:gap-10 min-w-1/2 cursor-pointer">
                <div className='sm:mr-6' >
                  <h2 className="text-md sm:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">{articles[2]?.title || ""}</h2>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p>{new Date(articles[2]?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
                  </div>
                  <p className="text-gray-600 text-justify text-xs sm:text-sm h-12 sm:max-h-10 overflow-hidden">{articles[2]?.content || ""}</p>
                  <p className='text-gray-600 text-xs sm:text-sm' >[ . . . ]</p>
                </div>
                <div className='sm:mr-6' >
                  <img src={articles[2]?.image_url || "_"} alt="article_image_3" className="rounded-2xl w-full h-40 sm:h-72 object-cover" />
                </div>
              </div>
            </div>

            <div className="bg-gray-100 px-10 py-12 hidden sm:block">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-semibold text-gray-900">Explore More</h2>
                <div className="flex gap-3">
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

              <div ref={carouselRef2} style={{ scrollbarWidth: 'none', overflowX: 'auto', columnGap: '0rem' }} className="max-h-[570px] columns-2 carousel-track-2 space-x-4" >
                {articles.slice(3).map((article, index) =>
                  <div key={index + 4} onClick={() => openArticle(article)} className="flex gap-5 mb-6 p-4 cursor-pointer">
                    <img src={article?.image_url || "_"} alt={`article_image_${index + 4}`} className="w-33 h-32 rounded-md object-cover" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{new Date(article?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{article?.title || ""}</h3>
                      <p className="text-gray-600 text-justify text-sm max-h-16 overflow-hidden">{articles[0]?.content || ""}</p>
                      <p className='text-gray-600 text-sm' >[ . . . ]</p>
                    </div>
                  </div>
                )}
                <div ref={loaderRef2} className="h-1"></div>
                {fetchingArticle && (
                  <div className="text-center py-4 text-gray-500">Loading more articles...</div>
                )}
                {!hasMore && (
                  <div className="text-center py-4 text-gray-500">✔️ You're all caught up.</div>
                )}
              </div>

            </div>
          </div>
        :
        <div>
          <div className="flex flex-col sm:flex-row px-4 sm:px-10 py-5 sm:py-10 gap-6">

            <div className="bg-white min-w-1/2 rounded-3xl overflow-hidden cursor-pointer">
              <div className="relative">
                <img src={articles[0]?.image_url || "_"} alt="article_image_1" onLoad={() => checkScroll(carouselRef1.current, setCanScrollLeft1, setCanScrollRight1)} className="w-full h-48 sm:h-96 object-cover" />
                <span className="absolute top-4 left-4 bg-white text-sm px-3 py-1 rounded-full font-semibold shadow">Featured</span>
              </div>
              <div className="p-6">
                <h2 className="text-base sm:text-xl font-semibold text-gray-900 mb-2">{articles[0]?.title || ""}</h2>
                <p className="text-gray-600 text-justify text-sm max-h-10 overflow-hidden">{articles[0]?.content || ""}</p>
                <p className='text-gray-600 text-sm mb-4' >[ . . . ]</p>
                <p className="text-xs text-gray-400">{new Date(articles[0]?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
              </div>
            </div>


            <div className="flex flex-col gap-6 min-w-1/2">

              <div className="flex justify-end items-center space-x-2 sm:mr-6">
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
              <div ref={carouselRef1} style={{ scrollbarWidth: 'none', overflowX: 'auto', columnGap: '0rem' }} className="h-72 w-[327px] sm:h-[500px] sm:w-[690px] columns-1 carousel-track-1 space-y-[22px]" >
                {articles.slice(3).map((article, index) =>
                  <div key={index + 4} className="flex gap-4 sm:gap-6 cursor-pointer h-20 w-80 sm:h-36 sm:w-[690px]">
                    <img src={article?.image_url || "_"} alt={`article_image_${index + 4}`} className="w-24 h-20 sm:w-40 sm:h-36 object-cover" />
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-400 sm:mb-1">{new Date(article?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
                      <h3 className="text-xs sm:text-lg font-semibold text-gray-900 mb-1">{article?.title || ""}</h3>
                      <p className="text-gray-600 text-justify text-[10px] sm:text-sm max-h-8 sm:max-h-16 overflow-hidden">{articles[0]?.content || ""}</p>
                      <p className='text-gray-600 text-[8px] sm:text-sm' >[ . . . ]</p>
                    </div>
                  </div>
                )}
                <div ref={loaderRef1} className="h-1 w-20"></div>
                {fetchingArticle && (
                  <div className="text-center py-4 text-gray-500">Loading more articles...</div>
                )}
                {!hasMore && (
                  <div className="text-center py-4 text-gray-500">✔️ You're all caught up.</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 px-4 sm:px-10 py-12 bg-gray-100">

            <div className='cursor-pointer min-w-1/2' >
              <img src={articles[1]?.image_url || "_"} alt="article_image_2" onLoad={() => checkScroll(carouselRef2.current, setCanScrollLeft2, setCanScrollRight2)} className="rounded-2xl w-full h-40 sm:h-72 object-cover mb-4 sm:mb-6" />
              <h2 className="text-md sm:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">{articles[1]?.title || ""}</h2>
              <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p>{new Date(articles[1]?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
              </div>
              <p className="text-gray-600 text-justify text-xs sm:text-sm h-12 sm:max-h-10 overflow-hidden">{articles[0]?.content || ""}</p>
              <p className='text-gray-600 text-xs sm:text-sm' >[ . . . ]</p>
            </div>

            <hr className='sm:hidden' />

            <div className="flex flex-col gap-4 sm:gap-10 min-w-1/2 cursor-pointer">
              <div className='sm:mr-6' >
                <h2 className="text-md sm:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">{articles[2]?.title || ""}</h2>
                <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p>{new Date(articles[2]?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
                </div>
                <p className="text-gray-600 text-justify text-xs sm:text-sm h-12 sm:max-h-10 overflow-hidden">{articles[2]?.content || ""}</p>
                <p className='text-gray-600 text-xs sm:text-sm' >[ . . . ]</p>
              </div>
              <div className='sm:mr-6' >
                <img src={articles[2]?.image_url || "_"} alt="article_image_3" className="rounded-2xl w-full h-40 sm:h-72 object-cover" />
              </div>
            </div>
          </div>

          <div className="bg-gray-100 px-10 py-12 hidden sm:block">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-semibold text-gray-900">Explore More</h2>
              <div className="flex gap-3">
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

            <div ref={carouselRef2} style={{ scrollbarWidth: 'none', overflowX: 'auto', columnGap: '0rem' }} className="max-h-[570px] columns-2 carousel-track-2 space-x-4" >
              {articles.slice(3).map((article, index) =>
                <div key={index + 4} className="flex gap-5 mb-6 p-4 cursor-pointer">
                  <img src={article?.image_url || "_"} alt={`article_image_${index + 4}`} className="w-33 h-32 rounded-md object-cover" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{new Date(article?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{article?.title || ""}</h3>
                    <p className="text-gray-600 text-justify text-sm max-h-16 overflow-hidden">{articles[0]?.content || ""}</p>
                    <p className='text-gray-600 text-sm' >[ . . . ]</p>
                  </div>
                </div>
              )}
              <div ref={loaderRef2} className="h-1"></div>
              {fetchingArticle && (
                <div className="text-center py-4 text-gray-500">Loading more articles...</div>
              )}
              {!hasMore && (
                <div className="text-center py-4 text-gray-500">✔️ You're all caught up.</div>
              )}
            </div>

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

      <p className="text-center justify-center w-full py-10 text-xs">
        © Copyright {new Date().getFullYear()}, All Rights Reserved by FinEd.
      </p>

      {!isArticleClosed && (
        <div
          className={`fixed inset-0 z-20 bg-gray-100 flex items-center justify-center transition-opacity duration-500 ${isFadingOut ? "fade-out" : "fade-in"
            }`}
        >
          <button
            className={`absolute left-1 sm:left-6 top-1/2 transform -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full shadow-md 
        flex items-center justify-center text-base sm:text-lg transition-all duration-200 z-50
        ${selectedIndex > 0
                ? "bg-amber-400 text-white hover:bg-amber-500 cursor-pointer"
                : "bg-white text-amber-300 cursor-not-allowed"
              }`}
            onClick={() => {
              if (selectedIndex > 0) {
                const newArticle = articles[selectedIndex - 1];
                setSelectedArticle(newArticle);
                openArticle(newArticle);
              }
            }}
            disabled={selectedIndex <= 0}
          >
            <FaArrowLeft />
          </button>
          <button
            className={`absolute right-1 sm:right-6 top-1/2 transform -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full shadow-md 
        flex items-center justify-center text-lg transition-all duration-200 z-50
        ${(selectedIndex < articles.length - 1 || hasMore)
                ? "bg-amber-400 text-white hover:bg-amber-500 cursor-pointer"
                : "bg-white text-amber-300 cursor-not-allowed"
              }`}
            onClick={() => {
              const currentIndex = articles.findIndex(a => a.id === selectedArticle?.id);
              const nextArticle = articles[currentIndex + 1];

              if (nextArticle) {
                setSelectedArticle(nextArticle);
                openArticle(nextArticle);
              } else if (prefetchingNext || loading) {
                setPendingNextAfterFetch(true);
              }
            }}
            disabled={!hasMore && selectedIndex >= articles.length - 1}
          >
            <FaArrowRight />
          </button>
          <div className="bg-white w-full h-full overflow-y-auto p-6 sm:p-10 relative rounded-none shadow-lg transition-all duration-300">
            <button
              onClick={() => {
                setIsFadingOut(true);
                setTimeout(() => {
                  setIsArticleClosed(true);
                  setSelectedArticle(null);
                }, 500);
              }}
              className="absolute -top-2 right-0 sm:top-0 sm:right-2 text-gray-500 hover:text-gray-700 text-4xl font-bold z-50 transition-all duration-200 cursor-pointer"
            >
              &times;
            </button>
            <img
              src={selectedArticle.image_url || "_"}
              alt="Article"
              className="h-60 w-full sm:max-h-full object-cover rounded-md mb-6"
            />
            <h2 className="text-xl sm:text-4xl font-bold sm:font-extrabold text-gray-800 mb-3">{selectedArticle.title}</h2>
            <p className="text-sm text-gray-500 mb-6">
              {new Date(selectedArticle.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })}
            </p>
            <div className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-line text-justify">
              {selectedArticle.content}
            </div>
            {(prefetchingNext || loading) && selectedIndex === articles.length - 1 && hasMore && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-40">
                <p className="text-gray-700 font-medium text-lg">Fetching more articles...</p>
              </div>
            )}
            <div className="mt-20 flex flex-col items-center">
              <p className="text-lg font-semibold text-gray-700 mb-2">Rate this article</p>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => { setArticleRating(star); saveArticleRating({ email, articleId: selectedArticle.id, rating: star }) }}
                    className={`text-3xl transition-transform transform hover:scale-125 cursor-pointer duration-200
${(fetchedArticleRating !== null ? fetchedArticleRating : articleRating) >= star
                        ? "text-yellow-400"
                        : "text-gray-300"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {warning && (
        <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] space-y-4">
            <p className="text-xl font-bold text-red-600">⚠️ Alert</p>
            <p className="text-md font-semibold text-gray-700">
              {warning}
            </p>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setWarning(false)}
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
                onClick={() => { setError(false); setLoading(false); navigate("/home") }}
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
};

export default ArticlesPage;