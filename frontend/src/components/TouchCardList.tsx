import { Box, Grid, Typography, Chip } from '@mui/material'
import SwipeableCard from './SwipeableCard'
import TouchButton from './TouchButton'

interface TouchCardItem {
  id: string
  title: string
  description: string
  category?: string
  badge?: number
  onClick?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

interface TouchCardListProps {
  items: TouchCardItem[]
  columns?: { xs?: number; sm?: number; md?: number; lg?: number }
  spacing?: number
  showSwipeIndicators?: boolean
}

const TouchCardList = ({
  items,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  spacing = 3,
  showSwipeIndicators = true,
}: TouchCardListProps) => {
  return (
    <Grid container spacing={spacing}>
      {items.map((item) => (
        <Grid item {...columns} key={item.id}>
          <SwipeableCard
            onSwipeLeft={item.onSwipeLeft}
            onSwipeRight={item.onSwipeRight}
            showSwipeIndicators={showSwipeIndicators}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              p: 3,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography 
                  variant="h6" 
                  component="h3" 
                  sx={{ 
                    flexGrow: 1,
                    writingMode: 'horizontal-tb !important',
                    textOrientation: 'mixed !important',
                    direction: 'ltr',
                  }}
                >
                  {item.title}
                </Typography>
                {item.category && (
                  <Chip 
                    label={item.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{
                      writingMode: 'horizontal-tb !important',
                      textOrientation: 'mixed !important',
                      '& .MuiChip-label': {
                        writingMode: 'horizontal-tb !important',
                        textOrientation: 'mixed !important',
                      },
                    }}
                  />
                )}
                {item.badge && item.badge > 0 && (
                  <Chip 
                    label={item.badge} 
                    size="small" 
                    color="error" 
                    sx={{ 
                      minWidth: 24,
                      writingMode: 'horizontal-tb !important',
                      textOrientation: 'mixed !important',
                      '& .MuiChip-label': {
                        writingMode: 'horizontal-tb !important',
                        textOrientation: 'mixed !important',
                      },
                    }}
                  />
                )}
              </Box>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 3, 
                  lineHeight: 1.6,
                  writingMode: 'horizontal-tb !important',
                  textOrientation: 'mixed !important',
                  direction: 'ltr',
                }}
              >
                {item.description}
              </Typography>
            </Box>

            {item.onClick && (
              <TouchButton
                variant="contained"
                fullWidth
                touchSize="medium"
                onClick={item.onClick}
                sx={{ mt: 'auto' }}
              >
                開始
              </TouchButton>
            )}
          </SwipeableCard>
        </Grid>
      ))}
    </Grid>
  )
}

export default TouchCardList