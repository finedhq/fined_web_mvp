import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '/src/lib/axios.js';
// import Loader from '/src/components/Loader.jsx';
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
            <div key={card.card_id} className="border p-4 rounded shadow">
              <h3 className="font-semibold">Type: {card.content_type}</h3>
              {card.content_text && <p>{card.content_text}</p>}
              {card.video_url && <p>🎥 Video: {card.video_url}</p>}
              {card.audio_url && <p>🔊 Audio: {card.audio_url}</p>}
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
