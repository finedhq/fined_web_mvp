import React, { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import instance from "../lib/axios"
import { useAuth0 } from '@auth0/auth0-react'
import toast from 'react-hot-toast'
import { FiMenu, FiX } from "react-icons/fi"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import TeamSection from "../components/TeamSection"

const AboutUs = () => {

  const navigate = useNavigate()
  const location = useLocation()

  const { user, isLoading, isAuthenticated, logout, loginWithPopup } = useAuth0()
  const [role, setrole] = useState("")

  const [email, setEmail] = useState("")

  const [hasUnseen, setHasUnseen] = useState(false)
  const [enteredEmail, setEnteredEmail] = useState("")
  const [isEnteredEmail, setIsEnteredEmail] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setEmail(user?.email || "")
      const roles = user?.["https://fined.com/roles"]
      setrole(roles?.[0] || "")
    }
  }, [isLoading, isAuthenticated])

  async function fetchHasUnseen() {
    try {
      const res = await instance.post("/home/hasunseen", { email })
      if (res) {
        setHasUnseen(res.data)
      }
    } catch (error) {
      toast.error("Failed to fetch notifications status.")
    }
  }

  async function fetchEnteredEmail() {
    try {
      const res = await instance.post("/articles/getenteredemail", { email })
      if (res.data[0]?.enteredEmail) {
        setEnteredEmail(res.data[0]?.enteredEmail || null)
        setIsEnteredEmail(true)
      }
    } catch (error) {
      setEnteredEmail("")
      setIsEnteredEmail(false)
    }
  }

  useEffect(() => {
    if (!email) return
    fetchEnteredEmail()
    fetchHasUnseen()
  }, [email])

  const saveEmail = async () => {
    if (enteredEmail === "") return
    setIsSaved(true)
    try {
      await instance.post("/articles/saveemail", { email, enteredEmail })
      setWarning("🎉 Subscribed successfully.")
      setIsEnteredEmail(true)
    } catch (err) {
      toast.error("❌ Failed to save email.")
    } finally {
      setIsSaved(false)
    }
  }

  const removeEmail = async () => {
    setIsSaved(true)
    try {
      await instance.post("/articles/removeemail", { email, enteredEmail })
      setWarning("Unsubscibed successfully.")
      setEnteredEmail("")
      setIsEnteredEmail(false)
    } catch (err) {
      toast.error("❌ Failed to remove email.")
    } finally {
      setIsSaved(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    if (isSidebarOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const team = [
    {
      sector: "Founders",
      members: [
        { name: "Shravan Mutha", role: "Co-Founder", image: "team/Shravan Mutha.jpeg" },
        { name: "Anish Pujari", role: "Co-Founder", image: "team/Anish Pujari.jpg" },
      ]
    },
    {
      sector: "Web Development",
      members: [
        { name: "Aditya Bandral", role: "Full Stack Developer", image: "team/Aditya bandral1.jpg" },
        { name: "Kalp Mehta", role: "Full Stack Developer", image: "team/Kalp Mehta.jpg" },
        { name: "Hea Kapai", role: "Frontend Developer", image: "team/Hea Kapai.jpg" },
        { name: "Bhargav Dabhade", role: "Full Stack Developer", image: "team/Bhargav Dhabade.jpg" },
        { name: "Sumedh Charjan", role: "Full Stack Developer", image: "team/Sumedh Charjan.jpg" },
      ],
    },
    {
      sector: "Content",
      members: [
        { name: "Arya Borker", role: "Content Writer", image: "team/Arya Borkar.jpg" },
        { name: "Vinay Gupta", role: "Content Writer", image: "team/Vinay Gupta.jpg" },
      ],
    },
    {
      sector: "UI/UX",
      members: [
        { name: "Sanika Deshmukh", role: "UI/UX Designer", image: "team/Sanika Deshmukh.jpg" },
        { name: "Snehal Hajare", role: "UI/UX Designer", image: "team/Snehal Hajare.jpeg" },
      ],
    },
    {
      sector: "Graphics",
      members: [
        { name: "Ishwari Moroney", role: "Graphic Designer", image: "team/Ishwari Moroney.jpg" },
        { name: "Janhavi vaidya", role: "Graphic Designer", image: "team/Janhavi Vaidya.jpg" },
        { name: "Parth Agrawal", role: "Graphic Designer", image: "team/Parth Agrawal.jpg" },
      ],
    },
    {
      sector: "Marketing",
      members: [
        { name: "Atharva Patil", role: "Marketing Lead", image: "team/Atharva patil.jpg" },
        { name: "Prathamesh Naik", role: "Marketing Lead", image: "team/Prathamesh Naik.jpg" },
      ],
    },
  ];

  return (
    <div className="bg-gray-100 pb-5 h-full w-full flex flex-col">

      <Navbar />

      <div className="max-w-5xl text-base sm:text-lg self-center px-4 py-5 sm:px-0 sm:py-10 space-y-10" >
        {/* About Us Section */}
        <section className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">About Us</h1>
            <p>
              A free, bite-sized financial education platform built for India’s youth — because understanding
              money should be simple and accessible for everyone.
            </p>
          </div>
          <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
            {/* Replace this with your actual logo */}
            <img src="/logo.png" />
          </div>
        </section>

        {/* Who We Are */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Who We Are</h2>
          <p>
            At FinEd, we believe that understanding money is a basic life skill — not a luxury. We’re building
            a platform that makes financial literacy easy, engaging, and free for everyone.
          </p>
          <p>
            From bite-sized lessons and practical tools to tailored financial schemes and insightful articles,
            everything is designed to help you cut through the noise and build real financial awareness—at your
            own pace.
          </p>
        </section>

        {/* Why We Started */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Why We Started</h2>
          <p>
            Most of us grow up without ever being taught how to manage money. Schools don’t cover it, financial
            products are confusing, and the internet is full of myths.
          </p>
          <p>
            This lack of clarity holds people back — leading to poor decisions, debt, and missed opportunities.
            FinEd was created to change that.
          </p>
        </section>

        {/* What We're Building */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">What We’re Building</h2>
          <p>
            We’re building more than just a learning platform. FinEd is designed to be your personal financial
            growth companion.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>✅ Byte-sized, easy-to-understand courses</li>
            <li>✅ Smart tools to help you budget, save, and invest — with more coming soon</li>
            <li>✅ Personalized financial schemes based on your needs — not generic suggestions</li>
            <li>✅ Progress tracking so you always know how far you've come in your financial journey</li>
          </ul>
        </section>

        {/* Our Vision */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Our Vision</h2>
          <p>
            We envision a future where every Indian — no matter their background — can understand, manage, and
            grow their money confidently.
          </p>
          <p>
            With FinEd, financial literacy becomes not just accessible, but something you actually enjoy
            learning.
          </p>
        </section>

        {/* For Financial Institutions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">For Financial Institutions</h2>
          <p>
            FinEd is also a powerful partner for financial institutions. We help banks, NBFCs, and credit
            unions to educate their users, build trust, and drive smarter product adoption by:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Offering customized literacy courses</li>
            <li>Bridging product awareness gaps</li>
            <li>Providing user insights for better targeting</li>
          </ul>
        </section>

        {/* Mascot */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">A Friendly Face: Meet Finix</h2>
          <p>
            Our mascot, Finix, adds a friendly face to your learning journey. While finance is serious
            business, learning it doesn’t have to be dull.
          </p>
          <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
            {/* Replace this with actual mascot image */}
            <img src="/mascot.jpg" />
          </div>
        </section>

        {/* Meet the Team Section */}
        <TeamSection team={team} />

      </div>

      <Footer />

    </div>
  );
};

export default AboutUs;
