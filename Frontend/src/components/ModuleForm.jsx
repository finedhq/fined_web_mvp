import React, { useState } from 'react';

const ModuleForm = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    order_index: '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', form);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6">
        <h1 className="text-lg font-semibold text-center mb-3 text-gray-800">
          Add a New Module
        </h1>
        <p className="text-center text-gray-500 mb-5">
          Create a new module to organize your course.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Module Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g., Introduction to Finance"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Write a brief module overview..."
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          <div>
            <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-1">
              Order Index (optional)
            </label>
            <input
              type="number"
              id="order_index"
              name="order_index"
              placeholder="e.g., 1"
              value={form.order_index}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition duration-200"
          >
            Post Module
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModuleForm;