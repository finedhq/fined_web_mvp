import React from 'react'
import { Routes, Route } from 'react-router-dom';
import CoursesPage from './pages/AdminDashboard/CoursesPage.jsx';
import CourseForm from './components/CourseForm.jsx'
import ModulesPage from './pages/AdminDashboard/ModulesPage.jsx';
import ModuleForm from './components/ModuleForm.jsx'
import CardsPage from './pages/AdminDashboard/CardsPage.jsx'
import CardForm from './components/CardForm.jsx'
import AdminHome from './pages/AdminDashboard/AdminHome.jsx';
const App = () => {
  return (
    <Routes>
      <Route path='/admin' element={<AdminHome></AdminHome>}></Route>
      <Route path="/admin/courses" element={<CoursesPage></CoursesPage>} />
      <Route path="/admin/courses/add" element={<CourseForm></CourseForm>} />
      <Route path='/admin/courses/:courseId/modules' element={<ModulesPage></ModulesPage>}></Route>
      <Route path='/admin/courses/:courseId/modules/add' element={<ModuleForm></ModuleForm>}></Route>
      <Route path="/admin/modules/:moduleId/cards" element={<CardsPage></CardsPage>} />
      <Route path="/admin/modules/:moduleId/cards/add" element={<CardForm></CardForm>} />
    </Routes>

  )
}

export default App
