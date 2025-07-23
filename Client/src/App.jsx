import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
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
import ExpenseTracker from './components/ExpenseTracker.jsx'
import NewsLetter from './pages/AdminDashboard/AdminNewsletter.jsx';
import CoursesHomePage from './pages/CoursesPage.jsx';
import FinToolsPage from './pages/FinToolsPage.jsx';

import { Toaster } from 'react-hot-toast';
import Notifications from './pages/Notifications.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import AboutUs from './pages/AboutUsPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import ContactUs from './pages/ContactUsPage.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import PoliciesPage from './pages/PoliciesPage.jsx';

import ProductList from './schemes/Sbisavings.jsx';
import FDList from './schemes/SBiFd.jsx';
import TaxSaverFDList from './schemes/SBITaxSaverFD.jsx';
import RDList from './schemes/SBIRD.jsx';
import PPFList from './schemes/SBIPPF.jsx';
import NPSList from './schemes/SBINPS.JSX';
import UnnatiCardList from './schemes/SBIUnnatiCard.jsx';
import KotakProductList from './schemes/Kotaksavings.jsx';
import SimplySaveCardList from './schemes/SBISimplySave.jsx';
import HDFCSavings from './schemes/HDFCSavings.jsx';
import HDFCDigiSavings from './schemes/DigiSaveHDFC.jsx';
import HDFCMaxSavings from './schemes/MaxSaveHDFC.jsx';
import HDFCFD from './schemes/FDHDFC.jsx';
import ICICISavings from './schemes/ICICISavings.jsx';
import ICICIBasicSavings from './schemes/BasicSavingsICICI.jsx';
import ICICIYoungSavings from './schemes/YoungStars.jsx';
import ICICIFD from './schemes/ICICIFD.jsx';
import ICICIRD from './schemes/ICICIRD.JSX';
import HDFCRD from './schemes/HDFCRD.jsx';
import KotakAce from './schemes/KotakAce.jsx';
import HDFCMoney from './schemes/HDFCMoney.jsx';

function ScrollToTop() {
  let { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const App = () => {

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <ScrollToTop />
      <Routes>

        {/* ADMIN ROUTES!~! */}
        <Route path='/admin' element={<AdminHome></AdminHome>}></Route>
        <Route path='/admin/newsletters' element={<NewsLetter />} ></Route>
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
        <Route path="/policies" element={<PoliciesPage />} />
        <Route path="/courses" element={<CoursesHomePage />} />
        <Route path="/courses/course/:course_id" element={<CourseOverviewPage />} />
        <Route path="/courses/course/:courseId/module/:moduleId/card/:cardId" element={<ModuleContentPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/fin-tools" element={<FinToolsPage />} />
        <Route path="/fin-tools/expensetracker" element={<ExpenseTracker />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/termsofservice" element={<TermsOfService />} />

        <Route path="/fd" element={<FDList />} />
        <Route path="/ll" element={<ProductList />} />
        <Route path="/taxsaverfd" element={<TaxSaverFDList />} />
        <Route path="/rd" element={<RDList />} />
        <Route path="/ppf" element={<PPFList />} />
        <Route path="/nps" element={<NPSList />} />
        <Route path="/unnaticard" element={<UnnatiCardList />} />
        <Route path="/simplysave" element={<SimplySaveCardList />} />
        <Route path="/kotaksavings" element={<KotakProductList />} />
        <Route path="/hdfcsavings" element={<HDFCSavings />} />
        <Route path="/hdfcdigisavings" element={<HDFCDigiSavings />} />
        <Route path="/hdfcmaxsavings" element={<HDFCMaxSavings />} />
        <Route path="/hdfcfd" element={<HDFCFD />} />
        <Route path="/icicisavings" element={<ICICISavings />} />
        <Route path="/icicibasicsavings" element={<ICICIBasicSavings />} />
        <Route path="/iciciyoungsavings" element={<ICICIYoungSavings />} />
        <Route path="/icicifd" element={<ICICIFD />} />
        <Route path="/icicird" element={<ICICIRD />} />
                  <Route path="/hdfcrd" element={<HDFCRD/>} />
          <Route path="/kotakace" element={<KotakAce/>} />
          <Route path="/moneyback" element={<HDFCMoney/>} />

        <Route path='*' element={<NotFoundPage />} />

      </Routes>
    </>
  )
}

export default App
