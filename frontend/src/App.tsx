import { Routes, Route } from 'react-router-dom'
import { Container, Box } from '@mui/material'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PracticePage from './pages/PracticePage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'
import ReviewPage from './pages/ReviewPage'
import BookmarksPage from './pages/BookmarksPage'
import EssayQuestionDemo from './pages/EssayQuestionDemo'
import { useDeviceDetection } from './hooks/useDeviceDetection'

function App() {
  const { isMobile, isTablet } = useDeviceDetection()
  
  return (
    <Layout>
      <Container 
        maxWidth={isMobile || isTablet ? false : "lg"}
        disableGutters={isMobile || isTablet}
      >
        <Box sx={{ py: isMobile || isTablet ? 0 : 2, height: isMobile || isTablet ? '100%' : 'auto' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/essay-demo" element={<EssayQuestionDemo />} />
          </Routes>
        </Box>
      </Container>
    </Layout>
  )
}

export default App