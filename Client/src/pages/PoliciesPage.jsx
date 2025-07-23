import { FaArrowLeft } from "react-icons/fa"
import { useAuth0 } from '@auth0/auth0-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import instance from '../lib/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const PoliciesPage = () => {

    const { user, isLoading, isAuthenticated, logout } = useAuth0()
    const [role, setrole] = useState("")
    const [email, setEmail] = useState("")
    const [recommendedSchemes, setRecommendedSchemes] = useState([])

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/")
        } else if (!isLoading && isAuthenticated) {
            setEmail(user?.email)
            const roles = user?.["https://fined.com/roles"]
            setrole(roles?.[0] || "")
        }
    }, [isLoading, isAuthenticated])

    const fetchRecommendations = async () => {
        try {
            const res = await instance.post("/home/recommendations", { email, course_id: "e756d478-e7f6-4e8d-b0f7-d05afee13a39" });
            console.log(res.data)
            setRecommendedSchemes(res.data.recommendations);
        } catch (err) {
            toast.error("Failed to load recommended schemes.", err);
            setShowLeaderBoard(false);
        }
    };

    useEffect(() => {
        if (email) {
            fetchRecommendations()
        }
    }, [email])

    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-100 px-4 pb-5 text-gray-800">
            <Navbar />
            <div className="max-w-5xl mx-auto py-10">
                <div className="bg-amber-300 p-6 mb-8 rounded-b-3xl" >
                    <div className="flex items-center justify-between mb-4" >
                        {/* Back Button */}
                        <button onClick={() => navigate("/home")} className="flex items-center text-sm font-medium cursor-pointer rounded-full bg-white p-2">
                            <FaArrowLeft className="text-amber-400 text-xl" />
                        </button>

                        {/* Title */}
                        <h1 className="text-center text-lg sm:text-2xl font-semibold text-white">
                            Discover Best Schemes For You
                        </h1>
                        <div></div>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-justify font-medium text-white mb-4">
                        This feature helps you discover the best financial products—like savings accounts, debit cards, FDs, and mutual funds—tailored just for you. As you interact with FinEd’s website and answer simple questions about your income, spending habits, and goals, our system smartly matches your profile with suitable schemes from trusted banks like SBI, HDFC, ICICI, and Kotak. No more guesswork—get recommendations that actually fit your financial journey.
                    </p>

                    {/* Disclaimer */}
                    <p className="text-[9px] sm:text-xs text-justify text-white font-medium rounded-md mb-4">
                        <span className="font-bold">Disclaimer</span><br />
                        FinEd is not affiliated with or endorsed by any of the banks mentioned. Currently, recommendations are limited to schemes from SBI, HDFC, ICICI, and Kotak Mahindra Bank—our team is actively working to expand this list. All suggestions are generated based on your inputs and our internal algorithm. While we aim to provide useful insights, these should not be considered professional financial advice. Please evaluate the options carefully before making any financial decisions.
                    </p>

                    {/* Call to action */}
                    <div className="flex items-start gap-3 text-blue-700 px-4 py-3 text-base sm:text-lg rounded-md">
                        <img
                            src="/ellipse.png"
                            alt="emoji"
                            className="w-12 h-12 sm:h-14 sm:w-14"
                        />
                        <p>
                            <span className="font-semibold">To get more accurate suggestions</span>, just complete our courses or answer a quick questionnaire—it only takes a minute!{" "}
                            <a href="#" className="font-semibold underline">
                                Click to get started (No preparation needed)
                            </a>
                        </p>
                    </div>
                </div>

                {/* Policies */}
                <div className="space-y-3">
                    {recommendedSchemes.map((scheme, idx) => (
                        <div
                            onClick={() => {scheme.short_name ? navigate(`/${scheme.short_name}`) : toast("Coming soon !")}}
                            key={idx}
                            className="flex justify-between items-start bg-white px-4 py-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-300 transition-all duration-200"
                        >
                            {/* Left */}
                            <div className="flex gap-3 items-start">
                                <span className="text-sm font-semibold mt-1">{idx + 1}</span>
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/888/888879.png"
                                    alt="icon"
                                    className="w-6 h-6 mt-1"
                                />
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">{scheme.bank_name} {scheme.scheme_name}</p>
                                    <p className="text-xs text-gray-600 leading-snug">{scheme.description}</p>
                                </div>
                            </div>

                            {/* Right */}
                            <div className="text-purple-700 text-base font-semibold whitespace-nowrap mt-2 sm:mt-0">
                                {scheme.rate}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PoliciesPage;