import React, { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const ArticlePage = ({ article, onClose }) => {
  const modalRef = useRef(null);

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

  // Close on Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Close on outside click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/admin/articles?article=${article.id}`;
      await navigator.clipboard.writeText(shareUrl);
      alert("🔗 Link copied to clipboard!");
    } catch (err) {
      console.error("❌ Failed to copy link:", err);
      alert("❌ Failed to copy the link.");
    }
  };

  return (

    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-3xl w-full relative shadow-lg animate-fade-in"
      >
        {/* Header buttons */}
        <div className="absolute top-3 right-3 flex gap-3">
          <button
            onClick={handleShare}
            title="Share Article"
            className="text-blue-600 hover:text-blue-800 text-xl transition"
          >
            🔗
          </button>
          <button
            onClick={onClose}
            title="Close"
            className="text-gray-600 hover:text-red-500 text-2xl transition"
          >
            ✕
          </button>
        </div>

        {/* Article Content */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">{article.title}</h1>

        {article.image_url && (
          <img
            src={article.image_url}
            alt={`${article.title} illustration`}
            className="w-full rounded mb-4"
          />
        )}

        <p className="whitespace-pre-line leading-relaxed text-gray-800 text-[1.05rem]">
          {article.content}
        </p>
      </div>
    </div>
  );
};

export default ArticlePage;
