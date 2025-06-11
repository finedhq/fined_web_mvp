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
        console.log(res.data);
      } catch (err) {
        console.error('Error fetching cards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [moduleId]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Cards for Module</h2>
        <span>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            <Link to={'/admin'}>Home</Link>
          </h2>
        </span>
        <button
          onClick={() => navigate(`/admin/modules/${moduleId}/cards/add`)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add New Card
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : cards.length === 0 ? (
        <p className="text-center text-gray-500 mt-12 text-lg font-medium">
          No cards found.
        </p>
      ) : (
        <div className="grid gap-4">
          {cards.map((card) => (
            <div key={card.card_id} className="border p-4 rounded shadow space-y-3">
              <h3 className="font-semibold capitalize">Type: {card.content_type}</h3>

              {card.content_text && (
                <p className="text-gray-800">{card.content_text}</p>
              )}

              {card.image_url && (
                <div>
                  <img
                    src={card.image_url}
                    alt="Card visual"
                    className="w-full max-w-md rounded"
                  />
                </div>
              )}

              {card.video_url && (
                <video controls className="w-full max-w-md">
                  <source src={card.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              {card.audio_url && (
                <audio controls className="w-full">
                  <source src={card.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio tag.
                </audio>
              )}

              {/* Question rendering logic */}
              {card.content_type === 'question' && (
                <div className="space-y-2">
                  <p className="font-medium">Question Type: {card.question_type}</p>

                  {card.question_type === 'mcq_single' && card.options?.length > 0 && (
                    <div className="space-y-1">
                      {card.options.map((option, idx) => (
                        <label key={idx} className="block">
                          <input type="radio" name={`mcq_${card.card_id}`} value={option} className="mr-2" />
                          {option}
                        </label>
                      ))}
                    </div>
                  )}

                  {card.question_type === 'mcq_multiple' && card.options?.length > 0 && (
                    <div className="space-y-1">
                      {card.options.map((option, idx) => (
                        <label key={idx} className="block">
                          <input type="checkbox" value={option} className="mr-2" />
                          {option}
                        </label>
                      ))}
                    </div>
                  )}

                  {card.question_type === 'subjective' && (
                    <textarea
                      placeholder="Type your answer here..."
                      className="w-full p-2 border rounded"
                      rows={3}
                    />
                  )}

                  {card.feedback_type && (
                    <p className="text-sm text-gray-500">Feedback Type: {card.feedback_type}</p>
                  )}
                </div>
              )}

              <p className="text-sm text-gray-600">
                Finstars: {card.allotted_finstars || 0}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardsPage;
