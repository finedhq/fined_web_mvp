import React from 'react'
import { Routes, Route } from 'react-router-dom';
import CoursesPage from './pages/AdminDashboard/CoursesPage.jsx';
import CourseForm from './components/CourseForm.jsx'
import ModulesPage from './pages/AdminDashboard/ModulesPage.jsx';
import ModuleForm from './components/ModuleForm.jsx'
import CardsPage from './pages/AdminDashboard/CardsPage.jsx'
import CardForm from './components/CardForm.jsx'
import AdminHome from './pages/AdminDashboard/AdminHome.jsx';
import ArticleForm from './components/ArticleForm.jsx';
import ArticleList from './pages/AdminDashboard/ArticleList.jsx';
import LandingPage from './pages/LandingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import CourseOverviewPage from './pages/CourseOverviewPage.jsx';
import ModuleContentPage from './pages/ModuleContentPage.jsx';
import ArticlesPage from './pages/ArticlesPage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
const App = () => {
  return (
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
      <Route path="/course/:id" element={<CourseOverviewPage />} />
      <Route path="/course/:courseId/module/:moduleId" element={<ModuleContentPage />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />


    </Routes>

  )
}

export default App
