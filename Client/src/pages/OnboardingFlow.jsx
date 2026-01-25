import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OnboardingFlow() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedGoal, setSelectedGoal] = useState('');
    const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showContinueButton, setShowContinueButton] = useState(false);

    // Calculate SIP returns with 15.91% annual return (compounded monthly)
    const calculateSIPReturns = (monthlyAmount) => {
        const monthlyRate = 0.1591 / 12;
        const months = 10 * 12;
        let totalInvested = 0;
        let totalValue = 0;
        const yearlyData = [];

        for (let month = 1; month <= months; month++) {
            totalInvested += monthlyAmount;
            totalValue = (totalValue + monthlyAmount) * (1 + monthlyRate);

            if (month % 12 === 0) {
                yearlyData.push({
                    year: month / 12,
                    invested: Math.round(totalInvested),
                    value: Math.round(totalValue)
                });
            }
        }

        return {
            totalInvested: Math.round(totalInvested),
            finalValue: Math.round(totalValue),
            yearlyData
        };
    };

    const sipData = calculateSIPReturns(monthlyInvestment);

    const otherAvenues = [
        { name: 'Fixed Deposit', returns: '6-7%', risk: 'Low' },
        { name: 'Gold', returns: '8-10%', risk: 'Medium' },
        { name: 'Real Estate', returns: '10-12%', risk: 'High' },
        { name: 'Savings Account', returns: '3-4%', risk: 'Very Low' },
    ];

    const goals = [
        {
            id: 'budget',
            title: 'Learn how to budget & save more',
        },
        {
            id: 'invest',
            title: 'Start investing and grow my wealth',
        },
        {
            id: 'credit',
            title: 'Learn about credit cards and loans',
        },
        {
            id: 'explore',
            title: 'Not sure yet, just exploring',
        }
    ];

    const handleNext = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setStep(step + 1);
            setIsAnimating(false);
        }, 300);
    };

    const handleGoalSelect = (goalId) => {
        setSelectedGoal(goalId);
    };

    // Step 1: Show Continue button after 5 seconds
    useEffect(() => {
        if (step === 1) {
            const timer = setTimeout(() => {
                setShowContinueButton(true);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800">

            {/* Step 1: Welcome Screen */}
            {step === 1 && (
                <div className="flex flex-col items-center justify-center min-h-screen px-4 md:px-6">
                    <div className="text-center max-w-3xl">
                        {/* Animated Circle */}
                        <div className="mb-6 md:mb-8">
                            <div className="inline-block p-8 md:p-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full shadow-2xl animate-pulse">
                                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        </div>

                        {/* Welcome Text */}
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 text-blue-700 leading-tight">
                            Welcome to FinEd
                        </h1>
                        <h2 className="text-2xl md:text-4xl font-semibold mb-6 md:mb-8 text-gray-700 leading-snug">
                            Your Personal Finance Journey Starts Here
                        </h2>

                        <p className="text-lg md:text-2xl text-gray-600 mb-8 md:mb-12 leading-relaxed px-2">
                            We'll ask you a few quick questions to guide you to the right courses and tools.
                            <br className="hidden md:block" />
                            <span className="text-blue-700 font-semibold block mt-2 md:inline md:mt-0">It takes less than 30 seconds.</span>
                        </p>

                        {/* Continue Button - appears after 5 seconds */}
                        {showContinueButton && (
                            <div className="mb-8 md:mb-12 animate-fadeIn">
                                <button
                                    onClick={handleNext}
                                    className="px-8 py-3 md:px-12 md:py-4 rounded-lg text-lg md:text-xl font-bold bg-amber-400 hover:bg-amber-500 text-white shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                                >
                                    Let's Go!
                                </button>
                            </div>
                        )}

                        {/* Progress Indicator */}
                        <div className="flex justify-center gap-2">
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-blue-600 rounded-full"></div>
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-gray-300 rounded-full"></div>
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-gray-300 rounded-full"></div>
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Goal Selection */}
            {step === 2 && (
                <div className={`flex flex-col items-center justify-center min-h-screen px-4 md:px-6 py-8 md:py-12 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="max-w-4xl w-full">
                        <h2 className="text-3xl md:text-5xl font-bold text-center mb-3 md:mb-4 text-blue-700 leading-tight">
                            What's your main money goal right now?
                        </h2>
                        <p className="text-lg md:text-xl text-center text-gray-600 mb-8 md:mb-12">
                            Choose one that resonates most with you
                        </p>

                        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
                            {goals.map((goal) => (
                                <button
                                    key={goal.id}
                                    onClick={() => handleGoalSelect(goal.id)}
                                    className={`p-6 md:p-8 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 ${selectedGoal === goal.id
                                        ? 'bg-blue-700 text-white border-blue-700 shadow-2xl scale-102 md:scale-105'
                                        : 'bg-white text-gray-800 border-gray-200 hover:border-blue-500 shadow-lg'
                                        }`}
                                >
                                    <p className="text-xl md:text-2xl font-semibold text-left">{goal.title}</p>

                                    {/* Checkmark when selected */}
                                    {selectedGoal === goal.id && (
                                        <div className="mt-4 flex justify-end">
                                            <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleNext}
                                disabled={!selectedGoal}
                                className={`px-8 py-3 md:px-12 md:py-4 rounded-lg text-lg md:text-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${selectedGoal
                                    ? 'bg-amber-400 hover:bg-amber-500 text-white shadow-xl'
                                    : 'bg-gray-300 cursor-not-allowed opacity-50 text-gray-500'
                                    }`}
                            >
                                Continue
                            </button>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex justify-center gap-2 mt-8 md:mt-12">
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-gray-300 rounded-full"></div>
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-blue-600 rounded-full"></div>
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-gray-300 rounded-full"></div>
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Compounding Power */}
            {step === 3 && (
                <div className={`flex flex-col items-center justify-center min-h-screen px-4 md:px-6 py-8 md:py-12 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="max-w-6xl w-full">
                        <h2 className="text-3xl md:text-5xl font-bold text-center mb-3 md:mb-4 text-blue-700 leading-tight">
                            The Power of Compounding
                        </h2>
                        <p className="text-lg md:text-xl text-center text-gray-600 mb-8 md:mb-12">
                            See how your money can grow over 10 years with smart investing
                        </p>

                        {/* Monthly Investment Slider & Input */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                            <div className="mb-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                                    <label className="text-xl md:text-2xl font-semibold text-gray-800">
                                        Monthly Investment:
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700 font-bold text-lg md:text-xl">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100000"
                                            value={monthlyInvestment}
                                            onChange={(e) => {
                                                const val = Math.min(100000, Math.max(0, Number(e.target.value)));
                                                setMonthlyInvestment(val);
                                            }}
                                            className="w-full md:w-48 pl-8 pr-4 py-2 border-2 border-blue-100 rounded-lg text-blue-700 font-bold text-lg md:text-xl focus:border-blue-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100000"
                                    step="500"
                                    value={monthlyInvestment}
                                    onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs md:text-sm text-gray-500 mt-2">
                                    <span>₹0</span>
                                    <span>₹1,00,000</span>
                                </div>
                            </div>

                            {/* Results Display */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                                <div className="bg-gray-50 border-2 border-gray-200 p-4 md:p-6 rounded-xl">
                                    <p className="text-gray-600 text-sm mb-1 md:mb-2 font-medium">Total Invested</p>
                                    <p className="text-2xl md:text-3xl font-bold text-gray-800">₹{sipData.totalInvested.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="bg-blue-50 border-2 border-blue-200 p-4 md:p-6 rounded-xl">
                                    <p className="text-blue-700 text-sm mb-1 md:mb-2 font-medium">Final Value (10y)</p>
                                    <p className="text-2xl md:text-3xl font-bold text-blue-700">₹{sipData.finalValue.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="bg-green-50 border-2 border-green-200 p-4 md:p-6 rounded-xl">
                                    <p className="text-green-700 text-sm mb-1 md:mb-2 font-medium">Profit Gained</p>
                                    <p className="text-2xl md:text-3xl font-bold text-green-600">₹{(sipData.finalValue - sipData.totalInvested).toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200">
                                <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">Projected Growth (SIP in Sensex)</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={sipData.yearlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="year"
                                            stroke="#6b7280"
                                            tick={{ fontSize: 12 }}
                                            label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 12 }}
                                        />
                                        <YAxis
                                            stroke="#6b7280"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                                            formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="invested"
                                            stroke="#1d4ed8"
                                            strokeWidth={3}
                                            name="Total Invested"
                                            dot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#f59e0b"
                                            strokeWidth={3}
                                            name="Portfolio Value"
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Other Investment Avenues */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                            <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">Other Investment Avenues</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                                {otherAvenues.map((avenue, index) => (
                                    <div key={index} className="bg-gray-50 border border-gray-200 p-3 md:p-4 rounded-lg">
                                        <p className="font-semibold text-base md:text-lg mb-1 md:mb-2 text-gray-800">{avenue.name}</p>
                                        <p className="text-blue-700 text-lg md:text-xl font-bold mb-1">{avenue.returns}</p>
                                        <p className="text-xs md:text-sm text-gray-500">Risk: {avenue.risk}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className="text-center text-lg md:text-xl mb-6 md:mb-8 text-gray-700">
                            That's how you can put your money to work. <br className="md:hidden" /> <span className="text-blue-700 font-bold">Let's get you started!</span>
                        </p>

                        {/* Navigation Buttons */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-6 py-3 md:px-8 md:py-4 rounded-lg text-base md:text-lg font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-300"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 md:px-12 md:py-4 rounded-lg text-lg md:text-xl font-bold bg-amber-400 hover:bg-amber-500 text-white shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                                Continue
                            </button>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex justify-center gap-2 mt-8 md:mt-12">
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-gray-300 rounded-full"></div>
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-gray-300 rounded-full"></div>
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-blue-600 rounded-full"></div>
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Website Demo */}
            {step === 4 && (
                <div className={`flex flex-col items-center justify-center min-h-screen px-4 md:px-6 py-8 md:py-12 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="max-w-6xl w-full">
                        <h2 className="text-3xl md:text-5xl font-bold text-center mb-3 md:mb-4 text-blue-700 leading-tight">
                            Explore Everything FinEd Has to Offer
                        </h2>
                        <p className="text-lg md:text-xl text-center text-gray-600 mb-8 md:mb-12">
                            Here's a quick overview of what awaits you
                        </p>

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
                            {/* Courses */}
                            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-gray-200 hover:border-blue-500 transition-all duration-300">
                                <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-blue-700">Courses</h3>
                                <p className="text-base md:text-lg text-gray-600 mb-4">
                                    Bite-sized, engaging lessons designed to make finance simple and fun. Learn at your own pace.
                                </p>
                                <ul className="space-y-2 text-gray-700 text-sm md:text-base">
                                    <li className="flex items-start">
                                        <span className="text-blue-700 mr-2 font-bold">✓</span>
                                        <span>Step-by-step learning paths</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-700 mr-2 font-bold">✓</span>
                                        <span>Interactive quizzes</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Articles */}
                            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-gray-200 hover:border-blue-500 transition-all duration-300">
                                <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-blue-700">Articles</h3>
                                <p className="text-base md:text-lg text-gray-600 mb-4">
                                    Stay updated with the latest financial news, trends, and tips.
                                </p>
                                <ul className="space-y-2 text-gray-700 text-sm md:text-base">
                                    <li className="flex items-start">
                                        <span className="text-blue-700 mr-2 font-bold">✓</span>
                                        <span>Daily financial insights</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-700 mr-2 font-bold">✓</span>
                                        <span>Expert analysis & tips</span>
                                    </li>
                                </ul>
                            </div>

                            {/* FinTools */}
                            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-gray-200 hover:border-blue-500 transition-all duration-300">
                                <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-blue-700">FinTools</h3>
                                <p className="text-base md:text-lg text-gray-600 mb-4">
                                    Powerful calculators and tools to help you make smart financial decisions.
                                </p>
                                <ul className="space-y-2 text-gray-700 text-sm md:text-base">
                                    <li className="flex items-start">
                                        <span className="text-blue-700 mr-2 font-bold">✓</span>
                                        <span>Budget trackers & calculators</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-700 mr-2 font-bold">✓</span>
                                        <span>Goal planners</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Rewards System */}
                            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-gray-200 hover:border-blue-500 transition-all duration-300">
                                <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-blue-700">FinStars</h3>
                                <p className="text-base md:text-lg text-gray-600 mb-4">
                                    Earn FinStars as you learn and climb the leaderboard.
                                </p>
                                <ul className="space-y-2 text-gray-700 text-sm md:text-base">
                                    <li className="flex items-start">
                                        <span className="text-blue-700 mr-2 font-bold">✓</span>
                                        <span>Earn rewards while learning</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-700 mr-2 font-bold">✓</span>
                                        <span>Compete with friends</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 mb-6 md:mb-8 shadow-2xl">
                            <h3 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-white">Ready to Start?</h3>
                            <p className="text-lg md:text-xl mb-6 md:mb-8 text-blue-100">Join thousands of learners today</p>
                            <button
                                onClick={() => navigate('/signup')}
                                className="w-full md:w-auto px-8 py-4 md:px-16 md:py-5 rounded-lg text-xl md:text-2xl font-bold bg-amber-400 hover:bg-amber-500 text-white shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                                Get Started Now
                            </button>
                        </div>

                        {/* Skip Option */}
                        <div className="text-center">
                            <button
                                onClick={() => navigate('/')}
                                className="text-gray-600 hover:text-blue-700 transition-colors duration-200 underline text-base md:text-lg p-2"
                            >
                                Skip for now, I'll explore on my own
                            </button>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex justify-center gap-2 mt-8 md:mt-12">
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-gray-300 rounded-full"></div>
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-gray-300 rounded-full"></div>
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-gray-300 rounded-full"></div>
                            <div className="h-1.5 w-12 md:h-2 md:w-16 bg-blue-600 rounded-full"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Slider Styles */}
            <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #1d4ed8;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(29, 78, 216, 0.4);
          margin-top: -8px; /* Centers thumb on the track */
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #1d4ed8;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(29, 78, 216, 0.4);
        }

        .slider::-webkit-slider-runnable-track {
          background: linear-gradient(to right, #1d4ed8 0%, #1d4ed8 ${(monthlyInvestment / 100000) * 100}%, #e5e7eb ${(monthlyInvestment / 100000) * 100}%, #e5e7eb 100%);
          height: 8px;
          border-radius: 4px;
        }

        .slider::-moz-range-track {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
        }

        .slider::-moz-range-progress {
          background: #1d4ed8;
          height: 8px;
          border-radius: 4px;
        }
      `}</style>
        </div>
    );
}
