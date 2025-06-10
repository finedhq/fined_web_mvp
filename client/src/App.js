import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import CourseOverviewPage from './pages/CourseOverviewPage';
import ModuleContentPage from './pages/ModuleContentPage';
import ArticlesPage from './pages/ArticlesPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/course/:id" element={<CourseOverviewPage />} />
        <Route path="/course/:courseId/module/:moduleId" element={<ModuleContentPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </>
  );
}

export default App;
