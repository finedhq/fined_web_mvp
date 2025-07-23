import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios.js";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const CourseForm = () => {

  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: "",
    description: "",
    modules_count: "",
    duration: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);

  const { user, isLoading, isAuthenticated, logout } = useAuth0()
  const [role, setrole] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/")
    } else if (!isLoading && isAuthenticated) {
      const roles = user?.["https://fined.com/roles"]
      setrole(roles?.[0] || "")
      if (roles?.[0] !== "Admin") navigate("/")
    }
  }, [isLoading, isAuthenticated])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (thumbnailFile) {
        formData.append("thumbnail_file", thumbnailFile);
      }

      const res = await axios.post("/courses/add", formData);
      console.log("Course added:", res.data);

      setForm({
        title: "",
        description: "",
        modules_count: "",
        duration: "",
      });
      setThumbnailFile(null);

      alert("✅ Course successfully added!");
    } catch (error) {
      console.error("❌ Error adding course:", error.response?.data || error.message);
      alert("Failed to add course.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-indigo-700">Add New Course</h2>
          <Link
            to="/admin"
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <p className="text-sm text-gray-600 mb-5">
          Fill in the form below to add a new course to your platform.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g., Financial Planning Basics"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="modules_count" className="block text-sm font-medium text-gray-700 mb-1">
                Modules Count
              </label>
              <input
                type="number"
                id="modules_count"
                name="modules_count"
                min="1"
                placeholder="e.g., 5"
                value={form.modules_count}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                min="1"
                placeholder="e.g., 90"
                value={form.duration}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="thumbnail_file" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Thumbnail
            </label>
            <input
              type="file"
              id="thumbnail_file"
              name="thumbnail_file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 file:mr-3 file:py-2 file:px-4 file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Course Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Briefly explain what this course is about..."
              value={form.description}
              onChange={handleChange}
              rows="4"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 resize-y focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold transition"
          >
            📤 Post Course
          </button>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;
