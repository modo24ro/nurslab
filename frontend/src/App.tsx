import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';

// Public & Student Pages
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LessonPlayerPage } from './pages/LessonPlayerPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { CertificateVerifyPage } from './pages/CertificateVerifyPage';
import { WorkshopsPage } from './pages/WorkshopsPage';
import { HomeNursingPage } from './pages/HomeNursingPage';
import { HolisticCarePage } from './pages/HolisticCarePage';
import { WebinarsPage } from './pages/WebinarsPage';
import { GuestsPage } from './pages/GuestsPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCMSPage } from './pages/admin/AdminCMSPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminWebinarsPage } from './pages/admin/AdminWebinarsPage';
import { AdminWorkshopsPage } from './pages/admin/AdminWorkshopsPage';
import { AdminHomeNursingPage } from './pages/admin/AdminHomeNursingPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const PublicLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:slug" element={<CourseDetailPage />} />
              <Route path="/workshops" element={<WorkshopsPage />} />
              <Route path="/home-nursing" element={<HomeNursingPage />} />
              <Route path="/holistic" element={<HolisticCarePage />} />
              <Route path="/webinars" element={<WebinarsPage />} />
              <Route path="/invitati" element={<GuestsPage />} />
              <Route path="/guests" element={<GuestsPage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/articles/:slug" element={<ArticleDetailPage />} />
              <Route path="/certificate/verify" element={<CertificateVerifyPage />} />
              <Route path="/certificate/verify/:code" element={<CertificateVerifyPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<StudentDashboardPage />} />
              <Route path="/pricing" element={<CheckoutPage />} />
              <Route path="/lessons/:lessonId" element={<LessonPlayerPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            {/* Comprehensive Admin Panel */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="cms" element={<AdminCMSPage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="webinars" element={<AdminWebinarsPage />} />
              <Route path="workshops" element={<AdminWorkshopsPage />} />
              <Route path="home-nursing" element={<AdminHomeNursingPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};
export default App;
