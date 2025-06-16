import React, { useState } from "react";
import axios from "../lib/axios.js";
import { Link } from "react-router-dom";

const ArticleForm = () => {
  const [form, setForm] = useState({ title: "", content: "" });
  const [imageFile, setImageFile] = useState(null);

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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        <Link to="/admin">← Back to Admin</Link>
      </h2>
      <h1 className="text-2xl font-semibold mb-2">Add New Article</h1>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Content</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows="6"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Post Article
        </button>
      </form>
    </div>
  );
};

export default ArticleForm;
