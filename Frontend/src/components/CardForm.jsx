import React, { useState } from 'react';
import axios from '../lib/axios.js';
import { useParams, Link } from 'react-router-dom';

const CardForm = () => {
  const { moduleId } = useParams();
  const [cardType, setCardType] = useState('text');
  const [form, setForm] = useState({
    content_text: '',
    question_type: '',
    options: '',
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
      content_text: '',
      question_type: '',
      options: '',
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

    data.append('content_type', cardType);
    data.append('content_text', form.content_text);
    data.append('question_type', form.question_type);
    data.append('correct_answer', form.correct_answer);
    data.append('allotted_finstars', form.allotted_finstars);
    data.append('order_index', form.order_index);
    data.append('answer_compulsory', form.answer_compulsory);
    data.append('feedback_type', form.feedback_type);

    if (form.options && (form.question_type === 'mcq_single' || form.question_type === 'mcq_multiple')) {
      form.options.split(',').forEach((opt, index) => {
        data.append(`options[${index}]`, opt.trim());
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
      alert('Card added successfully!');
      console.log(res.data);
    } catch (err) {
      alert('Error adding card.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          <Link to="/admin">Home</Link> / Add Card
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            Card Type
            <select name="cardType" value={cardType} onChange={handleCardTypeChange} className="w-full mt-1 border rounded p-2">
              <option value="text">Text</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="question">Question</option>
            </select>
          </label>

          <label className="block">
            Allotted Finstars
            <input
              type="number"
              name="allotted_finstars"
              value={form.allotted_finstars}
              onChange={handleChange}
              className="w-full mt-1 border rounded p-2"
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
              className="w-full mt-1 border rounded p-2"
              required
            />
          </label>

          {(cardType === 'text' || cardType === 'question' || cardType === 'audio' || cardType === 'video' || cardType === 'image') && (
            <label className="block">
              Content Text
              <textarea
                name="content_text"
                value={form.content_text}
                onChange={handleChange}
                className="w-full mt-1 border rounded p-2"
              />
            </label>
          )}

          {cardType === 'image' && (
            <label className="block">
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'image')}
                className="w-full mt-1"
                required
              />
            </label>
          )}

          {cardType === 'audio' && (
            <label className="block">
              Upload Audio
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, 'audio')}
                className="w-full mt-1"
                required
              />
            </label>
          )}

          {cardType === 'video' && (
            <label className="block">
              Upload Video
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'video')}
                className="w-full mt-1"
                required
              />
            </label>
          )}

          {cardType === 'question' && (
            <>
              <label className="block">
                Question Type
                <select name="question_type" value={form.question_type} onChange={handleChange} className="w-full mt-1 border rounded p-2">
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
                      className="w-full mt-1 border rounded p-2"
                    />
                  </label>
                  <label className="block">
                    Correct Answer
                    <input
                      type="text"
                      name="correct_answer"
                      value={form.correct_answer}
                      onChange={handleChange}
                      className="w-full mt-1 border rounded p-2"
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
                  className="w-full mt-1 border rounded p-2"
                />
              </label>

              <label className="inline-flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  name="answer_compulsory"
                  checked={form.answer_compulsory}
                  onChange={handleChange}
                />
                <span className="text-sm">Answer Compulsory</span>
              </label>
            </>
          )}

          <button type="submit" className="w-full bg-blue-600 text-white rounded p-2 mt-4 hover:bg-blue-700 transition">
            Add Card
          </button>
        </form>
      </div>
    </div>
  );
};

export default CardForm;
