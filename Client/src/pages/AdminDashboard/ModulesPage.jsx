import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '/src/lib/axios.js';
import Loader from "../../components/Loader";

const ModulesPage = () => {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get(`/modules/course/${courseId}`);
        setModules(res.data);
      } catch (err) {
        console.error('❌ Error fetching modules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [courseId]);

  const handleDeleteModule = async (id) => {
    const res = await axios.delete(`/modules/${id}`)
    if (res) {
      setModules(prev => prev.filter(module => module.id !== id));
    }
  };

  return (
    <main className="min-h-screen px-6 py-10 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700 mb-1">Modules</h1>
            <p className="text-gray-500">Course ID: <span className="font-semibold text-gray-700">{courseId}</span></p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin"
              className="text-sm px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition"
            >
              ← Back to Admin
            </Link>
            <button
              onClick={() => navigate(`/admin/courses/${courseId}/modules/add`)}
              className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              + Add Module
            </button>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : modules.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-lg text-gray-500">No modules found for this course.</p>
            <button
              onClick={() => navigate(`/admin/courses/${courseId}/modules/add`)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Create Your First Module
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="bg-white shadow-md border border-gray-200 rounded-lg p-5 hover:shadow-lg transition"
              >
                <div className='flex justify-between' >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {mod.title}
                  </h3>
                  <button onClick={() => handleDeleteModule(mod.id)} >Delete Module</button>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  {mod.description || <span className="italic text-gray-400">No description provided.</span>}
                </p>
                <button
                  onClick={() => navigate(`/admin/modules/${mod.id}/cards`)}
                  className="text-indigo-600 hover:underline text-sm mt-3 inline-block"
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
