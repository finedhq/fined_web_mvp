import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import instance from "../lib/axios"
import { useAuth0 } from '@auth0/auth0-react'
import toast from "react-hot-toast"
import { FaStar } from "react-icons/fa"

export default function FeedbackPage() {
    const navigate = useNavigate()
    const { user, isLoading, isAuthenticated } = useAuth0()

    const [form, setForm] = useState({
        name: "",
        email: "",
        q1_helpfulness: 5,
        q2_difficulty: "",
        q3_navigation: 5,
        q4_design: "",
        q5_confusing: "",
        q5_details: "",
        q6_favFeature: "",
        q7_returnLikelihood: 5,
        additionalFeedback: ""
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            setForm(prev => ({
                ...prev,
                name: user?.name || "",
                email: user?.email || ""
            }))
        }
    }, [isLoading, isAuthenticated])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const requiredFields = ["name", "email", "q2_difficulty", "q4_design", "q5_confusing", "q6_favFeature"]
        for (let field of requiredFields) {
            if (!form[field]) {
                return toast.error("Please fill in all required fields.")
            }
        }

        setSubmitting(true)
        try {
            const res = await instance.post("/home/feedback", { form } )
            if (res.status === 200) {
                toast.success("Thank you for your feedback!")
                setForm({
                    name: user?.name || "",
                    email: user?.email || "",
                    q1_helpfulness: 5,
                    q2_difficulty: "",
                    q3_navigation: 5,
                    q4_design: "",
                    q5_confusing: "",
                    q5_details: "",
                    q6_favFeature: "",
                    q7_returnLikelihood: 5,
                    additionalFeedback: ""
                })
            }
        } catch (err) {
            toast.error("Failed to send feedback.")
        } finally {
            setSubmitting(false)
        }
    }

    const renderStars = (name, value) => (
        <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                    key={star}
                    size={24}
                    className={`cursor-pointer transition-transform transform hover:scale-110 ${form[name] >= star ? "text-yellow-400" : "text-gray-300"}`}
                    onClick={() => setForm(prev => ({ ...prev, [name]: star }))}
                />
            ))}
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className='flex justify-between'>
                    <h2 className="text-3xl font-bold text-center text-gray-800">We Value Your Feedback</h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-500 hover:text-gray-700 text-4xl -mt-2 font-bold cursor-pointer"
                    >
                        &times;
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border rounded-lg shadow-sm focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border rounded-lg shadow-sm focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label>Q1. How helpful did you find the financial learning content?</label>
                        {renderStars("q1_helpfulness", form.q1_helpfulness)}
                    </div>

                    <div>
                        <label>Q2. Did the content feel too basic, too advanced, or just right for you?</label>
                        <select name="q2_difficulty" value={form.q2_difficulty} onChange={handleChange} className="w-full px-4 py-2 mt-3 border rounded-lg cursor-pointer">
                            <option value="">Select...</option>
                            <option value="Too basic">Too basic</option>
                            <option value="Slightly basic">Slightly basic</option>
                            <option value="Just right">Just right</option>
                            <option value="Slightly advanced">Slightly advanced</option>
                            <option value="Too advanced">Too advanced</option>
                        </select>
                    </div>

                    <div>
                        <label>Q3. On a scale of 1–5, how easy was it to navigate the website?</label>
                        {renderStars("q3_navigation", form.q3_navigation)}
                    </div>

                    <div>
                        <label>Q4. How would you rate the overall design and layout of the website?</label>
                        <select name="q4_design" value={form.q4_design} onChange={handleChange} className="w-full px-4 py-2 mt-3 border rounded-lg cursor-pointer">
                            <option value="">Select...</option>
                            <option value="Very poor">Very poor</option>
                            <option value="Poor">Poor</option>
                            <option value="Average">Average</option>
                            <option value="Good">Good</option>
                            <option value="Excellent">Excellent</option>
                        </select>
                    </div>

                    <div>
                        <label>Q5. Were there any parts of the website that felt confusing?</label>
                        <select name="q5_confusing" value={form.q5_confusing} onChange={handleChange} className="w-full px-4 py-2 mt-3 border rounded-lg cursor-pointer">
                            <option value="">Select...</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                        {form.q5_confusing === "Yes" && (
                            <textarea
                                name="q5_details"
                                placeholder="If yes, please specify..."
                                value={form.q5_details}
                                onChange={handleChange}
                                className="w-full mt-2 px-4 py-2 border rounded-lg resize-none"
                                rows="3"
                            />
                        )}
                    </div>

                    <div>
                        <label>Q6. What feature did you find most useful?</label>
                        <select name="q6_favFeature" value={form.q6_favFeature} onChange={handleChange} className="w-full px-4 py-2 mt-3 border rounded-lg cursor-pointer">
                            <option value="">Select...</option>
                            <option value="Courses">Courses</option>
                            <option value="Articles">Articles</option>
                            <option value="FinTools">FinTools (Expense Tracker)</option>
                            <option value="Rewards">Rewards (Finstars and Finscore)</option>
                            <option value="Scheme Recommendations">Scheme Recommendations</option>
                            <option value="None">Haven’t used any yet</option>
                        </select>
                    </div>

                    <div>
                        <label>Q7. Based on your experience, how likely are you to return to FinEd?</label>
                        {renderStars("q7_returnLikelihood", form.q7_returnLikelihood)}
                    </div>

                    <div>
                        <label>Additional Feedback</label>
                        <textarea
                            name="additionalFeedback"
                            rows="4"
                            value={form.additionalFeedback}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border rounded-lg resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-amber-400 text-white py-2 px-4 rounded-lg hover:bg-amber-500 transition-all font-semibold cursor-pointer"
                    >
                        {submitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                </form>
            </div>
        </div>
    )
}
