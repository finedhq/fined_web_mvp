import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { RxCross2 } from "react-icons/rx"
import instance from "../lib/axios"
import { useAuth0 } from '@auth0/auth0-react'
import toast from 'react-hot-toast'

const ModuleContentPage = () => {

  const navigate = useNavigate()

  const { user, isLoading, isAuthenticated, logout } = useAuth0()
  const [role, setrole] = useState("")

  const [email, setEmail] = useState("")
  const { courseId, moduleId, cardId } = useParams()
  const [card, setCard] = useState({})
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [disabled, setDisabled] = useState(false)
  const [prevCardId, setPrevCardId] = useState(null)
  const [nextCardId, setNextCardId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progressPercent, setProgressPercent] = useState(0)
  const [warning, setWarning] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/")
    } else if (!isLoading && isAuthenticated) {
      setEmail(user?.email)
      const roles = user?.["https://fined.com/roles"]
      setrole(roles?.[0] || "")
    }
  }, [isLoading, isAuthenticated])

  async function fetchCard() {
    try {
      const res = await instance.post(`/courses/course/${courseId}/module/${moduleId}/card/${cardId}`, { email })
      const fetchedCard = res.data
      console.log(fetchedCard)
      setCard(fetchedCard)
      setPrevCardId(fetchedCard.prevCardId)
      setNextCardId(fetchedCard.nextCardId)
      if (fetchedCard.module_progress && fetchedCard.module_total_cards) {
        const percent = Math.round((fetchedCard.module_progress / fetchedCard.module_total_cards) * 100)
        setProgressPercent(percent)
      }
      if (
        fetchedCard.content_type === "question" &&
        fetchedCard.status === "completed" &&
        fetchedCard.userAnswer
      ) {
        const selectedIdx = fetchedCard.options.findIndex(opt => opt === fetchedCard.userAnswer)
        setSelectedIndex(selectedIdx)
        setDisabled(true)
      }
    } catch (err) {
      setWarning("Failed to load course card.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!email) return
    setLoading(true)
    setCard({})
    setSelectedIndex(null)
    setDisabled(false)
    fetchCard()
  }, [cardId, email])

  async function markCompleted(userAnswer = null, userIndex = null) {
    try {
      let finStarsToAward = 0
      if (card.content_type === "question") {
        const isCorrect = userAnswer === card.correct_answer
        if (isCorrect) {
          finStarsToAward = card.allotted_finstars || 0
        }
      } else {
        finStarsToAward = card.allotted_finstars || 0
      }
      const res = await instance.post(`/courses/course/${courseId}/module/${moduleId}/card/${cardId}/updateCard`, { status: "completed", userAnswer, finStars: finStarsToAward, email, userIndex })
      console.log(res.data)
      setCard(res?.data)
      if (res.data?.module_progress && res.data?.module_total_cards) {
        const percent = Math.round((res.data.module_progress / res.data.module_total_cards) * 100)
        setProgressPercent(percent)
      }
      if (finStarsToAward > 0) {
        toast.success(`🎉 You earned ${finStarsToAward} FinStars!`)
      }
    } catch (err) {
      setWarning("Failed to update course card.")
    }
  }

  useEffect(() => {
    if (!card?.content_type || !card?.card_id) return
    if (card.content_type === "question") return
    if (card.status !== "completed") {
      markCompleted(null)
    }
  }, [card?.card_id, email])

  async function checkIsCorrect(index) {
    if (disabled) return

    setSelectedIndex(index)
    const selectedOption = card.options[index]
    setDisabled(true)
    await markCompleted(selectedOption, index)
  }

  return (
    <div className="max-w-3xl min-h-screen mx-auto bg-white p-8 rounded-lg shadow-md">
      {loading ?
        <div className="flex flex-col gap-8 items-center mt-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="w-[90%] h-10 bg-gray-300 rounded-lg animate-pulse" />
          ))}
        </div>
        :
        card?.content_type === "text" || card?.content_type === "image" ? (
          <div>
            <div className='flex items-center gap-4 mb-6' >
              <RxCross2 onClick={() => navigate(`/courses/course/${courseId}`)} className='text-2xl cursor-pointer' />
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-2 bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1 text-right whitespace-nowrap">
                {card?.module_progress}/{card?.module_total_cards} cards
              </p>
            </div>
            <div className="w-full min-h-[75vh]">
              {card.image_url &&
                <img
                  src={card.image_url}
                  alt="image"
                  className="float-left h-48 w-48 object-cover mr-8"
                />
              }
              <h1 className="text-2xl font-bold mb-4">{card.title}</h1>
              <p className='text-justify' >{card.content_text}</p>
            </div>
            <div className="flex justify-between mt-8">
              {prevCardId ? (
                <button
                  onClick={() =>
                    navigate(`/courses/course/${courseId}/module/${moduleId}/card/${prevCardId}`)
                  }
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-full flex items-center gap-2 cursor-pointer"
                >
                  <FaArrowLeft /> Previous
                </button>
              ) : (
                <div />
              )}
              {nextCardId ? (
                card.status === "completed" ? (
                  <button
                    onClick={() =>
                      navigate(`/courses/course/${courseId}/module/${moduleId}/card/${nextCardId}`)
                    }
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-full flex items-center gap-2 cursor-pointer"
                  >
                    Next <FaArrowRight />
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-300 text-gray-500 px-6 py-2 rounded-full flex items-center gap-2 cursor-not-allowed"
                    title="Complete this card to unlock the next"
                  >
                    Next <FaArrowRight />
                  </button>
                )
              ) : (
                <div />
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className='flex items-center gap-4 mb-6' >
              <RxCross2 onClick={() => navigate(`/courses/course/${courseId}`)} className='text-2xl cursor-pointer' />
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-2 bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1 text-right whitespace-nowrap">
                {card?.module_progress}/{card?.module_total_cards} cards
              </p>

            </div>
            <h1 className="text-2xl font-bold mb-4">{card?.content_title}</h1>
            <p className='text-lg font-semibold mt-16'>Q. {card?.content_text}</p>

            <div className='flex flex-col gap-6 justify-between items-center my-16'>
              {card?.options?.map((option, index) => {
                const isSelected = selectedIndex === index
                const isCorrectAnswer = option === card.correct_answer

                let optionClass = 'bg-gray-200 hover:bg-gray-400'
                if (disabled) {
                  if (isSelected && isCorrectAnswer) optionClass = 'bg-green-400'
                  else if (isSelected && !isCorrectAnswer) optionClass = 'bg-red-400'
                  else if (isCorrectAnswer) optionClass = 'bg-green-300'
                  else optionClass = 'bg-gray-200 opacity-50'
                }

                return (
                  <div
                    key={index}
                    onClick={() => checkIsCorrect(index)}
                    className={`w-2/3 flex justify-between items-center transition-all duration-200 px-4 py-2 cursor-pointer rounded-lg ${optionClass}`}
                  >
                    <p className='rounded-full bg-gray-300 px-3 py-1'>
                      {String.fromCharCode(65 + index)}
                    </p>
                    <p>{option}</p>
                    <p className='px-4'></p>
                  </div>
                )
              })}
            </div>

            {disabled && (
              <div className='bg-gray-100 p-4 rounded-xl my-4 text-lg text-center font-medium'>
                Correct Answer: <span className="font-bold">{card?.correct_answer}</span>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {prevCardId ? (
                <button
                  onClick={() =>
                    navigate(`/courses/course/${courseId}/module/${moduleId}/card/${prevCardId}`)
                  }
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-full flex items-center gap-2 cursor-pointer"
                >
                  <FaArrowLeft /> Previous
                </button>
              ) : (
                <div />
              )}
              {nextCardId ? (
                card?.status === "completed" ? (
                  <button
                    onClick={() =>
                      navigate(`/courses/course/${courseId}/module/${moduleId}/card/${nextCardId}`)
                    }
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-full flex items-center gap-2 cursor-pointer"
                  >
                    Next <FaArrowRight />
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-300 text-gray-500 px-6 py-2 rounded-full flex items-center gap-2 cursor-not-allowed"
                    title="Complete this card to unlock the next"
                  >
                    Next <FaArrowRight />
                  </button>
                )
              ) : (
                <div />
              )}
            </div>
          </div>
        )}
      {warning && (
        <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] space-y-4">
            <p className="text-xl font-bold text-red-600">⚠️ Alert</p>
            <p className="text-md font-semibold text-gray-700">
              {warning}
            </p>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => { setWarning(false); navigate("/courses") }}
                className="bg-amber-400 hover:bg-amber-500 transition-all duration-200 text-white px-4 py-2 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleContentPage;
