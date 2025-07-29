import { 
  Typography, 
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Chip,
} from '@mui/material'
import { 
  WifiOff as OfflineIcon,
  Smartphone as MobileIcon,
  Computer as DesktopIcon,
  Tablet as TabletIcon,
} from '@mui/icons-material'
import { useAppStore } from '../stores/useAppStore'

const SettingsPage = () => {
  const { 
    theme, 
    studyTimeLimit, 
    deviceType, 
    isOnline,
    setTheme, 
    setStudyTimeLimit 
  } = useAppStore()

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <MobileIcon />
      case 'tablet': return <TabletIcon />
      case 'desktop': return <DesktopIcon />
      default: return <DesktopIcon />
    }
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        設定
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* デバイス情報 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              デバイス情報
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {getDeviceIcon()}
              <Typography variant="body1">
                デバイスタイプ: <strong>{deviceType}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isOnline ? null : <OfflineIcon color="warning" />}
              <Typography variant="body1">
                接続状態: 
                <Chip 
                  label={isOnline ? 'オンライン' : 'オフライン'}
                  color={isOnline ? 'success' : 'warning'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* 表示設定 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              表示設定
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={theme === 'dark'}
                  onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                />
              }
              label="ダークモード"
            />
          </CardContent>
        </Card>

        {/* 学習設定 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              学習設定
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>通勤学習モード時間制限</InputLabel>
              <Select
                value={studyTimeLimit || ''}
                label="通勤学習モード時間制限"
                onChange={(e) => setStudyTimeLimit(e.target.value as 5 | 10 | 15 | null)}
              >
                <MenuItem value="">制限なし</MenuItem>
                <MenuItem value={5}>5分</MenuItem>
                <MenuItem value={10}>10分</MenuItem>
                <MenuItem value={15}>15分</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* アプリ情報 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              アプリ情報
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Version: 1.0.0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              エンベデッドシステムスペシャリスト試験対策システム
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default SettingsPage