import React, { useState } from 'react';
import axios from '../lib/axios.js';
import { useParams, Link } from 'react-router-dom';

const CardForm = () => {
  const { moduleId } = useParams();
  const [cardType, setCardType] = useState('text');
  const [form, setForm] = useState({
    title: '',
    content_text: '',
    question_type: '',
    options: '',
    options_tags: '',
    correct_answer: '',
    allotted_finstars: 0,
    order_index: 0,
    answer_compulsory: false,
    feedback_type: '',
    image_file: null,
    audio_file: null,
    video_file: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, [`${type}_file`]: file }));
    }
  };

  const handleCardTypeChange = (e) => {
    const selectedType = e.target.value;
    setCardType(selectedType);
    setForm({
      title: '',
      content_text: '',
      question_type: '',
      options: '',
      options_tags: '',
      correct_answer: '',
      allotted_finstars: 0,
      order_index: 0,
      answer_compulsory: false,
      feedback_type: '',
      image_file: null,
      audio_file: null,
      video_file: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append('title', form.title);
    data.append('content_type', cardType);
    data.append('content_text', form.content_text);
    data.append('question_type', form.question_type);
    data.append('correct_answer', form.correct_answer);
    data.append('allotted_finstars', form.allotted_finstars);
    data.append('order_index', form.order_index);
    data.append('answer_compulsory', form.answer_compulsory);
    data.append('feedback_type', form.feedback_type);

    if (
      form.options &&
      (form.question_type === 'mcq_single' || form.question_type === 'mcq_multiple')
    ) {
      form.options.split(',').forEach((opt, index) => {
        data.append(`options[${index}]`, opt.trim());
      });
    }

    if (
      form.options_tags &&
      (form.question_type === 'mcq_single' || form.question_type === 'mcq_multiple')
    ) {
      form.options_tags.split(',').forEach((tag, index) => {
        data.append(`options_tags[${index}]`, tag.trim());
      });
    }

    if (form.image_file) data.append('image_file', form.image_file);
    if (form.audio_file) data.append('audio_file', form.audio_file);
    if (form.video_file) data.append('video_file', form.video_file);

    try {
      const res = await axios.post(`/cards/add/${moduleId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('✅ Card added successfully!');
      console.log(res.data);

      // Reset form
      setForm({
        title: '',
        content_text: '',
        question_type: '',
        options: '',
        options_tags: '',
        correct_answer: '',
        allotted_finstars: 0,
        order_index: 0,
        answer_compulsory: false,
        feedback_type: '',
        image_file: null,
        audio_file: null,
        video_file: null,
      });
      setCardType('text');
    } catch (err) {
      alert('❌ Error adding card.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-1">
          <Link to="/admin" className="text-blue-600 hover:underline">← Admin</Link> / Add New Card
        </h2>
        <p className="text-gray-500 text-sm mb-5">Module ID: {moduleId}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">
              Title
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full mt-1 border rounded px-3 py-2"
                required
              />
            </label>
          </div>
          <div>
            <label className="block font-medium mb-1">Card Type</label>
            <select
              name="cardType"
              value={cardType}
              onChange={handleCardTypeChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="text">Text</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="question">Question</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              Allotted Finstars
              <input
                type="number"
                name="allotted_finstars"
                value={form.allotted_finstars}
                onChange={handleChange}
                className="w-full mt-1 border rounded px-3 py-2"
                required
              />
            </label>

            <label className="block">
              Order Index
              <input
                type="number"
                name="order_index"
                value={form.order_index}
                onChange={handleChange}
                className="w-full mt-1 border rounded px-3 py-2"
                required
              />
            </label>
          </div>

          {(cardType === 'text' || cardType === 'question' || cardType === 'audio' || cardType === 'video' || cardType === 'image') && (
            <label className="block">
              Content Text
              <textarea
                name="content_text"
                value={form.content_text}
                onChange={handleChange}
                rows="3"
                className="w-full mt-1 border rounded px-3 py-2"
              />
            </label>
          )}

          {/* File Upload Section */}
          {(cardType === 'image' || cardType === 'audio' || cardType === 'video') && (
            <label className="block">
              Upload {cardType.charAt(0).toUpperCase() + cardType.slice(1)}
              <input
                type="file"
                accept={`${cardType}/*`}
                onChange={(e) => handleFileChange(e, cardType)}
                className="w-full mt-1"
                required
              />
            </label>
          )}

          {/* Question Section */}
          {cardType === 'question' && (
            <div className="space-y-4">
              <label className="block">
                Question Type
                <select
                  name="question_type"
                  value={form.question_type}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded px-3 py-2"
                  required
                >
                  <option value="">Select type</option>
                  <option value="mcq_single">MCQ - Single Answer</option>
                  <option value="mcq_multiple">MCQ - Multiple Answers</option>
                  <option value="subjective">Subjective</option>
                </select>
              </label>

              {(form.question_type === 'mcq_single' || form.question_type === 'mcq_multiple') && (
                <>
                  <label className="block">
                    Options (comma-separated)
                    <textarea
                      name="options"
                      value={form.options}
                      onChange={handleChange}
                      className="w-full mt-1 border rounded px-3 py-2"
                    />
                  </label>
                  <label className="block">
                    Option Tags (comma-separated)
                    <textarea
                      name="options_tags"
                      value={form.options_tags || ''}
                      onChange={handleChange}
                      className="w-full mt-1 border rounded px-3 py-2"
                    />
                  </label>
                  <label className="block">
                    Correct Answer
                    <input
                      type="text"
                      name="correct_answer"
                      value={form.correct_answer}
                      onChange={handleChange}
                      className="w-full mt-1 border rounded px-3 py-2"
                    />
                  </label>
                </>
              )}

              <label className="block">
                Feedback Type (optional)
                <input
                  type="text"
                  name="feedback_type"
                  value={form.feedback_type}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded px-3 py-2"
                />
              </label>

              <label className="inline-flex items-center mt-2">
                <input
                  type="checkbox"
                  name="answer_compulsory"
                  checked={form.answer_compulsory}
                  onChange={handleChange}
                  className="mr-2"
                />
                Answer Compulsory
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Submit Card
          </button>
        </form>
      </div>
    </div>
  );
};

export default CardForm;
