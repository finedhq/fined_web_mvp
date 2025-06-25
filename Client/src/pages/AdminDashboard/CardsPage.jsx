import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '/src/lib/axios.js';
import Loader from "../../components/Loader";

const CardsPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await axios.get(`/cards/${moduleId}/getall`);
        setCards(res.data);
      } catch (err) {
        console.error('❌ Error fetching cards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [moduleId]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700">Cards</h1>
            <p className="text-sm text-gray-600">Module ID: <span className="font-medium">{moduleId}</span></p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin"
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition"
            >
              ← Admin Home
            </Link>
            <button
              onClick={() => navigate(`/admin/modules/${moduleId}/cards/add`)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              + Add New Card
            </button>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : cards.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-lg text-gray-500">No cards found for this module.</p>
            <button
              onClick={() => navigate(`/admin/modules/${moduleId}/cards/add`)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Add First Card
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {cards.map((card) => (
              <div key={card.card_id} className="bg-white rounded-lg shadow-md p-5 space-y-3 border border-gray-200">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold text-indigo-800 capitalize">
                    Type: {card.content_type}
                  </h2>
                  <p className="text-xs text-gray-500">Finstars: {card.allotted_finstars || 0}</p>
                </div>

                {card.content_text && (
                  <p className="text-gray-700">{card.content_text}</p>
                )}

                {card.image_url && (
                  <img
                    src={card.image_url}
                    alt="Card Visual"
                    className="w-full max-w-md rounded"
                  />
                )}

                {card.video_url && (
                  <video controls className="w-full max-w-md rounded">
                    <source src={card.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}

                {card.audio_url && (
                  <audio controls className="w-full mt-2">
                    <source src={card.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio tag.
                  </audio>
                )}

                {card.content_type === 'question' && (
                  <div className="space-y-2 mt-3">
                    <p className="font-medium text-gray-700">Question Type: {card.question_type}</p>

                    {(card.question_type === 'mcq_single' || card.question_type === 'mcq_multiple') && card.options?.length > 0 && (
                      <div className="space-y-1">
                        {card.options.map((option, idx) => (
                          <label key={idx} className="block text-gray-600">
                            <input
                              type={card.question_type === 'mcq_single' ? 'radio' : 'checkbox'}
                              name={`question_${card.card_id}`}
                              value={option}
                              className="mr-2"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}

                    {card.question_type === 'subjective' && (
                      <textarea
                        placeholder="Type your answer..."
                        className="w-full p-2 border rounded"
                        rows={3}
                      />
                    )}

                    {card.feedback_type && (
                      <p className="text-sm text-gray-500">Feedback Type: {card.feedback_type}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default CardsPage;
