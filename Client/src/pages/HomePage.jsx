import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import fallbackProfile from "/profile.png?url.";
import axios from '../lib/axios.js';

const HomePage = () => {
  const { user, isLoading, isAuthenticated, logout } = useAuth0();
  const [role, setrole] = useState("");
  const [imgsrc, setimgsrc] = useState("");
  const [courses, setCourses] = useState([]);
  const [streak, setstreak] = useState(0);
  const [article, setarticle] = useState(null);
  const carouselRef = useRef(null);
  const [loadingData, setLoadingData] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(0);
  const coursesPerPage = 3;

  const paginatedCourses = courses.slice(
    currentPage * coursesPerPage,
    currentPage * coursesPerPage + coursesPerPage
  );

  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const goToPrevious = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const goToNext = () => {
    if ((currentPage + 1) * coursesPerPage < courses.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const roles = user?.["https://fined.com/roles"];
      setrole(roles?.[0]);
      setimgsrc(user?.picture);
    }
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/courses/getall', {
          params: {
            userid: user?.sub,
            email: user?.email,
          }
        });

        const sortedCourse = res?.data?.courses?.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        setCourses(sortedCourse);
        setstreak(res?.data?.streak);
        setarticle(res?.data?.article);
      } catch (error) {
        console.log(error);
        alert("ServerError!!!");
      } finally {
        setLoadingData(false);
      }
    };

    if (user && isAuthenticated && !isLoading) {
      fetchCourses();
    }
  }, [user, isAuthenticated, isLoading]);

  if (isLoading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl font-semibold bg-gray-50">
        Loading...
      </div>
    );
  }


  return (
    <div className="mx-auto p-5 bg-gray-50 font-inter text-[#1e1e1e]">

      <header className="flex justify-between items-center h-[63px] px-12 py-6 bg-gray-50 shadow-sm box-border">

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

        <div className="bg-white rounded-full p-3 shadow-md">
          <img src="bell.png" alt="Bell Icon" width="24" />
        </div>
      </header>

      <main className="flex gap-5 items-start p-5 bg-gray-50">

        <div className="flex-none w-[480px] flex flex-col gap-5 h-[320px]">

          <section className="bg-[#4E00E3] p-[15px] rounded-2xl shadow-sm text-white text-center flex-1">
            <div className="relative w-[75px] h-[75px] mx-auto mt-[-6px]">
              <img src={imgsrc} onError={(e) => setimgsrc("bell.png")} referrerPolicy="no-referrer" alt="Profile" className="w-[75px] h-[75px] object-cover rounded-full border-2 border-gray-300" />
              <img src="edit.png" className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white bg-gray-200 p-1" alt="Edit" />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white text-center">{user.name}</h3>
            <div className="flex justify-center gap-[50px] mt-[5px]">
              <div className="bg-white px-[7px] py-[7px] rounded-[16px] flex items-center gap-[20px] font-semibold shadow-sm text-gray-900">
                <img src="star.png" alt="Star" className="w-5 h-5" /> 320
              </div>
              <div className="bg-white px-[7px] py-[7px] rounded-[16px] flex items-center gap-[20px] font-semibold shadow-sm text-gray-900">
                <img src="flame.png" alt="Fire" className="w-5 h-5" /> {streak}
              </div>
              <div className="bg-white px-[7px] py-[7px] rounded-[16px] flex items-center gap-[20px] font-semibold shadow-sm text-gray-900">
                <img src="badge.png" alt="Rank" className="w-5 h-5" /> 203
              </div>
            </div>
          </section>


          <section className="flex items-center bg-white rounded-2xl shadow-md p-[17px] w-[480px] h-[120px] mx-auto gap-[25px]">
            <img src="finance.png" alt="Course" className="w-[140px] h-[90px] object-cover rounded-xl flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-[12px]">
              <h3 className="text-xl font-semibold m-0">Budgeting and Saving</h3>
              <div className="h-2 bg-gray-200 rounded-md overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-[#4E00E3] to-[#d0bfff] rounded-md"></div>
              </div>
              <button className="bg-[#fbbf24] border-none px-4 py-[7px] rounded-xl font-semibold text-sm text-white cursor-pointer flex items-center gap-2 shadow-md transition-colors hover:bg-[#c09e2b]">
                Continue Learning <span className="text-xl ml-2">→</span>
              </button>
            </div>
          </section>
        </div>


        <section className="bg-white shadow-md p-5 rounded-2xl font-sans flex flex-col justify-between flex-1 w-[419px] h-[320px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="m-0 text-lg font-bold">Featured</h3>
            <span className="text-[15px] text-black cursor-pointer">View More →</span>
          </div>
          <div className="flex-grow flex flex-col justify-center p-3">
            <img src={article?.image_url || "asylum.png"} alt="Featured" className="w-full h-[180px] object-cover rounded-2xl" />

            <p className="mt-5 text-base font-semibold text-center leading-tight">{article?.title}</p>

          </div>
        </section>


        <section className="bg-white rounded-2xl p-[18px] shadow-md text-center flex flex-col justify-between flex-1 w-[419px] h-[320px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="m-0 text-lg font-bold">FinScore</h3>
            <div className="w-[22px] h-[22px] -mt-[2px] rounded-full bg-transparent border-[1.5px] border-black text-black font-bold text-sm flex items-center justify-center cursor-default">
              i
            </div>
          </div>
          <div className="w-[180px] h-[180px] rounded-full bg-[conic-gradient(from_0deg,_#4E00E3_0%_78%,_#e5e5f5_78%_100%)] mx-auto relative flex items-center justify-center
            before:content-[''] before:absolute before:w-[120px] before:h-[120px] before:bg-white before:rounded-full">
            <div className="relative text-3xl font-semibold text-black z-10">789</div>
          </div>
          <p className="text-[15px] text-gray-700 mt-4">
            Every expert was once a <b className="font-bold">beginner</b>.
            <br />
            Keep Going!
          </p>
        </section>
      </main>

      <div className="flex justify-between gap-6 px-8 pt-0 pb-8 items-start bg-gray-50">

        <div className="flex justify-between gap-5 px-8 pt-0 pb-8 items-start bg-gray-50">
          <div className="flex flex-col flex-1 bg-transparent -mt-0 relative min-h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">Recommended Courses</h2>
              <div className="flex gap-3">
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 0}
                  className={`w-10 h-10 rounded-full text-lg flex items-center justify-center ${currentPage === 0 ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-white text-amber-400 border border-amber-400'}`}
                >
                  ❮
                </button>
                <button
                  onClick={goToNext}
                  disabled={(currentPage + 1) * coursesPerPage >= courses.length}
                  className={`w-10 h-10 rounded-full text-lg flex items-center justify-center ${((currentPage + 1) * coursesPerPage >= courses.length) ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-amber-400 text-white'}`}
                >
                  ❯
                </button>
              </div>
            </div>

            <div className="flex gap-5">
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((course, index) => (
                  <div className="bg-white rounded-2xl p-4 w-[310px] shadow-md flex-shrink-0 max-h-[250px]" key={index}>
                    <img
                      src={course.thumbnail_url || "/course.png"}
                      alt={course.title}
                      className="w-full h-[100px] rounded-xl object-cover"
                    />
                    <div className="flex justify-between my-2.5 text-sm text-gray-600">
                      <span className="bg-purple-300 text-black rounded-lg px-2 py-0.5 text-xs">Basic</span>
                      <span>{course.modules_count} modules • {course.duration} mins</span>
                    </div>
                    <h3 className="text-base font-semibold truncate">{course.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No recommended courses yet.</p>
              )}
            </div>
            {/* <p className="text-sm text-gray-500 ml-2 mt-2">Page {currentPage + 1} of {totalPages}</p> */}

          </div>


          <div className="bg-white rounded-2xl p-[18px] shadow-md text-center flex flex-col justify-between flex-none w-[470px] h-[295px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0 text-lg font-bold">Tasks</h3>
              <div className="w-[22px] h-[22px] -mt-[2px] rounded-full bg-transparent border-[1.5px] border-black text-black font-bold text-sm flex items-center justify-center cursor-default">
                i
              </div>
            </div>
            <div className="flex-grow flex flex-col justify-around">
              <div className="flex items-center px-4 py-2 border border-gray-900 rounded-full mb-3 text-xl gap-3"><input type="checkbox" /> Add Today’s Expenses</div>
              <div className="flex items-center px-4 py-2 border border-gray-900 rounded-full mb-3 text-xl gap-3"><input type="checkbox" /> Complete Your Daily Goal</div>
              <div className="flex items-center px-4 py-2 border border-gray-900 rounded-full mb-3 text-xl gap-3"><input type="checkbox" /> Read Today’s Featured Article</div>
              <div className="flex items-center px-4 py-2 border border-gray-900 rounded-full mb-3 text-xl gap-3"><input type="checkbox" /> Add Today’s Expenses</div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-[#f7fafc] py-10 px-6 md:px-12 flex flex-wrap justify-between text-[#333] font-sans">

        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] flex flex-col items-center md:items-start">
          <img src="/logo.jpg" alt="FinEd Logo" className="h-[50px] mb-3" />
          <p className="text-base text-gray-700 mb-4 text-center md:text-left">Financial Education made Easy.</p>
          <div className="flex gap-4">
            <a href="https://linkedin.com"><img src="/linkedin.png" alt="LinkedIn" className="w-8 h-8 transition-transform duration-200 hover:scale-110 cursor-pointer" /></a>
            <a href="https://instagram.com"><img src="/insta.jpg" alt="Instagram" className="w-8 h-8 transition-transform duration-200 hover:scale-110 cursor-pointer" /></a>
          </div>
        </div>
        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] text-center md:text-left">
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">FEATURED</h4>
          <Link to="/courses" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Courses</Link>
          <Link to="/articles" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Articles</Link>
          <Link to="/tools" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">FinTools</Link>
          <Link to="/about" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">About Us</Link>
        </div>
        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] text-center md:text-left">
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">OTHER</h4>
          <Link to="/leaderboard" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Leaderboard</Link>
          <Link to="/rewards" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Rewards</Link>
          <Link to="/contact" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Contact Us</Link>
          <Link to="/feedback" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Feedback</Link>
        </div>
        <div className="newsletter">
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-4">NEWSLETTER</h4>
          <input type="email" placeholder="Enter your email address" className="p-3 w-full mb-3 border border-gray-200 rounded-md text-sm box-border" />
          <button className="p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border">
            Subscribe Now
          </button>
        </div>
      </footer>

      <div className="text-center py-4 text-sm text-gray-500 bg-[#f9fafb] border-t border-gray-200">© 2025 FinEd. All Rights Reserved.</div>
    </div>
  );
};

export default HomePage;