import { useAuth0 } from '@auth0/auth0-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import instance from '../lib/axios'
import toast from 'react-hot-toast'

export default function Footer() {

    const { user, isLoading, isAuthenticated, logout } = useAuth0()
    const [role, setrole] = useState("")
    const [email, setEmail] = useState("")

    const [isSaved, setIsSaved] = useState(false)
    const [enteredEmail, setEnteredEmail] = useState("")
    const [isEnteredEmail, setIsEnteredEmail] = useState(false)

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            setEmail(user?.email || "")
            const roles = user?.["https://fined.com/roles"]
            setrole(roles?.[0] || "")
        }
    }, [isLoading, isAuthenticated])

    async function fetchEnteredEmail() {
        try {
            const res = await instance.post("/articles/getenteredemail", { email });
            if (res.data[0]?.enteredEmail) {
                setEnteredEmail(res.data[0]?.enteredEmail || null);
                setIsEnteredEmail(true);
            }
        } catch (error) {
            setEnteredEmail("");
            setIsEnteredEmail(false);
            toast.error("Failed to fetch your subscription email.");
        }
    }

    useEffect(() => {
        if (email) {
            fetchEnteredEmail();
        }
    }, [email]);

    const saveEmail = async () => {
        if (enteredEmail === "") return;
        setIsSaved(true);
        try {
            await instance.post("/articles/saveemail", { email, enteredEmail });
            toast.success("🎉 Subscribed successfully.")
            setIsEnteredEmail(true);
        } catch (err) {
            setWarning("Failed to save email.");
        } finally {
            setIsSaved(false);
        }
    };

    const removeEmail = async () => {
        setIsSaved(true);
        try {
            await instance.post("/articles/removeemail", { email, enteredEmail });
            toast.success("Unsubscribed successfully.");
            setEnteredEmail("");
            setIsEnteredEmail(false);
        } catch (err) {
            setWarning("Failed to remove email.");
        } finally {
            setIsSaved(false);
        }
    };

    return (
        <div>
            <footer className="bg-[#f7fafc] p-6 sm:px-20 sm:py-10 flex flex-col sm:flex-row flex-wrap justify-between text-[#333] font-sans">
                <div className="flex-1 basis-full sm:basis-[200px] my-5 sm:m-5 min-w-[200px] flex flex-col items-center sm:items-start">
                    <img src="/logo.png" alt="FinEd Logo" className="h-[50px] mb-3" />
                    <p className="text-sm sm:text-base text-gray-700 mb-4 text-center sm:text-left">Financial Education made Easy.</p>
                    <div className="flex gap-4">
                        <Link to="https://www.linkedin.com/company/fined-personal-finance/"><img src="/linkedin.png" alt="LinkedIn" className="w-8 h-8 transition-transform duration-200 hover:scale-110 cursor-pointer" /></Link>
                        <Link to="https://www.instagram.com/fined.personalfinance"><img src="/insta.jpg" alt="Instagram" className="w-8 h-8 transition-transform duration-200 hover:scale-110 cursor-pointer" /></Link>
                    </div>
                </div>
                <div className="flex-1 basis-full sm:basis-[200px] my-5 sm:m-5 min-w-[200px] font-semibold text-center sm:text-left">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mb-4">FEATURED</h4>
                    <Link to="/courses" className="block mb-3 text-sm sm:text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Courses</Link>
                    <Link to="/articles" className="block mb-3 text-sm sm:text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Articles</Link>
                    <Link to="/fin-tools" className="block mb-3 text-sm sm:text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">FinTools</Link>
                    <Link to="/about" className="block mb-3 text-sm sm:text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">About Us</Link>
                </div>
                <div className="flex-1 basis-full sm:basis-[200px] my-5 sm:m-5 min-w-[200px] font-semibold text-center sm:text-left">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mb-4">OTHER</h4>
                    <Link to="/help" className="block mb-3 text-sm sm:text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Help</Link>
                    <Link to="/contact" className="block mb-3 text-sm sm:text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Contact Us</Link>
                    <Link to="/feedback" className="block mb-3 text-sm sm:text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Feedback</Link>
                </div>
                <div className="newsletter my-5 sm:m-5 w-full sm:w-auto">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase mb-4">NEWSLETTER</h4>
                    {isEnteredEmail ? (
                        <div>
                            <p className="py-3 pl-3 pr-10 sm:pr-28 w-full mb-3 border border-gray-200 rounded-md text-xs sm:text-sm box-border">{enteredEmail}</p>
                            {isSaved ?
                                <div className="flex items-center justify-center gap-2 text-[#fbbf24] font-semibold">
                                    <svg className="animate-spin h-5 w-5 text-[#fbbf24]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Unsubscribing...
                                </div>
                                :
                                <button onClick={removeEmail} className="p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border">
                                    Unsubscribe
                                </button>
                            }
                        </div>
                    ) : (
                        <div>
                            <input
                                value={enteredEmail}
                                onChange={(e) => setEnteredEmail(e.target.value.trim())}
                                type="email"
                                placeholder="Enter your email address"
                                className="p-3 w-full mb-3 border border-gray-200 rounded-md text-xs sm:text-sm box-border"
                            />
                            {isSaved ?
                                <button className="flex items-center justify-center gap-2 p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border">
                                    <svg className="animate-spin h-5 w-5 text-[#fbbf24]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Subscribing...
                                </button>
                                :
                                <button
                                    onClick={() => {
                                        if (isAuthenticated) {
                                            saveEmail();
                                        } else {
                                            toast.error("Please signin !");
                                        }
                                    }}
                                    className="p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border"
                                >
                                    Subscribe Now
                                </button>
                            }
                        </div>
                    )}
                </div>
            </footer>

            <p className="text-center justify-center w-full mt-10 my-5 text-xs 2xl:max-w-[1400px] 2xl:mx-auto">
                © Copyright {new Date().getFullYear()}, All Rights Reserved by FinEd.
            </p>
        </div>
    )
}