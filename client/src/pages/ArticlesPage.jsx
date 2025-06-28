import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const ArticlesPage = () => {
  const scrollLeft = () => {
    document.querySelector('.carousel-track').scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = () => {
    document.querySelector('.carousel-track').scrollBy({ left: 320, behavior: 'smooth' });
  };

  const navigate = useNavigate();
  const location = useLocation(); 

  return (
    <div className="mx-auto p-5 bg-gray-50 font-inter text-[#1e1e1e]">

      <header className="flex justify-between items-center h-[63px] px-12 py-6 bg-gray-50 shadow-sm box-border">
      
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
        </nav>

        <div className="bg-white rounded-full p-3 shadow-md">
          <img src="bell.png" alt="Bell Icon" width="24" />
        </div>
      </header>

    
  <div class="grid grid-cols-1 items-start p-10 lg:grid-cols-2 gap-10">
  
    <div class="bg-white rounded-3xl overflow-hidden shadow-md">
      <div class="relative">
        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c" alt="Architecture" class="w-full h-96 object-cover" />
        <span class="absolute top-4 left-4 bg-white text-sm px-3 py-1 rounded-full font-semibold shadow">Featured</span>
      </div>
      <div class="p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">For the Architecture & Interiors</h2>
        <p class="text-gray-600 mb-4 text-sm">In my opinion, Ui/Ux design is the foundation of a product, its face and soul. You can create an infinitely high-quality heart...</p>
        <p class="text-xs text-gray-400">Apr 8, 2023</p>
      </div>
    </div>

  
    <div class="flex flex-col gap-8">
   
<div class="flex justify-end items-center space-x-2 mb-4">
     <button className="border-none w-10 h-10 rounded-full text-lg cursor-pointer flex items-center justify-center bg-white text-amber-400 border border-amber-400" onClick={scrollLeft}>❮</button>
     <button className="border-none w-10 h-10 rounded-full text-lg cursor-pointer flex items-center justify-center bg-amber-400 text-white" onClick={scrollRight}>❯</button>
</div>

      <div class="flex gap-6 items-start ">
        <img src="pink.png" alt="Pink Stairs" class="w-33 h-32 object-cover rounded-lg" />
        <div>
          <p class="text-xs text-gray-400 mb-1">Apr 8, 2023</p>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">Pink stairs leading to the sky</h3>
          <p class="text-sm text-gray-600">In my opinion, Ui/Ux design is the foundation of a product, its face and soul...</p>
        </div>
      </div>

      <div class="flex gap-6 items-start">
        <img src="building.png" alt="Corner Building" class="w-33 h-32 object-cover rounded-lg" />
        <div>
          <p class="text-xs text-gray-400 mb-1">Apr 8, 2023</p>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">Building on the corner of the sea</h3>
          <p class="text-sm text-gray-600">Cognitive bias (also known as cognitive illusion) refers to errors in thinking...</p>
        </div>
      </div>

   
      <div class="flex gap-6 items-start">
        <img src="food.png" alt="Breakfast" class="w-33 h-32 object-cover rounded-lg" />
        <div>
          <p class="text-xs text-gray-400 mb-1">Apr 8, 2023</p>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">The color of the sun for breakfast</h3>
          <p class="text-sm text-gray-600">As is commonly believed, this methodology places the user at the center of...</p>
        </div>
      </div>
    </div>
  </div>

<div class="bg-gray-50 px-8 py-12">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
    

    <div>
      <img src="user.png" alt="User-centered Design" class="rounded-2xl w-full h-72 object-cover mb-6" />
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">User-centered design — a brief guide</h2>
      <div class="flex items-center text-sm text-gray-500 mb-4">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Apr 8, 2023
      </div>
      <p class="text-gray-600 text-sm leading-relaxed mb-4">
        As is commonly believed, this methodology places the user at the center of the world and focuses on their views and habits. In fact, the product’s actual growth revolves around the persona for which the system is built.
      </p>
      <p class="text-gray-600 text-sm leading-relaxed">
        The main difference is in the habits and atmosphere in which the user is accustomed to “brewing”; we do not try to restrict the user to achieve goals. Goals are achieved naturally, often not allowing for qualitative identification of opportunities and direct needs […]
      </p>
    </div>

    
    <div class="flex flex-col gap-10">
  
      <div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Design Process for Beginners</h3>
        <div class="flex items-center text-sm text-gray-500 mb-4">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Apr 8, 2023
        </div>
        <p class="text-gray-600 text-sm leading-relaxed mb-4">
          In my opinion, Ui/Ux design is the foundation of a product, its face and soul. You can create an infinitely high-quality heart, and organize the simulation of breathing, but we won’t fall in love with a product just because its heart beats in an interesting rhythm or smells like mint.
        </p>
        <p class="text-gray-600 text-sm leading-relaxed">
          Most of the information we perceive is through our eyes, which means that we see first and then think. Therefore, we must understand how to attract attention and process it in a way that the user performs the necessary actions […]
        </p>
      </div>

  
      <div>
        <img src="design.png" alt="Minimal Blocks" class="rounded-2xl w-full h-64 object-cover" />
      </div>
    </div>
  </div>
</div>

<div class="bg-gray-50 px-8 py-12">
  <div class="flex justify-between items-center mb-8">
    <h2 class="text-3xl font-semibold text-gray-900">Explore More</h2>
    <div class="flex gap-3">
     <button className="border-none w-10 h-10 rounded-full text-lg cursor-pointer flex items-center justify-center bg-white text-amber-400 border border-amber-400" onClick={scrollLeft}>❮</button>
     <button className="border-none w-10 h-10 rounded-full text-lg cursor-pointer flex items-center justify-center bg-amber-400 text-white" onClick={scrollRight}>❯</button>
    </div>
  </div>


  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

    <div class="flex gap-5">
      <img src="pink.png" alt="Article" class="w-33 h-32 rounded-md object-cover" />
      <div>
        <p class="text-sm text-gray-500 mb-1">Apr 8, 2023</p>
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Pink stairs leading to the sky</h3>
        <p class="text-sm text-gray-600">
          In my opinion, Ui/Ux design is the foundation of a product, its face and soul. You can create an infinitely high-quality heart...
        </p>
      </div>
    </div>

    
    <div class="flex gap-5">
      <img src="pink.png" alt="Article" class="w-33 h-32 rounded-md object-cover" />
      <div>
        <p class="text-sm text-gray-500 mb-1">Apr 8, 2023</p>
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Building on the corner of the sea</h3>
        <p class="text-sm text-gray-600">
          Cognitive bias refers to errors in thinking that can lead to incorrect perception and decision-making.
        </p>
      </div>
    </div>


    <div class="flex gap-5">
      <img src="building.png" alt="Article" class="w-33 h-32 rounded-md object-cover" />
      <div>
        <p class="text-sm text-gray-500 mb-1">Apr 8, 2023</p>
        <h3 class="text-lg font-semibold text-gray-900 mb-1">The color of the sun for breakfast</h3>
        <p class="text-sm text-gray-600">
          This methodology places the user at the center and focuses on their habits. The product’s growth revolves around the user.
        </p>
      </div>
    </div>

    
    <div class="flex gap-5">
      <img src="building.png" alt="Article" class="w-33 h-32 rounded-md object-cover" />
      <div>
        <p class="text-sm text-gray-500 mb-1">Apr 8, 2023</p>
        <h3 class="text-lg font-semibold text-gray-900 mb-1">The color of the sun for breakfast</h3>
        <p class="text-sm text-gray-600">
          This methodology places the user at the center and focuses on their habits. The product’s growth revolves around the user.
        </p>
      </div>
    </div>
        <div class="flex gap-5">
      <img src="food.png" alt="Article" class="w-33 h-32 rounded-md object-cover" />
      <div>
        <p class="text-sm text-gray-500 mb-1">Apr 8, 2023</p>
        <h3 class="text-lg font-semibold text-gray-900 mb-1">The color of the sun for breakfast</h3>
        <p class="text-sm text-gray-600">
          This methodology places the user at the center and focuses on their habits. The product’s growth revolves around the user.
        </p>
      </div>
    </div>
        <div class="flex gap-5">
      <img src="food.png" alt="Article" class="w-33 h-32 rounded-md object-cover" />
      <div>
        <p class="text-sm text-gray-500 mb-1">Apr 8, 2023</p>
        <h3 class="text-lg font-semibold text-gray-900 mb-1">The color of the sun for breakfast</h3>
        <p class="text-sm text-gray-600">
          This methodology places the user at the center and focuses on their habits. The product’s growth revolves around the user.
        </p>
      </div>
    </div>

  </div>
</div>

      <footer className="bg-[#f7fafc] py-10 px-6 md:px-12 flex flex-wrap justify-between text-[#333] font-sans">
    
        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] flex flex-col items-center md:items-start">
          <img src="/logo.jpg" alt="FinEd Logo" className="h-[50px] mb-3" />
          <p className="text-base text-gray-700 mb-4 text-center md:text-left">Financial Education made Easy.</p>
          <div className="flex gap-4"> 
            <a href="https://linkedin.com"><img src="/linkedin.png" alt="LinkedIn" className="w-8 h-8 transition-transform duration-200 hover:scale-110 cursor-pointer" /></a>
            <a href="https://instagram.com"><img src="/insta.jpg" alt="Instagram" className="w-8 h-8 transition-transform duration-200 hover:scale-110 cursor-pointer" /></a>
          </div>
        </div>
        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] text-center md:text-left">
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">FEATURED</h4>
          <Link to="/courses" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Courses</Link>
          <Link to="/articles" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Articles</Link>
          <Link to="/tools" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">FinTools</Link>
          <Link to="/about" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">About Us</Link>
        </div>
        <div className="flex-1 basis-full md:basis-[200px] m-5 min-w-[200px] text-center md:text-left">
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">OTHER</h4>
          <Link to="/leaderboard" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Leaderboard</Link>
          <Link to="/rewards" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Rewards</Link>
          <Link to="/contact" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Contact Us</Link>
          <Link to="/feedback" className="block mb-3 text-base text-gray-800 no-underline transition-colors duration-300 hover:text-blue-600">Feedback</Link>
        </div>
          <div className="newsletter">
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-4">NEWSLETTER</h4>
          <input type="email" placeholder="Enter your email address" className="p-3 w-full mb-3 border border-gray-200 rounded-md text-sm box-border" />
          <button className="p-3 w-full bg-[#fbbf24] text-white font-semibold border-none rounded-md cursor-pointer transition-colors hover:bg-[#e6b640] box-border">
            Subscribe Now
          </button>
        </div>
      </footer>

      <div className="text-center py-4 text-sm text-gray-500 bg-[#f9fafb] border-t border-gray-200">© 2025 FinEd. All Rights Reserved.</div>
    </div>
  );
};

export default ArticlesPage;