import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast";

export default function LandingPage() {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [canScrollLeftCourses, setCanScrollLeftCourses] = useState(false);
  const [canScrollRightCourses, setCanScrollRightCourses] = useState(true);
  const [canScrollLeftArticles, setCanScrollLeftArticles] = useState(false);
  const [canScrollRightArticles, setCanScrollRightArticles] = useState(true);
  const courseCarouselRef = useRef(null);
  const articleCarouselRef = useRef(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && location.pathname === '/') {
      navigate('/home', { replace: true });
    }
  }, [isLoading, isAuthenticated, location.pathname, navigate]);

  // Enhanced loading UI
  if (isAuthenticated && isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-800 font-semibold">Loading...</p>
        </div>
      </div>
    );
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

  const checkScroll = (ref, setLeft, setRight) => {
    const el = ref.current;
    if (!el) return;
    setLeft(el.scrollLeft > 0);
    setRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  const scrollLeft = (ref) => {
    const el = ref.current;
    if (el) {
      const cardWidth = el.querySelector('.card-content')?.offsetWidth || 260;
      el.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' }); // Include gap
    }
  };

  const scrollRight = (ref) => {
    const el = ref.current;
    if (el) {
      const cardWidth = el.querySelector('.card-content')?.offsetWidth || 260;
      el.scrollBy({ left: cardWidth + 24, behavior: 'smooth' }); // Include gap
    }
  };

  useEffect(() => {
    const courseEl = courseCarouselRef.current;
    const articleEl = articleCarouselRef.current;
    const handleCourseScroll = () => checkScroll(courseEl, setCanScrollLeftCourses, setCanScrollRightCourses);
    const handleArticleScroll = () => checkScroll(articleEl, setCanScrollLeftArticles, setCanScrollRightArticles);

    if (courseEl) {
      courseEl.addEventListener('scroll', handleCourseScroll);
      checkScroll(courseEl, setCanScrollLeftCourses, setCanScrollRightCourses);
    }
    if (articleEl) {
      articleEl.addEventListener('scroll', handleArticleScroll);
      checkScroll(articleEl, setCanScrollLeftArticles, setCanScrollRightArticles);
    }

    return () => {
      if (courseEl) courseEl.removeEventListener('scroll', handleCourseScroll);
      if (articleEl) articleEl.removeEventListener('scroll', handleArticleScroll);
    };
  }, []);

  const courses = [
    { title: 'Stock Market Basics', modules: 5, duration: 25 },
    { title: 'Investing 101', modules: 6, duration: 30 },
    { title: 'Mutual Funds', modules: 4, duration: 20 },
    { title: 'Crypto Explained', modules: 5, duration: 22 },
  ];

  const articles = [
    { title: 'Stock Market Basics', modules: 5, duration: 25 },
    { title: 'Finance Tips', modules: 3, duration: 15 },
    { title: 'Invest Smart', modules: 6, duration: 30 },
    { title: 'Crypto Crash Course', modules: 4, duration: 20 },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 font-inter">
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .wave-container {
            position: relative;
            overflow: hidden;
            background: #431FCE;
          }
          @media (min-width: 1024px) and (max-width: 1366px) {
            .ipad-pro-fix {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 1.5rem;
              overflow-x: visible;
            }
            .ipad-pro-fix .card-content img {
              width: clamp(60px, 10vw, 80px);
              height: clamp(60px, 10vw, 80px);
              max-width: clamp(70px, 12vw, 90px);
              object-fit: contain;
            }
            .ipad-pro-fix .card-content {
              min-width: 0;
              width: 100%;
              padding: 1rem;
            }
          }
        `}
      </style>
      <header className="flex flex-col sm:flex-row justify-between items-center px-6 sm:px-10 lg:px-16 py-6 bg-white shadow-sm">
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
          <Link to="/about" aria-label="About us" className="text-gray-800 font-medium hover:text-blue-700 transition-colors duration-200 text-base sm:text-lg">About Us</Link>
          <button onClick={loginWithRedirect} className="px-5 py-2 bg-amber-400 text-white rounded-lg font-bold hover:bg-amber-500 transition-colors duration-200 text-base sm:text-lg">Sign up / Login</button>
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
          <button onClick={() => { loginWithRedirect(); toggleSidebar(); }} className="px-5 py-2 bg-amber-400 text-white rounded-lg font-bold hover:bg-amber-500 transition-colors duration-200 text-lg">Sign up / Login</button>
        </nav>
      </div>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-80 sm:hidden z-40"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      <main className="flex flex-col lg:flex-row justify-between items-center px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20">
        <div className="max-w-full lg:max-w-xl mb-10 lg:mb-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-5 font-semibold text-center lg:text-left leading-tight">Take Control of Your Financial Future—For Free</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 text-center lg:text-left">
            FinEd simplifies finance with bite-sized, engaging courses designed to help you save more, invest smarter, and take control of your money - all for free!
          </p>
        </div>
        <div className="w-full lg:w-[600px] flex justify-center">
          <img
            src="/dashboard.png"
            srcSet="/dashboard-320w.png 320w, /dashboard-640w.png 640w, /dashboard.png 1280w"
            sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
            alt="Code preview"
            loading="lazy"
            className="w-full max-w-[600px] rounded-2xl shadow-xl object-contain"
          />
        </div>
      </main>

      <section className="bg-[#3B0DAD] text-white py-12 sm:py-16 px-6 sm:px-10 lg:px-16 text-center relative">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-5 font-semibold">Jump into your first course</h2>
        <p className="text-base sm:text-lg mb-8">No sign-in, no hassle. Start learning about money in just one click.</p>
        <Link to="/course/1" className="bg-[#fbbf24] text-white py-3 px-8 rounded-lg font-bold no-underline text-base sm:text-lg hover:bg-[#e6b640] transition-colors duration-200">Give It a Go →</Link>
      </section>

      <div className="py-12 sm:py-16 px-6 sm:px-10 lg:px-20 flex flex-col md:flex-row justify-between items-center bg-white gap-8">
        <div className="flex-1 w-full md:w-[45%] text-center md:text-left mb-10 md:mb-0">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">Small Lessons. Big Impact.</h2>
          <ul className="list-none p-0 mb-6 space-y-4">
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Step-by-step roadmaps to guide your journey</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Quizzes that reinforce learning, not test memory</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Real-life examples to make concepts stick</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Zero jargon—just clear, practical explanations</li>
          </ul>
          <p className="text-base sm:text-lg">Perfect for busy minds with big goals.</p>
        </div>
        <div className="flex-1 w-full md:w-[45%] flex justify-center">
          <img
            src="/dashboard.png"
            srcSet="/dashboard-320w.png 320w, /dashboard-640w.png 640w, /dashboard.png 1280w"
            sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
            alt="Dashboard preview 1"
            loading="lazy"
            className="w-full max-w-[500px] h-auto rounded-lg shadow-lg object-contain"
          />
        </div>
      </div>

      <div className="py-12 sm:py-16 px-6 sm:px-10 lg:px-20 flex flex-col-reverse md:flex-row justify-between items-center bg-white gap-8">
        <div className="flex-1 w-full md:w-[45%] flex justify-center mb-10 md:mb-0">
          <img
            src="/dashboard.png"
            srcSet="/dashboard-320w.png 320w, /dashboard-640w.png 640w, /dashboard.png 1280w"
            sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
            alt="Dashboard preview 2"
            loading="lazy"
            className="w-full max-w-[500px] h-auto rounded-lg shadow-lg object-contain"
          />
        </div>
        <div className="flex-1 w-full md:w-[45%] text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">Knowledge Pays—Literally.</h2>
          <ul className="list-none p-0 mb-6 space-y-4">
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Collect FinStars as you complete lessons and quizzes</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Climb the leaderboard and track your progress</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Unlock real rewards—from gift cards to exclusive perks</li>
          </ul>
          <p className="text-base sm:text-lg">
            Learn smart, earn smarter with our rewards system.<br />
            Because learning finance should feel as rewarding as it is impactful.
          </p>
        </div>
      </div>

      <div className="py-12 sm:py-16 px-6 sm:px-10 lg:px-20 flex flex-col md:flex-row justify-between items-center bg-white gap-8">
        <div className="flex-1 w-full md:w-[45%] text-center md:text-left mb-10 md:mb-0">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">Turn Knowledge into Action</h2>
          <ul className="list-none p-0 mb-6 space-y-4">
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Interactive tools that bridge learning with real-life money moves</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Built for everyday use, from quick decisions to long-term planning</li>
            <li className="relative pl-8 text-base sm:text-lg text-left before:content-['✔'] before:text-[#431FCE] before:bg-[#e9dbf7] before:rounded-full before:p-1 before:text-xs before:absolute before:left-0 before:top-1">Designed for simplicity, so you can focus on what matters</li>
          </ul>
          <p className="text-base sm:text-lg">
            Learning is just the start—our tools help you make it real from budget trackers to smart goal planners, we have something for everyone.
          </p>
        </div>
        <div className="flex-1 w-full md:w-[45%] flex justify-center">
          <img
            src="/dashboard.png"
            srcSet="/dashboard-320w.png 320w, /dashboard-640w.png 640w, /dashboard.png 1280w"
            sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
            alt="Organization Overview"
            loading="lazy"
            className="w-full max-w-[500px] h-auto rounded-lg shadow-lg object-contain"
          />
        </div>
      </div>

      <section className="wave-container text-white py-16 px-6 sm:px-10 lg:px-16">
        <div className="flex justify-between items-center mb-8 px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Explore Courses</h2>
          <div className="flex gap-3">
            <button
              className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-all duration-200 ${canScrollLeftCourses ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-gray-200 text-gray-400'}`}
              onClick={() => scrollLeft(courseCarouselRef)}
              disabled={!canScrollLeftCourses}
              aria-label="Scroll courses left"
            >
              ❮
            </button>
            <button
              className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-all duration-200 ${canScrollRightCourses ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-gray-200 text-gray-400'}`}
              onClick={() => scrollRight(courseCarouselRef)}
              disabled={!canScrollRightCourses}
              aria-label="Scroll courses right"
            >
              ❯
            </button>
          </div>
        </div>

        <div ref={courseCarouselRef} role="region" aria-label="Explore courses carousel" className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-6 mb-8 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory hide-scrollbar ipad-pro-fix">
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <div key={index} className="bg-white text-gray-900 rounded-xl p-8 shadow-md flex flex-col justify-between h-48 transition-transform duration-200 hover:-translate-y-1 min-w-[260px] sm:min-w-0 snap-start card-content">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl text-purple-800 font-semibold">{course.title}</h3>
                  <img
                    src="/stock.png"
                    srcSet="/stock-320w.png 320w, /stock-640w.png 640w, /stock.png 1280w"
                    sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
                    alt={course.title}
                    loading="lazy"
                    className="w-12 sm:w-16 md:w-20 lg:w-24 h-12 sm:h-16 md:h-20 lg:h-24 object-contain max-w-[80px] md:max-w-[100px] lg:max-w-[120px]"
                    style={{ width: '80px', height: '80px', maxWidth: '90px' }}
                  />
                </div>
                <div className="mt-auto">
                  <p className="text-sm sm:text-base text-gray-700">{course.modules} modules • {course.duration} mins</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 p-4">No courses available.</p>
          )}
        </div>

        <div className="wave absolute bottom-0 left-0 w-full h-24 overflow-hidden leading-none z-0">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="relative block w-full h-24">
            <path d="M0.00,49.98 C150.00,150.00 349.90,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      <section className="bg-white py-16 px-6 sm:px-10 lg:px-16">
        <div className="flex justify-between items-center mb-8 px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Articles</h2>
          <div className="flex gap-3">
            <button
              className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-all duration-200 ${canScrollLeftArticles ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-gray-200 text-gray-400'}`}
              onClick={() => scrollLeft(articleCarouselRef)}
              disabled={!canScrollLeftArticles}
              aria-label="Scroll articles left"
            >
              ❮
            </button>
            <button
              className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-all duration-200 ${canScrollRightArticles ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-gray-200 text-gray-400'}`}
              onClick={() => scrollRight(articleCarouselRef)}
              disabled={!canScrollRightArticles}
              aria-label="Scroll articles right"
            >
              ❯
            </button>
          </div>
        </div>

        <div ref={articleCarouselRef} role="region" aria-label="Articles carousel" className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-6 mb-8 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory hide-scrollbar ipad-pro-fix">
          {articles.length > 0 ? (
            articles.map((article, index) => (
              <div key={index} className="bg-white text-gray-900 rounded-xl p-8 shadow-md flex flex-col justify-between h-48 transition-transform duration-200 hover:-translate-y-1 min-w-[260px] sm:min-w-0 snap-start card-content">
                <div className="flex justify-between items-center">
                  <strong className="text-xl sm:text-2xl lg:text-3xl text-purple-800 font-semibold">{article.title}</strong>
                  <img
                    src="/stock.png"
                    srcSet="/stock-320w.png 320w, /stock-640w.png 640w, /stock.png 1280w"
                    sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
                    alt={article.title}
                    loading="lazy"
                    className="w-12 sm:w-16 md:w-20 lg:w-24 h-12 sm:h-16 md:h-20 lg:h-24 object-contain max-w-[80px] md:max-w-[100px] lg:max-w-[120px]"
                    style={{ width: '80px', height: '80px', maxWidth: '90px' }}
                  />
                </div>
                <div className="mt-auto">
                  <p className="text-sm sm:text-base text-gray-700">{article.modules} modules • {article.duration} mins</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 p-4">No articles available.</p>
          )}
        </div>
      </section>

      <footer className="bg-[#f7fafc] py-12 px-6 sm:px-10 lg:px-16 flex flex-col md:flex-row flex-wrap justify-between text-[#333] font-sans gap-8">
        <div className="flex-1 basis-full md:basis-[200px] min-w-[200px] flex flex-col items-center md:items-start mb-8 md:mb-0">
          <img
            src="/logo.jpg"
            srcSet="/logo-320w.jpg 320w, /logo-640w.jpg 640w, /logo.jpg 1280w"
            sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
            alt="FinEd Logo"
            loading="lazy"
            className="h-10 sm:h-12 mb-4"
          />
          <p className="text-base sm:text-lg text-gray-700 mb-4 text-center md:text-left">Financial Education made Easy.</p>
          <div className="flex gap-5">
            <a href="https://www.linkedin.com/company/fined-personal-finance/" aria-label="Visit our LinkedIn page">
              <img
                src="/linkedin.png"
                srcSet="/linkedin-320w.png 320w, /linkedin-640w.png 640w, /linkedin.png 1280w"
                sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
                alt="LinkedIn"
                loading="lazy"
                className="w-10 h-10 transition-transform duration-200 hover:scale-110 cursor-pointer"
              />
            </a>
            <a href="https://instagram.com/fined.personalfinance" aria-label="Visit our Instagram page">
              <img
                src="/insta.jpg"
                srcSet="/insta-320w.jpg 320w, /insta-640w.jpg 640w, /insta.jpg 1280w"
                sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
                alt="Instagram"
                loading="lazy"
                className="w-10 h-10 transition-transform duration-200 hover:scale-110 cursor-pointer"
              />
            </a>
          </div>
        </div>
        <div className="flex-1 basis-full md:basis-[200px] min-w-[200px] text-center md:text-left">
          <h4 className="text-sm sm:text-base font-semibold text-gray-500 uppercase mb-4">FEATURED</h4>
          <Link to="/courses" aria-label="View courses" className="block mb-3 text-base sm:text-lg text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Courses</Link>
          <Link to="/articles" aria-label="View articles" className="block mb-3 text-base sm:text-lg text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Articles</Link>
          <Link onClick={() => toast.error("Please sign in")} aria-label="View FinTools" className="block mb-3 text-base sm:text-lg text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">FinTools</Link>
          <Link to="/about" aria-label="About us" className="block mb-3 text-base sm:text-lg text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">About Us</Link>
        </div>
        <div className="flex-1 basis-full md:basis-[200px] min-w-[200px] text-center md:text-left">
          <h4 className="text-sm sm:text-base font-semibold text-gray-500 uppercase mb-4">OTHER</h4>
          <Link to="/help" aria-label="Help" className="block mb-3 text-base sm:text-lg text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Help</Link>
          <Link to="/contact" aria-label="Contact us" className="block mb-3 text-base sm:text-lg text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Contact Us</Link>
          <Link to="/feedback" aria-label="Feedback" className="block mb-3 text-base sm:text-lg text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Feedback</Link>
        </div>
        <div className="flex-1 basis-full md:basis-[200px] min-w-[200px] text-center md:text-left">
          <h4 className="text-sm sm:text-base font-semibold text-gray-400 uppercase mb-4">NEWSLETTER</h4>
          <input type="email" placeholder="Enter your email address" className="p-3 w-full mb-4 border border-gray-200 rounded-md text-base sm:text-lg box-border" />
          <button onClick={() => toast.error("Please sign in")} className="p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border text-base sm:text-lg">
            Subscribe Now
          </button>
        </div>
      </footer>

      <p className="text-center w-full py-6 sm:py-8 text-sm sm:text-base">
        © Copyright {new Date().getFullYear()}, All Rights Reserved by FinEd.
      </p>
    </div>
  );
}