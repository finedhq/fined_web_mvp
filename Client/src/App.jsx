
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CoursesPage from './pages/AdminDashboard/CoursesPage.jsx';
import CourseForm from './components/CourseForm.jsx'
import ModulesPage from './pages/AdminDashboard/ModulesPage.jsx';
import ModuleForm from './components/ModuleForm.jsx'
import CardsPage from './pages/AdminDashboard/CardsPage.jsx'
import CardForm from './components/CardForm.jsx'
import AdminHome from './pages/AdminDashboard/AdminHome.jsx';
import ArticleForm from './components/ArticleForm.jsx';
import ArticleList from './pages/AdminDashboard/ArticleList.jsx';

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
        {/* ADMIN ROUTES!~! */}
        <Route path='/admin' element={<AdminHome></AdminHome>}></Route>
        <Route path="/admin/courses" element={<CoursesPage></CoursesPage>} />
        <Route path="/admin/courses/add" element={<CourseForm></CourseForm>} />
        <Route path='/admin/courses/:courseId/modules' element={<ModulesPage></ModulesPage>}></Route>
        <Route path='/admin/courses/:courseId/modules/add' element={<ModuleForm></ModuleForm>}></Route>
        <Route path="/admin/modules/:moduleId/cards" element={<CardsPage></CardsPage>} />
        <Route path="/admin/modules/:moduleId/cards/add" element={<CardForm></CardForm>} />
        <Route path="/admin/articles/add" element={<ArticleForm></ArticleForm>}></Route>
        <Route path="/admin/articles" element={<ArticleList></ArticleList>}></Route>

        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </Router>
  );
}

export default App;