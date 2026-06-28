import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { isLayerActive } from './config/buildLayer'
import { AuthProvider } from './context/AuthContext'
import { AuthGate } from './components/auth/AuthGate'
import { CoursePath } from './components/course/CoursePath'
import { CourseHub } from './components/course/CourseHub'
import { getCourse, defaultCourseId } from './content/courses'
import { ThemeToggle } from './components/ThemeToggle'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { LessonPage } from './pages/LessonPage'
import { CourseTestPage } from './pages/CourseTestPage'
import './App.css'

function CoursePathRoute() {
  const { courseId } = useParams<{ courseId: string }>()
  const course = getCourse(courseId)
  if (!course) return <Navigate to={`/course/${defaultCourseId}`} replace />
  return <CoursePath course={course} />
}

function AppRoutes() {
  if (!isLayerActive(4)) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/lesson/lesson-1" replace />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="*" element={<Navigate to="/lesson/lesson-1" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/course"
        element={
          <AuthGate>
            <CourseHub />
          </AuthGate>
        }
      />
      <Route
        path="/course/:courseId/test"
        element={
          <AuthGate>
            <CourseTestPage />
          </AuthGate>
        }
      />
      <Route
        path="/course/:courseId"
        element={
          <AuthGate>
            <CoursePathRoute />
          </AuthGate>
        }
      />
      <Route path="/lesson/:id" element={<LessonPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <ThemeToggle />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
