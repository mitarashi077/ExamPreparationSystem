import React from 'react'
import { 
  Box, 
  Chip, 
  Badge, 
  IconButton, 
  Tooltip, 
  Alert,
  Button,
  LinearProgress,
  Typography
} from '@mui/material'
import {
  WifiOff,
  Wifi,
  CloudSync,
  CloudDone,
  Sync,
  Warning
} from '@mui/icons-material'
import { useOfflineSync } from '../hooks/useOfflineSync'

interface OfflineIndicatorProps {
  showAlert?: boolean
  compact?: boolean
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  showAlert = false, 
  compact = false 
}) => {
  const { syncStatus, manualSync } = useOfflineSync()

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'error'
    if (syncStatus.pendingCount > 0) return 'warning'
    return 'success'
  }

  const getStatusIcon = () => {
    if (syncStatus.syncing) return <CloudSync className="rotating" />
    if (!syncStatus.isOnline) return <WifiOff />
    if (syncStatus.pendingCount > 0) return <Warning />
    return <CloudDone />
  }

  const getStatusText = () => {
    if (syncStatus.syncing) return '同期中...'
    if (!syncStatus.isOnline) return 'オフライン'
    if (syncStatus.pendingCount > 0) return `${syncStatus.pendingCount}件未同期`
    return 'オンライン'
  }

  if (compact) {
    return (
      <Tooltip title={getStatusText()}>
        <Badge 
          badgeContent={syncStatus.pendingCount > 0 ? syncStatus.pendingCount : 0}
          color="warning"
          max={99}
        >
          <Chip
            icon={getStatusIcon()}
            label={syncStatus.isOnline ? '同期済み' : 'オフライン'}
            color={getStatusColor()}
            size="small"
            variant="outlined"
            onClick={syncStatus.isOnline && syncStatus.pendingCount > 0 ? manualSync : undefined}
            clickable={syncStatus.isOnline && syncStatus.pendingCount > 0}
          />
        </Badge>
      </Tooltip>
    )
  }

  return (
    <Box>
      {/* ステータス表示 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getStatusIcon()}
          <Typography variant="body2" color={`${getStatusColor()}.main`}>
            {getStatusText()}
          </Typography>
        </Box>

        {syncStatus.isOnline && syncStatus.pendingCount > 0 && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Sync />}
            onClick={manualSync}
            disabled={syncStatus.syncing}
          >
            同期
          </Button>
        )}
      </Box>

      {/* 同期中プログレス */}
      {syncStatus.syncing && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            データを同期しています...
          </Typography>
        </Box>
      )}

      {/* 最終同期時刻 */}
      {syncStatus.lastSyncTime && (
        <Typography variant="caption" color="text.secondary">
          最終同期: {syncStatus.lastSyncTime.toLocaleString('ja-JP')}
        </Typography>
      )}

      {/* アラート表示 */}
      {showAlert && (
        <>
          {!syncStatus.isOnline && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  オフラインモードで動作中
                </Typography>
                <Typography variant="caption">
                  学習データはローカルに保存され、オンライン復帰時に自動同期されます。
                </Typography>
              </Box>
            </Alert>
          )}

          {syncStatus.isOnline && syncStatus.pendingCount > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  {syncStatus.pendingCount}件のデータが未同期です
                </Typography>
                <Typography variant="caption">
                  オンライン接続が安定している時に同期を実行してください。
                </Typography>
              </Box>
            </Alert>
          )}
        </>
      )}

      <style>
        {`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .rotating {
            animation: rotate 2s linear infinite;
          }
        `}
      </style>
    </Box>
  )
}

export default OfflineIndicator