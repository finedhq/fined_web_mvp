import { useAuth0 } from '@auth0/auth0-react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import instance from '../lib/axios'
import toast from 'react-hot-toast'

const Notifications = () => {

  const navigate = useNavigate()
  const location = useLocation()

  const { user, isLoading, isAuthenticated, logout } = useAuth0()
  const [role, setrole] = useState("")

  const [email, setEmail] = useState("")

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/")
    } else if (!isLoading && isAuthenticated) {
      setEmail(user?.email)
      const roles = user?.["https://fined.com/roles"]
      setrole(roles?.[0] || "")
    }
  }, [isLoading, isAuthenticated])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await instance.post("/home/notifications", { email })
      if (res.data) {
        setNotifications(res.data || [])
        const response = await instance.post("/home/updatenotifications", { email })
      }
    } catch (err) {
      toast.error("Failed to load notifications.")
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    if (!email) return
    fetchNotifications()
  }, [email])

  return (
    <div className="px-10 py-5 font-inter text-[#1e1e1e] bg-gray-100 min-h-screen">
      <header className="flex justify-between items-center h-[63px] bg-gray-100 box-border">

        <div onClick={() => navigate('/')} className="flex items-center gap-2 font-bold text-lg max-w-[180px] overflow-hidden whitespace-nowrap cursor-pointer">
          <img src="logo.jpg" alt="FinEd Logo" className="h-[60px] w-auto object-contain" />
        </div>

        <nav className="flex gap-5">
          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/home' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/home')}
          >
            Home
          </button>
          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/courses' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/courses')}
          >
            Courses
          </button>
          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/articles' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/articles')}
          >
            Articles
          </button>
          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/fin-tools' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/fin-tools')}
          >
            FinTools
          </button>

          {role === "Admin" ? <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/fin-tools' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/admin')}
          >Admin DashBoard</button> : ""}

          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors bg-white text-gray-700 hover:bg-gray-200`}
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            LogOut
          </button>
        </nav>

        <div onClick={() => navigate("/notifications")} className={`rounded-full p-3 shadow-md cursor-pointer  ${location.pathname === '/notifications' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>
          <img src="bell_1.jpg" alt="Bell Icon" width="24" />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">🔔 Notifications</h2>

        {loading ? (
          <ul className="space-y-4 animate-pulse">
            {Array(4).fill(0).map((_, i) => (
              <li key={i} className="p-6 rounded-lg bg-gray-200">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </li>
            ))}
          </ul>
        ) : notifications.length === 0 ? (
          <p className="text-gray-500">No notifications yet.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((note, index) => (
              <li key={index} className={`p-4 rounded-lg shadow-sm transition ${note.seen ? "bg-gray-200" : "bg-blue-50 border border-blue-300"}`} >
                <p className="text-sm md:text-base">{note.content}</p>
                <small className="block mt-2 text-xs text-gray-500">
                  {new Date(note.created_at).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default Notifications;