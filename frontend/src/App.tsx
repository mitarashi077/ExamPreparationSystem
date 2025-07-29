import { Routes, Route } from 'react-router-dom'
import { Container, Box } from '@mui/material'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PracticePage from './pages/PracticePage'
import ProgressPage from './pages/ProgressPage'

function App() {
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 2 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/progress" element={<ProgressPage />} />
          </Routes>
        </Box>
      </Container>
    </Layout>
  )
}

export default App