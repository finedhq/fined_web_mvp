import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '/src/lib/axios.js';
import Loader from "../../components/Loader";


const ModulesPage = () => {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchModules = async () => {
    try {
      const res = await axios.get(`/modules/course/${courseId}`);
      setModules(res.data);
    } catch (err) {
      console.error('Error fetching modules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Modules</h2>
          <span>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              <Link to={'/admin'}>Home</Link>
            </h2>
          </span>
          <button
            onClick={() => navigate(`/admin/courses/${courseId}/modules/add`)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
          >
            Add Module
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : modules.length === 0 ? (
          <p className="text-center text-gray-500 mt-12 text-lg font-medium">
            No modules found for this course.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="bg-white shadow-md rounded-lg p-5 border hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold mb-2">{mod.title}</h3>
                <p className="text-gray-600">{mod.description || 'No description'}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Order: {mod.order_index ?? 'N/A'}
                </p>
                <button
                  onClick={() => navigate(`/admin/modules/${mod.id}/cards`)}
                  className="text-indigo-600 hover:underline text-sm mt-2"
                >
                  View Cards →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ModulesPage;
