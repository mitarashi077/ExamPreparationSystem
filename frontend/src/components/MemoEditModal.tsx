import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
} from '@mui/material'
import TouchButton from './TouchButton'

interface MemoEditModalProps {
  open: boolean
  memo: string
  questionContent?: string
  isMobile?: boolean
  onClose: () => void
  onSave: () => void
  onMemoChange: (memo: string) => void
}

const MemoEditModal: React.FC<MemoEditModalProps> = ({
  open,
  memo,
  questionContent,
  isMobile = false,
  onClose,
  onSave,
  onMemoChange,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Save on Ctrl+Enter / Cmd+Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      onSave()
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          minHeight: isMobile ? '100%' : '400px',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        メモを編集
      </DialogTitle>
      
      <DialogContent sx={{ pb: 2 }}>
        {/* Question preview for context */}
        {questionContent && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              問題内容
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                lineHeight: 1.5,
                maxHeight: '100px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {questionContent}
            </Typography>
          </Box>
        )}

        <TextField
          autoFocus
          label="メモ"
          multiline
          rows={isMobile ? 8 : 6}
          fullWidth
          variant="outlined"
          value={memo}
          onChange={(e) => onMemoChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="この問題についてのメモを入力してください...&#10;&#10;例：&#10;- 重要なポイント&#10;- 間違いやすいポイント&#10;- 関連する知識"
          helperText={isMobile ? "Ctrl+Enterで保存" : undefined}
          sx={{
            '& .MuiInputBase-root': {
              lineHeight: 1.6,
            },
            '& textarea': {
              fontSize: isMobile ? '16px' : '14px', // Prevent zoom on iOS
            },
          }}
        />
        
        {/* Character count */}
        <Box sx={{ mt: 1, textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary">
            {memo.length} / 1000文字
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <TouchButton 
          onClick={onClose}
          touchSize={isMobile ? 'large' : 'medium'}
        >
          キャンセル
        </TouchButton>
        <TouchButton 
          onClick={onSave} 
          variant="contained"
          touchSize={isMobile ? 'large' : 'medium'}
          disabled={memo.length > 1000}
        >
          保存
        </TouchButton>
      </DialogActions>
    </Dialog>
  )
}

export default MemoEditModal