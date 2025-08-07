import React from 'react'
import { Typography, Card, Box, LinearProgress, Chip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material'
import TouchCardList from '../components/TouchCardList'
import ZoomableImage from '../components/ZoomableImage'

const HomePage = () => {
  const navigate = useNavigate()

  const mainMenuItems = [
    {
      id: 'practice',
      title: '問題演習',
      description: '分野別問題やランダム出題で実力アップ。通勤時間にも最適！',
      category: '学習',
      onClick: () => navigate('/practice'),
      badge: 0,
    },
    {
      id: 'progress',
      title: '学習進捗',
      description:
        'ヒートマップで弱点分野を視覚的に確認。効率的な学習計画を立てよう',
      category: '分析',
      onClick: () => navigate('/progress'),
      badge: 0,
    },
  ]

  const studyModeItems = [
    {
      id: 'timed-5',
      title: '5分タイマー学習',
      description: '通勤時間に最適な短時間集中モード。中断・再開機能付き',
      category: '短時間',
      onClick: () => navigate('/practice?mode=timed&time=5'),
    },
    {
      id: 'timed-10',
      title: '10分タイマー学習',
      description: 'じっくり考える中時間モード。進捗確認可能',
      category: '標準',
      onClick: () => navigate('/practice?mode=timed&time=10'),
    },
    {
      id: 'timed-15',
      title: '15分タイマー学習',
      description: '難しい問題にしっかり取り組む。詳細統計表示',
      category: '本格',
      onClick: () => navigate('/practice?mode=timed&time=15'),
    },
    {
      id: 'essay-demo',
      title: '記述式問題デモ',
      description:
        '午後試験対策の記述式問題エディタ。Markdown・コードハイライト対応',
      category: '午後対策',
      onClick: () => navigate('/essay-demo'),
    },
  ]

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          writingMode: 'horizontal-tb !important',
          textOrientation: 'mixed !important',
          direction: 'ltr',
        }}
      >
        ESS試験対策
      </Typography>

      {/* 今日の学習状況 */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <ScheduleIcon color="primary" sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            sx={{
              writingMode: 'horizontal-tb !important',
              textOrientation: 'mixed !important',
              direction: 'ltr',
            }}
          >
            今日の学習状況
          </Typography>
          <Chip
            label="連続3日"
            size="small"
            color="success"
            sx={{
              ml: 'auto',
              writingMode: 'horizontal-tb !important',
              textOrientation: 'mixed !important',
              '& .MuiChip-label': {
                writingMode: 'horizontal-tb !important',
                textOrientation: 'mixed !important',
              },
            }}
          />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={1}
          sx={{
            writingMode: 'horizontal-tb !important',
            textOrientation: 'mixed !important',
            direction: 'ltr',
          }}
        >
          今日の目標: 10問
        </Typography>
        <LinearProgress
          variant="determinate"
          value={30}
          sx={{ mb: 1, height: 8, borderRadius: 4 }}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              writingMode: 'horizontal-tb !important',
              textOrientation: 'mixed !important',
              direction: 'ltr',
            }}
          >
            3/10問 完了 (30%)
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <SpeedIcon fontSize="small" color="action" />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                writingMode: 'horizontal-tb !important',
                textOrientation: 'mixed !important',
                direction: 'ltr',
              }}
            >
              平均 2.5分/問
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* メインメニュー */}
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{
          mt: 4,
          mb: 2,
          writingMode: 'horizontal-tb !important',
          textOrientation: 'mixed !important',
          direction: 'ltr',
        }}
      >
        メインメニュー
      </Typography>
      <TouchCardList
        items={mainMenuItems}
        columns={{ xs: 1, md: 2 }}
        spacing={3}
        showSwipeIndicators={true}
      />

      {/* 通勤学習モード */}
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{
          mt: 4,
          mb: 2,
          writingMode: 'horizontal-tb !important',
          textOrientation: 'mixed !important',
          direction: 'ltr',
        }}
      >
        通勤学習モード
      </Typography>
      <TouchCardList
        items={studyModeItems}
        columns={{ xs: 1, sm: 2, md: 3 }}
        spacing={2}
        showSwipeIndicators={true}
      />

      {/* サンプル図表（ズーム機能デモ） */}
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{
          mt: 4,
          mb: 2,
          writingMode: 'horizontal-tb !important',
          textOrientation: 'mixed !important',
          direction: 'ltr',
        }}
      >
        サンプル図表（ピンチズーム対応）
      </Typography>
      <Card sx={{ p: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={2}
          sx={{
            writingMode: 'horizontal-tb !important',
            textOrientation: 'mixed !important',
            direction: 'ltr',
          }}
        >
          実際の試験問題では、回路図やシステム構成図が表示されます。
          モバイルでもピンチズームで詳細を確認できます。
        </Typography>
        <ZoomableImage
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bWFya2VyIGlkPSJhcnJvdyIgbWFya2VyV2lkdGg9IjEwIiBtYXJrZXJIZWlnaHQ9IjEwIiByZWZYPSI5IiByZWZZPSIzIiBvcmllbnQ9ImF1dG8iIG1hcmtlclVuaXRzPSJzdHJva2VXaWR0aCI+PHBhdGggZD0iTTAsMCBMMCw2IEw5LDMgeiIgZmlsbD0iIzMzMyIvPjwvbWFya2VyPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjlmOWY5IiBzdHJva2U9IiNkZGQiLz48cmVjdCB4PSI1MCIgeT0iNTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2U3ZjNmZiIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI5MCIgeT0iODUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q1BVPC90ZXh0PjxyZWN0IHg9IjIwMCIgeT0iNTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2ZmZjJlNyIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIyNDAiIHk9Ijg1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1lbW9yeTwvdGV4dD48cmVjdCB4PSIzMjAiIHk9IjUwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNlN2ZmZTciIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMzUwIiB5PSI4NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JL088L3RleHQ+PGxpbmUgeDE9IjEzMCIgeTE9IjgwIiB4Mj0iMjAwIiB5Mj0iODAiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBtYXJrZXItZW5kPSJ1cmwoI2Fycm93KSIvPjxsaW5lIHgxPSIyODAiIHkxPSI4MCIgeDI9IjMyMCIgeTI9IjgwIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIgbWFya2VyLWVuZD0idXJsKCNhcnJvdykiLz48dGV4dCB4PSIyMDAiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj7jgrfjgrnjg4bjg6Djmp7miJDnrYw8L3RleHQ+PHRleHQgeD0iMjAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2Ij7jg5Tjg7Pjg4Hjgafmi6XlpKfjgZfjgabjgIHjgr/jg4Pjg5fjgafjga7oqLzns7Tjgafnorrlr77jgpLnorroqo3jgZnjgovjgZPjgajjgYzjgafjgY3jgb7jgZnjgII8L3RleHQ+PC9zdmc+"
          alt="システム構成図サンプル"
          maxHeight={200}
          showControls={true}
          showTouchHint={true}
        />
      </Card>
    </Box>
  )
}

export default HomePage
