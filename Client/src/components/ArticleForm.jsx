import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios.js";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const ArticleForm = () => {

  const navigate = useNavigate()

  const [form, setForm] = useState({ title: "", content: "" });
  const [imageFile, setImageFile] = useState(null);

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("content", form.content);
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await axios.post("/articles/add", formData);
      alert("✅ Article posted!");
      setForm({ title: "", content: "" });
      setImageFile(null);
    } catch (err) {
      console.error("❌ Error:", err.response?.data || err.message);
      alert("Failed to post article.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-indigo-700">Add New Article</h2>
          <Link
            to="/admin"
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g., Basics of Cryptocurrency"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Content</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Write your article here..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 resize-y focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 file:mr-3 file:py-2 file:px-4 file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold transition"
          >
            📝 Post Article
          </button>
        </form>
      </div>
    </div>
  );
};

export default ArticleForm;
