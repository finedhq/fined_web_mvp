import React from "react";

const ArticlePage = ({ article, onClose }) => {
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/admin/articles?article=${article.id}`;
      await navigator.clipboard.writeText(shareUrl);
      alert("🔗 Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      alert("❌ Failed to copy the link.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full relative">
        {/* Top Right Buttons */}
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={handleShare}
            title="Share Article"
            className="text-blue-600 hover:text-blue-800 text-lg"
          >
            🔗
          </button>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 text-xl"
            title="Close"
          >
            ✕
          </button>
        </div>
        <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
        {article.image_url && (
          <img
            src={article.image_url}
            alt="Thumbnail"
            className="w-full rounded mb-4"
          />
        )}
        <p className="whitespace-pre-line leading-relaxed">{article.content}</p>
      </div>
    </div>
  );
};

export default ArticlePage;
