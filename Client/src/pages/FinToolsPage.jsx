import React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth0 } from '@auth0/auth0-react'

const tools = [
    {
        name: "Expense Tracker",
        image: "/images/expense-tracker.png",
        description: "Track your monthly expenses, set budgets, and visualize your financial habits.",
        route: "/fin-tools/expensetracker",
        available: true
    },
    {
        name: "Loan Calculator",
        image: "/images/loan-calculator.png",
        description: "Calculate EMIs and track your loan payments easily.",
        available: false
    },
    {
        name: "Investment Planner",
        image: "/images/investment-planner.png",
        description: "Plan your investments based on goals and timelines.",
        available: false
    }
]

export default function FinToolsPage() {
    const navigate = useNavigate()

    const { user, isLoading, isAuthenticated, logout } = useAuth0()
    const [role, setrole] = useState("")

    const [email, setEmail] = useState("")

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/")
        } else if (!isLoading && isAuthenticated) {
            setEmail(user?.email || "")
            const roles = user?.["https://fined.com/roles"]
            setrole(roles?.[0] || "")
        }
    }, [isLoading, isAuthenticated])

    return (
        <div className="px-10 py-5 min-h-screen bg-gray-50">
            <header className="flex justify-between items-center h-[63px] py-6 bg-gray-50 box-border">

                <div className="flex items-center gap-2 font-bold text-lg max-w-[180px] overflow-hidden whitespace-nowrap">
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

                <div onClick={() => navigate("/notifications")} className="bg-white rounded-full p-3 shadow-md cursor-pointer">
                    <img src="bell.png" alt="Bell Icon" width="24" />
                </div>
            </header>
            <div className="py-10" >
                <h1 className="text-3xl font-bold mb-8 text-gray-800">FinTools</h1>
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool, index) => (
                        <div
                            key={index}
                            className={`rounded-2xl shadow-md overflow-hidden bg-white border ${tool.available ? "hover:shadow-xl cursor-pointer" : "opacity-60"
                                } transition-all duration-300`}
                            onClick={() => tool.available && navigate(tool.route)}
                        >
                            <img
                                src={tool.image}
                                alt={tool.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    {tool.name}
                                </h2>
                                <p className="text-gray-600 text-sm">{tool.description}</p>
                                {!tool.available && (
                                    <span className="inline-block mt-3 text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                        Coming Soon
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
