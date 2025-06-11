import React, { useState } from "react";
import axios from '../lib/axios.js'
import { Link } from "react-router-dom";

const CourseForm = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    modules_count: "",
    duration: "",
    thumbnail_url: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/courses/add", form);
      console.log("Course added:", res.data);
      setForm({
        title: "",
        description: "",
        modules_count: "",
        duration: "",
        thumbnail_url: "",
      });

      // Optional: alert or toast
      alert("✅ Course successfully added!");
    } catch (error) {
      console.error("❌ Error adding course:", error.response?.data || error.message);
      alert("Failed to add course.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6">
        <span><h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          <Link to={'/admin'}>Home</Link>
        </h2></span>
        <h1 className="text-lg font-semibold text-center mb-3 text-gray-800">
          Add a New Course
        </h1>
        <p className="text-center text-gray-500 mb-5">
          Create a course to engage learners.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g., Personal Finance Management"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="modules_count" className="block text-sm font-medium text-gray-700 mb-1">
              Modules Count
            </label>
            <input
              type="number"
              id="modules_count"
              name="modules_count"
              min="1"
              placeholder="e.g., 4"
              value={form.modules_count}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              placeholder="e.g., 120"
              value={form.duration}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail URL
            </label>
            <input
              type="text"
              id="thumbnail_url"
              name="thumbnail_url"
              placeholder="https://example.com/image.jpg"
              value={form.thumbnail_url}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Course Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Write a brief course overview..."
              value={form.description}
              onChange={handleChange}
              rows="3"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition duration-200"
          >
            Post Course
          </button>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;