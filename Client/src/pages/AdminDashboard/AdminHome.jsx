import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const AdminHome = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuth0();
  const [role, setrole] = useState("")
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const roles = user?.["https://fined.com/roles"];
      setrole(roles[0])
      console.log(roles[0]);
      if (roles[0] !== 'Admin') navigate('/');
    } else if (!isLoading && !isAuthenticated) navigate('/')

  }, [user, isAuthenticated, isLoading])


  const cards = [
    {
      label: "Add New Course",
      icon: "📚",
      onClick: () => navigate("/admin/courses/add"),
    },
    {
      label: "Add New Article",
      icon: "📝",
      onClick: () => navigate("/admin/articles/add"),
    },
    {
      label: "View All Courses",
      icon: "📖",
      onClick: () => navigate("/admin/courses"),
    },
    {
      label: "View All Articles",
      icon: "📰",
      onClick: () => navigate("/admin/articles"),
    },
    {
      label: "Send Newsletter",
      icon: "📝",
      onClick: () => navigate("/admin/newsletters"),
    },
    {
      label: "Settings (Coming Soon)",
      icon: "⚙️",
      disabled: true,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex flex-col items-center px-4 py-6">
      {/* Top Navigation */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="FinEd Logo" className="h-12 w-auto rounded-md" />
          <h2 className="text-2xl font-bold text-indigo-700">FinEd Admin Panel</h2>
        </div>
        <button
          onClick={() => navigate("/home")}
          className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold border border-indigo-600 hover:bg-indigo-100 transition"
        >
          ← Back to Main Site
        </button>
      </div>

      {/* Admin Dashboard Card */}
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-indigo-700 text-center mb-2">
          Welcome, Admin!
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {user?.name ? `Hello ${user.name},` : "You"} can manage content, add new materials, and track progress here.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <button
              key={index}
              onClick={card.onClick}
              disabled={card.disabled}
              className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-md text-white font-semibold text-lg text-center transition ${card.disabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
              <span className="text-4xl mb-3">{card.icon}</span>
              {card.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdminHome;