import React, { useState } from 'react';
import axios from '../lib/axios.js'
import { useParams, Link } from 'react-router-dom';


const CardForm = () => {
  const { moduleId } = useParams();
  const [cardType, setCardType] = useState('text');
  const [form, setForm] = useState({
    content_text: '',
    video_url: '',
    audio_url: '',
    question_type: '',
    options: '',
    correct_answer: '',
    allotted_finstars: 0,
    order_index: 0,
    answer_compulsory: false,
    feedback_type: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCardTypeChange = (e) => {
    const selectedType = e.target.value;
    setCardType(selectedType);
    setForm({
      content_text: '',
      video_url: '',
      audio_url: '',
      question_type: '',
      options: '',
      correct_answer: '',
      allotted_finstars: 0,
      order_index: 0,
      answer_compulsory: false,
      feedback_type: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      content_type: cardType,  // ✅ MUST match backend naming
      ...form,
      options:
        form.question_type === 'mcq_single' || form.question_type === 'mcq_multiple'
          ? form.options.split(',').map((opt) => opt.trim())
          : undefined,
    };


    try {
      const res = await axios.post(`/cards/add/${moduleId}`, payload);
      console.log("Success:", res.data);
      alert("Card added!")
    } catch (err) {
      console.error("Error posting card:", err);
      alert("Error in card addition")
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6">
        <span><h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          <Link to={'/admin'}>Home</Link>
        </h2></span>
        <h1 className="text-lg font-semibold text-center mb-3 text-gray-800">
          Add a New Card
        </h1>
        <p className="text-center text-gray-500 mb-5">
          Create a new card to enhance your module.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cardType" className="block text-sm font-medium text-gray-700 mb-1">
              Card Type
            </label>
            <select
              id="cardType"
              name="cardType"
              value={cardType}
              onChange={handleCardTypeChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="text">Text</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="question">Question</option>
            </select>
          </div>

          <div>
            <label htmlFor="allotted_finstars" className="block text-sm font-medium text-gray-700 mb-1">
              Allotted Finstars
            </label>
            <input
              id="allotted_finstars"
              type="number"
              name="allotted_finstars"
              placeholder="e.g., 10"
              value={form.allotted_finstars}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
            />
          </div>

          <div>
            <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-1">
              Order Index
            </label>
            <input
              id="order_index"
              type="number"
              name="order_index"
              placeholder="e.g., 1"
              value={form.order_index}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
            />
          </div>

          {cardType === 'text' && (
            <div>
              <label htmlFor="content_text" className="block text-sm font-medium text-gray-700 mb-1">
                Text Content
              </label>
              <textarea
                id="content_text"
                name="content_text"
                placeholder="Enter text content..."
                value={form.content_text}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                rows="4"
                required
              />
            </div>
          )}

          {cardType === 'video' && (
            <div>
              <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
                Video URL
              </label>
              <input
                id="video_url"
                type="url"
                name="video_url"
                placeholder="https://example.com/video.mp4"
                value={form.video_url}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {cardType === 'audio' && (
            <div>
              <label htmlFor="audio_url" className="block text-sm font-medium text-gray-700 mb-1">
                Audio URL
              </label>
              <input
                id="audio_url"
                type="url"
                name="audio_url"
                placeholder="https://example.com/audio.mp3"
                value={form.audio_url}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {cardType === 'question' && (
            <>
              <div>
                <label htmlFor="content_text" className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text
                </label>
                <textarea
                  id="content_text"
                  name="content_text"
                  placeholder="Enter the question text..."
                  value={form.content_text}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label htmlFor="question_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>
                <select
                  id="question_type"
                  name="question_type"
                  value={form.question_type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select question type</option>
                  <option value="mcq_single">MCQ (Single Answer)</option>
                  <option value="mcq_multiple">MCQ (Multiple Answers)</option>
                  <option value="subjective">Subjective</option>
                </select>
              </div>

              {(form.question_type === 'mcq_single' || form.question_type === 'mcq_multiple') && (
                <>
                  <div>
                    <label htmlFor="options" className="block text-sm font-medium text-gray-700 mb-1">
                      Options (comma separated)
                    </label>
                    <textarea
                      id="options"
                      name="options"
                      placeholder="Option1, Option2, Option3"
                      value={form.options}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                      rows="3"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="correct_answer" className="block text-sm font-medium text-gray-700 mb-1">
                      Correct Answer
                    </label>
                    <input
                      id="correct_answer"
                      type="text"
                      name="correct_answer"
                      placeholder="Enter correct answer"
                      value={form.correct_answer}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="feedback_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback Type (optional)
                </label>
                <input
                  id="feedback_type"
                  type="text"
                  name="feedback_type"
                  placeholder="e.g., text, paragraph"
                  value={form.feedback_type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  id="answer_compulsory"
                  type="checkbox"
                  name="answer_compulsory"
                  checked={form.answer_compulsory}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Answer Compulsory</span>
              </label>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition duration-200"
          >
            Post Card
          </button>
        </form>
      </div>
    </div>
  );
};

export default CardForm;