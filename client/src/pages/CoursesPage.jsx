import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const mockCourses = [
  {
    id: 1,
    title: "BM Data Science Professional Certificate",
    duration: "6 Modules • 25 mins",
    description:
      "Product Management Masterclass, you will learn with Sarah Johnson - Head of Product Customer Platform, Gojek Indonesia.",
    students: 11,
    thumbnail: "https://via.placeholder.com/300x180?text=Course+1",
  },
  {
    id: 2,
    title: "The Science of Well-Being",
    duration: "1 - 28 July 2025",
    description:
      "You will learn with Sarah Johnson - Head of Product Customer Platform, Gojek Indonesia.",
    students: 234,
    thumbnail: "https://via.placeholder.com/300x180?text=Course+2",
  },
  {
    id: 3,
    title: "Python for Everybody Specialization",
    duration: "1 - 28 July 2025",
    description:
      "You will learn with Sarah Johnson - Head of Product Customer Platform, Gojek Indonesia.",
    students: 342,
    thumbnail: "https://via.placeholder.com/300x180?text=Course+3",
  },
];

export default function CoursesPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 bg-white shadow-sm">
        <div className="flex items-center gap-2 text-xl font-bold text-indigo-700">
        <img src="../../public/logo.jpg" alt="logo" className="w-14 h-14"/>
        </div>
        <div className="flex gap-3">
          {[
            { path: "/home", label: "Home" },
            { path: "/courses", label: "Courses" },
            { path: "/articles", label: "Articles" },
            { path: "/fin-tools", label: "FinTools" },
          ].map(({ path, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`px-5 py-2 rounded-full font-medium text-base transition ${
                location.pathname === path
                  ? "bg-amber-400 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow px-6 md:px-16 py-10">
        {/* Continue Learning */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
          
        </section>

        {/* Featured Courses */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
                <p className="text-xs text-gray-500 mb-1">{course.duration}</p>
                <h3 className="font-semibold text-blue-800 text-sm mb-1">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-600 mb-4">{course.description}</p>
                <button className="bg-amber-400 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-amber-500">
                  Start Now
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended & Trending Courses */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-xl font-semibold mb-4">Recommended Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Trending Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t px-6 md:px-16 py-10 text-sm text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-xl font-bold text-indigo-700 mb-2">
              🎓 <span className="text-orange-400">Fin</span>Ed
            </div>
            <p className="mb-4">Financial Education made Easy.</p>
            <div className="flex gap-3">
              <a href="#"><img src="https://cdn-icons-png.flaticon.com/24/174/174857.png" alt="LinkedIn" /></a>
              <a href="#"><img src="https://cdn-icons-png.flaticon.com/24/2111/2111463.png" alt="Instagram" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Featured</h4>
            <ul className="space-y-1">
              <li>Courses</li>
              <li>Articles</li>
              <li>FinTools</li>
              <li>About Us</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Other</h4>
            <ul className="space-y-1">
              <li>Leaderboard</li>
              <li>Rewards</li>
              <li>Contact Us</li>
              <li>Feedback</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Newsletter</h4>
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full px-3 py-2 border rounded mb-2"
            />
            <button className="w-full bg-amber-400 hover:bg-amber-500 text-white px-3 py-2 rounded">
              Subscribe Now
            </button>
          </div>
        </div>
        <p className="text-center mt-10 text-xs">
          © Copyright 2025, All Rights Reserved by FinEd.
        </p>
      </footer>
    </div>
  );
}

// Small reusable course card
function CourseCard({ course }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
      <img
        src={course.thumbnail}
        alt={course.title}
        className="w-full h-28 object-cover rounded-md mb-2"
      />
      <p className="text-xs text-gray-500 mb-1">{course.duration}</p>
      <h3 className="font-semibold text-blue-800 text-sm mb-1">
        {course.title}
      </h3>
      <p className="text-xs text-gray-600 mb-2">{course.description}</p>
    </div>
  );
}
