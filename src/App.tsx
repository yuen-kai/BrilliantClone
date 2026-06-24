import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { isLayerActive } from './config/buildLayer'
import { AuthProvider } from './context/AuthContext'
import { AuthGate } from './components/auth/AuthGate'
import { CoursePath } from './components/course/CoursePath'
import { DevLevelPicker } from './components/DevLevelPicker'
import { LoginPage } from './pages/LoginPage'
import { LessonPage } from './pages/LessonPage'
import './App.css'

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
      <Route
        path="/"
        element={
          <AuthGate>
            <CoursePath />
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
      <BrowserRouter>
        <DevLevelPicker />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
