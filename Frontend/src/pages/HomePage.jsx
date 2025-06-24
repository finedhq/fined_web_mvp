import React from 'react';
import '../styles/HomePage.css';
import { Link } from 'react-router-dom';

const HomePage = () => {
   const scrollLeft = () => {
    document.querySelector('.carousel-track').scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = () => {
    document.querySelector('.carousel-track').scrollBy({ left: 320, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <header className="homeheader">
        <div className="homelogo">
          <img src="logo.jpg" alt="FinEd Logo" />
        </div>
        <nav className="navhome">
          <button className="active">Home</button>
          <button>Courses</button>
          <button>Articles</button>
          <button>FinTools</button>
        </nav>
        <div className="notification">
          <img src="bell.png" alt="Bell Icon" width="24" />
        </div>
      </header>

      <main className="dashboard">

  <div className="left-column">
    <section className="profile-card">
      <div className="avatar">
        <img src="profile.png" alt="Profile" />
        <img src="edit.png" className="edit-icon" alt="Edit" />
      </div>
      <h3>Kristen Waters</h3>
      <div className="stats">
        <div><img src="star.png" alt="Star" /> 320</div>
        <div><img src="flame.png" alt="Fire" /> 4</div>
        <div><img src="badge.png" alt="Rank" /> 203</div>
      </div>
    </section>

    <section className="horizontal-course-card">
      <img
        src="finance.png"
        alt="Course"
        className="card-thumbnail"
      />
      <div className="card-details">
        <h3>Budgeting and Saving</h3>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
        <button className="continue-btn">
          Continue Learning <span className="arrow-manual">→</span>
        </button>
      </div>
    </section>
  </div>

  <section className="featured-card">
    <div className="home-card-header">
      <h3>Featured</h3>
      <span className="home-view-more">View More →</span>
    </div>
    <div className="featured-content">
      <img src="asylum.png" alt="Featured" />
      <p>Asylum And Extradition: Meaning And Purpose</p>
    </div>
  </section>


  <section className="score-card">
        <div className="score-card-header">
    <h3>FinScore</h3>
      <div className="scoreinfo-icon">i</div>
    </div>
    <div className="score-circle">
      <div className="score">789</div>
    </div>
    <p>Every expert was once a <b>beginner</b>.<br />Keep Going!</p>
  </section>
</main>
    <div className="main-wrapper">
      <div className="recommended-section">
        <div className="section-header">
          <h2>Recommended Courses</h2>
          <div className="top-arrows">
            <button className="arrow-btn white" onClick={scrollLeft}>❮</button>
            <button className="arrow-btn yellow" onClick={scrollRight}>❯</button>
          </div>
        </div>

        <div className="carousel-track">
          {[1, 2, 3].map((_, index) => (
            <div className="home-course-card" key={index}>
              <img
                src="course.png"
                alt="Course"
              />
              <div className="course-meta">
                <span className="course-level">Basic</span>
                <span>5 modules • 25 mins</span>
              </div>
              <h3>Budgeting and saving</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          ))}
        </div>
      </div>

      <div className="tasks-box">
        <div className="tasks-header">
          <h2>Tasks</h2>
          <div className="info-icon">i</div>
        </div>
        <div className="task"><input type="checkbox" /> Add Today’s Expenses</div>
        <div className="task"><input type="checkbox" /> Complete Your Daily Goal</div>
        <div className="task"><input type="checkbox" /> Read Today’s Featured Article</div>
        <div className="task"><input type="checkbox" /> Add Today’s Expenses</div>
      </div>
    </div>
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
        <div className="newsletter">
          <h4>NEWSLETTER</h4>
          <input type="email" placeholder="Enter your email address" />
          <button>Subscribe Now</button>
        </div>
      </footer>

     <div class="copyright">© 2025 FinEd. All Rights Reserved.</div>
    </div>


  );
};

export default HomePage;