import React, { useEffect, useState } from "react";
import instance from "../../lib/axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import ArticlePage from "./ArticlePage";
import { useAuth0 } from "@auth0/auth0-react";

const ArticlesList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(10); // Matches backend default limit
  const [totalArticles, setTotalArticles] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

    const { user, isLoading, isAuthenticated, logout } = useAuth0()
  const [role, setrole] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/")
    } else if (!isLoading && isAuthenticated) {
      const roles = user?.["https://fined.com/roles"]
      setrole(roles?.[0] || "")
      if (roles?.[0] !== "Admin") navigate("/")
    }
  }, [isLoading, isAuthenticated])

  const selectedId = searchParams.get("article");
  const selectedArticle = articles.find(
    (article) => article.id.toString() === selectedId
  );

  const openModal = (id) => {
    setSearchParams({ article: id });
  };

  const closeModal = () => {
    setSearchParams({});
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * articlesPerPage;
        const res = await instance.post("/articles/getall", {
          limit: articlesPerPage,
          offset,
        });
        const fetchedArticles = Array.isArray(res.data)
          ? res.data
          : res.data.articles || [];
        const fetchedTotal = Array.isArray(res.data)
          ? res.data.length
          : res.data.total || 0;
        setArticles(fetchedArticles);
        setTotalArticles(fetchedTotal);
      } catch (err) {
        console.error("Error fetching articles:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [currentPage, articlesPerPage]);

  const totalPages = Math.ceil(totalArticles / articlesPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDeleteArticle = async (id) => {
    const res = await instance.delete(`/articles/${id}`)
    if (res) {
      setArticles(prev => prev.filter(article => article.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">All Articles</h2>
        <button
          onClick={() => navigate("/admin")}
          className="text-blue-600 underline hover:text-blue-800 text-sm"
        >
          ← Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-opacity-50"></div>
        </div>
      ) : articles.length === 0 ? (
        <p className="text-gray-600">No articles found.</p>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="border p-4 rounded shadow-md space-y-3 cursor-pointer"
              onClick={() => openModal(article.id)}
            >
              <div className="flex justify-between" >
                <h3 className="text-xl font-semibold text-indigo-700">
                  {article.title}
                </h3>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.id) }} >Delete article</button>
              </div>

              <h3 className="text-xl font-semibold text-indigo-700">
                Rating: {article.rating || 0}
              </h3>

              {article.image_url && (
                <img
                  src={article.image_url}
                  alt="Thumbnail"
                  className="w-full max-w-sm rounded"
                />
              )}

              <p className="text-gray-700 line-clamp-3">
                {article.content_text}
              </p>

              <span className="text-blue-600 underline font-medium">
                View Full Article →
              </span>
            </div>
          ))}
        </div>
      )}

      {totalArticles > articlesPerPage && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded text-white font-medium transition-colors duration-200 ${currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded text-white font-medium transition-colors duration-200 ${currentPage === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            Next
          </button>
        </div>
      )}

      {selectedArticle && (
        <ArticlePage article={selectedArticle} onClose={closeModal} />
      )}
    </div>
  );
};

export default ArticlesList;