import { 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Box,
  Button,
  LinearProgress,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  Quiz as QuizIcon,
  TrendingUp as ProgressIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        エンベデッドシステムスペシャリスト試験対策
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <QuizIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">問題演習</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                分野別問題やランダム出題で実力アップ
              </Typography>
              <Button 
                variant="contained" 
                fullWidth
                onClick={() => navigate('/practice')}
              >
                問題を解く
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ProgressIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">学習進捗</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                ヒートマップで弱点分野を視覚的に確認
              </Typography>
              <Button 
                variant="contained" 
                fullWidth
                onClick={() => navigate('/progress')}
              >
                進捗を確認
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">今日の学習状況</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                今日の目標: 10問
              </Typography>
              <LinearProgress variant="determinate" value={30} sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                3/10問 完了 (30%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default HomePage