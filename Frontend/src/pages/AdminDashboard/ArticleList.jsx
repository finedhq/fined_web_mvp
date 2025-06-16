import React, { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { useSearchParams } from "react-router-dom";
import ArticlePage from "./ArticlePage";

const ArticlesList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true); // loading state added
  const [searchParams, setSearchParams] = useSearchParams();

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
        const res = await axios.get("/articles/getall");
        setArticles(res.data);
      } catch (err) {
        console.error("Error fetching articles", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">All Articles</h2>

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
              <h3 className="text-xl font-semibold text-indigo-700">
                {article.title}
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

      {selectedArticle && (
        <ArticlePage article={selectedArticle} onClose={closeModal} />
      )}
    </div>
  );
};

export default ArticlesList;
