
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage'; 
import HomePage from './pages/HomePage';
// import CoursePage from './pages/CoursePage';
// import ArticlesPage from './pages/ArticlesPage';
// import FinToolsPage from './pages/FinToolsPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} /> 
        {/* <Route path="/courses" element={<CoursePage />} />
        <Route path="/articles" element={<ArticlesPage />} />
           <Route path="/fintools" element={<FinToolsPage />} />   */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </Router>
  );
}

export default App;