import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css'; 


export default function LandingPage() {
  return (
    <div className="landing">
      <header className="header">
        <div className="logo">
          <img src="/logo.jpg" alt="FinEd logo" />
        </div>
        <nav className="nav">
      <Link to="/courses">Courses</Link>
      <Link to="/articles">Articles</Link>
      <Link to="/about">About Us</Link>

          <Link to="/signin">Sign in</Link>
          <Link to="/signup" className="cta">Create free account</Link>
        </nav>
      </header>

      <main className="hero">
        <div className="hero-text">
          <h1>Take Control of Your Financial Future—For Free</h1>
          <p>
            FinEd simplifies finance with bite-sized, engaging courses designed to help you save more, invest smarter and take control of your money - all for free!
          </p>
        </div>
        <div className="hero-image">
          <img src="/dashboard.png" alt="Code preview" />
        </div>
      </main>

      <section className="cta-section">
        <h2>Jump into your first course</h2>
        <p>no sign-in, no hassle. Start learning about money in just one click.</p>
        <Link to="/course/1" className="cta-button">Give It a Go →</Link>
      </section>

      
<div class="section">
    <div class="text-block">
      <h2>Small Lessons. Big Impact.</h2>
      <ul>
        <li>Step-by-step roadmaps to guide your journey</li>
        <li>Quizzes that reinforce learning, not test memory</li>
        <li>Real-life examples to make concepts stick</li>
        <li>Zero jargon—just clear, practical explanations</li>
      </ul>
      <p>Perfect for busy minds with big goals.</p>
    </div>
    <div class="image-block">
      <img src="dashboard.png" alt="Dashboard preview 1" />
    </div>
  </div>

 
  <div class="section">
    <div class="image-block">
      <img src="dashboard.png" alt="Dashboard preview 2" />
    </div>
    <div class="text-block">
      <h2>Knowledge Pays—Literally.</h2>
      <ul>
        <li>Collect FinStars as you complete lessons and quizzes</li>
        <li>Climb the leaderboard and track your progress</li>
        <li>Unlock real rewards—from gift cards to exclusive perks</li>
      </ul>
      <p>
        Learn smart, earn smarter with our rewards system.<br />
        Because learning finance should feel as rewarding as it is impactful.
      </p>
    </div>
  </div>



<section class="courses-section">
  <div class="section-header">
    <h2>Explore Courses</h2>
    <a href="/courses" class="view-more">View More →</a>
  </div>

  <div class="course-cards">
    <div class="course-card">
      <div class="card-header">
        <h3>Stock Market Basics</h3>
        <img src="stock.png" alt="Stock Market" />
      </div>
      <div class="card-footer">
        <p>5 modules • 25 mins</p>
      </div>
    </div>

    <div class="course-card">
      <div class="card-header">
        <h3>Investing 101</h3>
        <img src="stock.png" alt="Investing" />
      </div>
      <div class="card-footer">
        <p>6 modules • 30 mins</p>
      </div>
    </div>

    <div class="course-card">
      <div class="card-header">
        <h3>Mutual Funds</h3>
        <img src="stock.png" alt="Mutual Funds" />
      </div>
      <div class="card-footer">
        <p>4 modules • 20 mins</p>
      </div>
    </div>

    <div class="course-card">
      <div class="card-header">
        <h3>Crypto Explained</h3>
        <img src="stock.png" alt="Crypto" />
      </div>
      <div class="card-footer">
        <p>5 modules • 22 mins</p>
      </div>
    </div>
  </div>

  <div class="wave">
    <svg viewBox="0 0 500 150" preserveAspectRatio="none">
      <path class="shape-fill" d="M0.00,49.98 C150.00,150.00 349.90,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"></path>
    </svg>
  </div>
</section>

<section class="articles-section">
  <div class="section-header">
    <h2>Articles</h2>
    <a href="/articles" class="view-more dark">View More →</a>
  </div>

  <div class="cards-container">
    <div class="card">
      <div class="card-header">
        <strong>Stock Market Basics</strong>
        <img src="stock.png" alt="Stock Market Basics" />
      </div>
      <div class="card-footer">
        <p>5 modules • 25 mins</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <strong>Finance Tips</strong>
        <img src="stock.png" alt="Finance Tips" />
      </div>
      <div class="card-footer">
        <p>3 modules • 15 mins</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <strong>Invest Smart</strong>
        <img src="stock.png" alt="Invest Smart" />
      </div>
      <div class="card-footer">
        <p>6 modules • 30 mins</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <strong>Crypto Crash Course</strong>
        <img src="stock.png" alt="Crypto Crash Course" />
      </div>
      <div class="card-footer">
        <p>4 modules • 20 mins</p>
      </div>
    </div>
  </div>
</section>


         <footer className="footer">
        <div className="column">
          <img src="/logo.jpg" alt="FinEd Logo" width="50" />
          <p>Financial Education made Easy.</p>
          <div className="social-icons">
            <a href="https://linkedin.com"><img src="/linkedin.png" alt="LinkedIn" width="30" /></a>
            <a href="https://instagram.com"><img src="/insta.jpg" alt="Instagram" width="30" /></a>
          </div>
        </div>
        <div className="column">
          <h4>FEATURED</h4>
          <Link to="/courses">Courses</Link>
          <Link to="/articles">Articles</Link>
          <Link to="/tools">FinTools</Link>
          <Link to="/about">About Us</Link>
        </div>
        <div className="column">
          <h4>OTHER</h4>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/rewards">Rewards</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/feedback">Feedback</Link>
        </div>
        <div className="column newsletter">
          <h4>NEWSLETTER</h4>
          <input type="email" placeholder="Enter your email address" />
          <button>Subscribe Now</button>
        </div>
      </footer>

     <div class="copyright">© 2025 FinEd. All Rights Reserved.</div>
    </div>
  );
}