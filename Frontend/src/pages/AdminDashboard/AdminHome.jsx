import React from "react";
import { useNavigate } from "react-router-dom";

const AdminHome = () => {
  const navigate = useNavigate();

  const cards = [
    {
      label: "Add New Course",
      onClick: () => navigate("/admin/courses/add"),
    },
    {
      label:"Add New Articles",
      onClick:()=> navigate("/admin/articles/add"),
    },
    {
      label: "View All Courses",
      onClick: () => navigate("/admin/courses"),
    },
    {
      label:"View All Articles",
      onClick: () => navigate("/admin/articles"),
    },
    {
      label: "Settings (Coming Soon)",
      disabled: true,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex flex-col items-center justify-center px-6 py-10">
      <div className="max-w-5xl w-full bg-white shadow-xl rounded-2xl p-10">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Admin Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Welcome, Admin! Use the shortcuts below to manage your course content.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <button
              key={index}
              onClick={card.onClick}
              disabled={card.disabled}
              className={`p-6 rounded-xl shadow-md text-white font-semibold text-lg transition ${
                card.disabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {card.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdminHome;
