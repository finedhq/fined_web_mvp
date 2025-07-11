import React from "react"
import { useNavigate } from "react-router-dom"

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-6 text-center">
      <h1 className="text-7xl font-bold text-amber-400 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-amber-400 hover:bg-amber-500 text-white font-medium py-2 px-5 rounded-lg transition duration-200 cursor-pointer"
      >
        Go to Homepage
      </button>
    </div>
  )
}

export default NotFoundPage