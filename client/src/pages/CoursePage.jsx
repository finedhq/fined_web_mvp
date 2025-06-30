import React from "react";
import { useNavigate } from "react-router-dom";

const mockData = [
  {
    moduleTitle: "The Importance of financial literacy",
    lessons: [
      { title: "Say Hi to Finix", status: "completed" },
      { title: "10K drop! What's the move?", status: "locked" },
      { title: "What even is financial literacy?", status: "incompleted" },
      { title: "Same Salary, Different Drama", status: "incompleted" },
      { title: "Fun Now, Freedom Later?", status: "incompleted" },
    ],
  },
  {
    moduleTitle: "Let's Talk about Income",
    lessons: [
      { title: "Where's Your Money Coming From?", status: "locked" },
      { title: "Work Hard - Get Paid", status: "locked" },
      { title: "More Streams, More Dreams", status: "locked" },
    ],
  },
  {
    moduleTitle: "Let's Talk about Income",
    lessons: [
      { title: "Where's Your Money Coming From?", status: "locked" },
      { title: "Work Hard - Get Paid", status: "locked" },
      { title: "More Streams, More Dreams", status: "locked" },
    ]
  },
];

const imageAssets = {
  completed: "/FcomplitedModule.png",
  incompleted: "/FincompletedModule.png",
  locked: "/Fempty.png",
  pathLeftToRight: "/FpathLtoR.png",
  pathRightToLeft: "/FpathRtoL.png",
};

export default function CoursePath() {
  const navigate = useNavigate();

  return (
    
    <div>

{/* Top Navbar */}
<div className="w-full bg-white fixed top-0 left-0 z-50">
  <div className="max-w-7xl mx-auto px-4 py-3 flex items-start">
    <img
      src="../../public/logo.jpg" // Replace with your actual path
      alt="FinEd Logo"
      className="h-16 w-auto" // Increased logo size
    />
  </div>
</div>

<div className="pt-24 p-4 bg-white min-h-screen">

      {/* Header */}
      <div className="bg-purple-800 text-white rounded-2xl overflow-hidden mb-6 w-full max-w-3xl mx-auto">
        <div className="flex items-center px-4 py-3 border-b border-white/40">
          <button onClick={() => navigate('/courses')} className="text-xl mr-4">←</button>
          <h2 className="text-lg font-semibold">Money Basics : Building Financial Confidence</h2>
        </div>
        <div className="px-4 py-2">
          <div className="font-semibold">Module 1</div>
          <div className="text-m">{mockData[0].moduleTitle}</div>
        </div>
      </div>

      {mockData.map((module, index) => (
        <div key={index} className="mb-20 mx-auto max-w-3xl">
          {index !== 0 && (
            <div className="bg-purple-800 text-white px-4 py-2 rounded-2xl font-medium text-left w-full">
              <div className="font-semibold">Module {index + 1}</div>
              <div className="text-sm font-normal">{module.moduleTitle}</div>
            </div>
          )}

          <div className="relative mt-10 flex flex-col items-center gap-14">
            {module.lessons.map((lesson, i) => (
              <div key={i} className={`relative w-full flex ${i % 2 === 0 ? "justify-start pl-20" : "justify-end pr-20"}`}>
                <div className={`flex flex-col items-center w-28 ${i % 2 === 0 ? 'ml-[120px]' : 'mr-[110px]' }`}>
                  <button
                  onClick={() => navigate('/lesson')}
                  className="transition-transform duration-200 hover:scale-110 focus:scale-90"
                  >
                  <img
                    src={imageAssets[
                      lesson.status === "completed"
                      ? "completed"
                      : lesson.status === "incompleted"
                      ? "incompleted"
                      : "locked"
                    ]}
                    alt="status icon"
                    className="w-16 h-16 object-contain"
                    />
                </button>


                  <span className="text-center text-s mt-2 whitespace-nowrap overflow-hidden text-ellipsis">

                    {lesson.title}
                  </span>
                </div>

                {i !== module.lessons.length - 1 && (
                  <img
                  src={i % 2 === 0 ? imageAssets.pathLeftToRight : imageAssets.pathRightToLeft}
                    alt="path"
                    className="absolute   mt-12 top-12 left-1/2 transform -translate-x-1/2 w-60"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
      </div>
  );
}
