import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import instance from "../lib/axios"
import { useAuth0 } from '@auth0/auth0-react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import toast from 'react-hot-toast'

const ArticlesPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { user, isLoading, isAuthenticated, logout } = useAuth0()
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
  const ARTICLES_PER_PAGE = 30

  const [enteredEmail, setEnteredEmail] = useState("")
  const [isEnteredEmail, setIsEnteredEmail] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [warning, setWarning] = useState("")
  const [error, setError] = useState("")

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
    if (offset === 0 && articles.length > 0) return
    try {
      const limit = offset === 0 ? 37 : ARTICLES_PER_PAGE
      const res = await instance.post("/articles/getall", { limit, offset })
      console.log(res.data)
      if (res.data.length < limit) setHasMore(false)

      setArticles(prev => [...prev, ...res.data])
      setOffset(prev => prev + limit)
    } catch (err) {
      setError("Failed to load articles.")
    }
  }

  useEffect(() => {
    if (!email) return
    fetchArticles()
  }, [email])

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

  const openArticle = async (article) => {
    setSelectedArticle(article)
    setIsArticleClosed(false)
    setIsFadingOut(false)
    try {
      const res = await instance.post("/articles/updatetask", { email })
      if (res.data.updated) {
        toast.success("Task completed !")
      }
    } catch (err) {
      toast.error("Failed to upload tasks.")
    }
  }


  return (
    <div className="mx-auto px-10 py-5 bg-gray-100 font-inter text-[#1e1e1e]">

      <header className="flex justify-between items-center h-[63px] bg-gray-100 box-border">

        <div className="flex items-center gap-2 font-bold text-lg max-w-[180px] overflow-hidden whitespace-nowrap">
          <img src="/logo.jpg" alt="FinEd Logo" className="h-[60px] w-auto object-contain" />
        </div>

        <nav className="flex gap-5">
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
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname.startsWith('/articles') ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
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

        <div className="bg-white rounded-full p-3 shadow-md">
          <img src="/bell.png" alt="Bell Icon" width="24" />
        </div>
      </header>
      {loading ?
        <div className="min-h-screen w-full p-10 bg-gray-50 space-y-10 animate-pulse">
          <div className="flex gap-10">
            <div className="bg-gray-300 rounded-3xl shadow-md w-1/2 h-96"></div>
            <div className="flex flex-col gap-8 w-1/2">
              <div className="h-6 bg-gray-300 rounded w-2/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-4 w-1/2">
              <div className="h-72 bg-gray-300 rounded-2xl w-full"></div>
              <div className="h-5 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
            <div className="flex flex-col gap-4 w-1/2">
              <div className="h-5 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-64 bg-gray-300 rounded-2xl w-full"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
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
          <div className="flex py-10 gap-6">

            <div onClick={() => openArticle(articles[0])} className="bg-white min-w-1/2 rounded-3xl overflow-hidden cursor-pointer">
              <div className="relative">
                <img src={articles[0]?.image_url || "_"} alt="article_image_1" className="w-full h-96 object-cover" />
                <span className="absolute top-4 left-4 bg-white text-sm px-3 py-1 rounded-full font-semibold shadow">Featured</span>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{articles[0]?.title || ""}</h2>
                <p className="text-gray-600 text-justify text-sm max-h-10 overflow-hidden">{articles[0]?.content || ""}</p>
                <p className='text-gray-600 text-sm mb-4' >[ . . . ]</p>
                <p className="text-xs text-gray-400">{new Date(articles[0]?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
              </div>
            </div>


            <div className="flex flex-col gap-6 min-w-1/2">

              <div className="flex justify-end items-center space-x-2 mr-6">
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
              <div ref={carouselRef1} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overflowX: 'hidden', columnGap: '0rem' }} className="h-[500px] w-[690px] columns-1 carousel-track-1 space-y-[22px]" >
                {articles.slice(3).map((article, index) =>
                  <div onClick={() => openArticle(article)} key={index + 4} className="flex gap-6 cursor-pointer h-36 w-[690px]">
                    <img src={article?.image_url || "_"} alt={`article_image_${index + 4}`} className="w-40 h-36 object-cover" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{new Date(article?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{article?.title || ""}</h3>
                      <p className="text-gray-600 text-justify text-sm max-h-16 overflow-hidden">{articles[0]?.content || ""}</p>
                      <p className='text-gray-600 text-sm' >[ . . . ]</p>
                    </div>
                  </div>
                )}
                <div ref={loaderRef1} className="h-1 w-20"></div>
                {loading && (
                  <div className="text-center py-4 text-gray-500">Loading more articles...</div>
                )}
                {!hasMore && (
                  <div className="text-center py-4 text-gray-500">✔️ You're all caught up.</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-6 bg-gray-100 py-12">

            <div onClick={() => openArticle(articles[1])} className='cursor-pointer min-w-1/2' >
              <img src={articles[1]?.image_url || "_"} alt="article_image_2" className="rounded-2xl w-full h-72 object-cover mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{articles[1]?.title || ""}</h2>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p>{new Date(articles[1]?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
              </div>
              <p className="text-gray-600 text-justify text-sm max-h-10 overflow-hidden">{articles[0]?.content || ""}</p>
              <p className='text-gray-600 text-sm' >[ . . . ]</p>
            </div>

            <div onClick={() => openArticle(articles[2])} className="flex flex-col gap-10 min-w-1/2 cursor-pointer">
              <div className='mr-6' >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{articles[2]?.title || ""}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p>{new Date(articles[2]?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || ""}</p>
                </div>
                <p className="text-gray-600 text-justify text-sm max-h-10 overflow-hidden">{articles[0]?.content || ""}</p>
                <p className='text-gray-600 text-sm' >[ . . . ]</p>
              </div>
              <div className='mr-6' >
                <img src={articles[2]?.image_url || "_"} alt="article_image_3" className="rounded-2xl w-full h-64 object-cover" />
              </div>
            </div>
          </div>

          <div className="bg-gray-100 py-12">
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

            <div ref={carouselRef2} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overflowX: 'hidden', columnGap: '0rem' }} className="max-h-[80vh] columns-2 carousel-track-2 space-x-4" >
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
              {loading && (
                <div className="text-center py-4 text-gray-500">Loading more articles...</div>
              )}
              {!hasMore && (
                <div className="text-center py-4 text-gray-500">✔️ You're all caught up.</div>
              )}
            </div>

          </div>
        </div>
      }

      <footer className="bg-[#f7fafc] -mx-10 p-10 flex flex-wrap justify-between text-[#333] font-sans">

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

      <p className="text-center justify-center w-full mt-10 mb-5 text-xs">
        © Copyright {new Date().getFullYear()}, All Rights Reserved by FinEd.
      </p>

      {!isArticleClosed && (
        <div className={`fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 ${isFadingOut ? "fade-out" : "fade-in"}`}>
          <div className="absolute top-1/2 left-1/7 transform -translate-y-1/2">
            <button
              className={`w-12 h-12 rounded-full text-lg flex items-center justify-center 
              transition-all duration-200 cursor-pointer ${selectedIndex > 0 ? "bg-amber-400 text-white hover:bg-amber-500" : 'bg-white text-amber-300 cursor-not-allowed'}`}
              onClick={() => selectedIndex > 0 && setSelectedArticle(articles[selectedIndex - 1])}
              disabled={selectedIndex <= 0}
            >
              <FaArrowLeft />
            </button>
          </div>

          <div className="absolute top-1/2 right-1/7 transform -translate-y-1/2">
            <button
              className={`w-12 h-12 rounded-full text-lg flex items-center justify-center 
              transition-all duration-200 cursor-pointer ${(selectedIndex < articles.length - 1 || hasMore) ? "bg-amber-400 text-white hover:bg-amber-500" : 'bg-white text-amber-300 cursor-not-allowed'}`}
              onClick={() => {
                const currentIndex = articles.findIndex(a => a.id === selectedArticle?.id)
                const nextArticle = articles[currentIndex + 1]

                if (nextArticle) {
                  setSelectedArticle(nextArticle)
                } else if (prefetchingNext || loading) {
                  setPendingNextAfterFetch(true)
                }
              }}
              disabled={!hasMore && selectedIndex >= articles.length - 1}
            >
              <FaArrowRight />
            </button>
          </div>
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-8 relative">

            <button
              onClick={() => {
                setIsFadingOut(true)
                setTimeout(() => {
                  setIsArticleClosed(true)
                  setSelectedArticle(null)
                }, 1000)
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl font-bold cursor-pointer"
            >
              ×
            </button>

            <img src={selectedArticle.image_url || "_"} alt="Article" className="w-full h-64 object-cover rounded-md mb-6" />
            <h2 className="text-3xl font-bold mb-2">{selectedArticle.title}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {new Date(selectedArticle.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </p>
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line text-justify">
              {selectedArticle.content}
            </p>
            {(prefetchingNext || loading) && selectedIndex === articles.length - 1 && hasMore && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                <p className="text-gray-700 font-medium">Fetching more articles...</p>
              </div>
            )}
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