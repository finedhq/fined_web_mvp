
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage'; 
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import ArticlesPage from './pages/ArticlesPage';
// import FinToolsPage from './pages/FinToolsPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import Course from './pages/CoursePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} /> 
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
           {/* <Route path="/fintools" element={<FinToolsPage />} />   */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/course" element={<Course />} />
      </Routes>
    </Router>
  );
}

export default App;