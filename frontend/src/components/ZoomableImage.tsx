import { useState } from 'react'
import { Box, IconButton, Fade, Paper, Typography } from '@mui/material'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as ResetIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  TouchApp as TouchIcon,
} from '@mui/icons-material'

interface ZoomableImageProps {
  src: string
  alt: string
  maxWidth?: number | string
  maxHeight?: number | string
  showControls?: boolean
  showTouchHint?: boolean
  onFullscreen?: (isFullscreen: boolean) => void
}

const ZoomableImage = ({
  src,
  alt,
  maxWidth = '100%',
  maxHeight = 400,
  showControls = true,
  showTouchHint = true,
  onFullscreen,
}: ZoomableImageProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHint, setShowHint] = useState(showTouchHint)

  const handleFullscreen = () => {
    const newFullscreenState = !isFullscreen
    setIsFullscreen(newFullscreenState)
    if (onFullscreen) {
      onFullscreen(newFullscreenState)
    }
  }

  const dismissHint = () => {
    setShowHint(false)
  }

  return (
    <Box
      sx={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : maxWidth,
        height: isFullscreen ? '100vh' : maxHeight,
        zIndex: isFullscreen ? 1300 : 'auto',
        bgcolor: isFullscreen ? 'black' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={5}
        centerOnInit
        wheel={{ step: 0.2 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: false, step: 2 }}
        onInit={() => {
          if (showTouchHint) {
            setTimeout(() => setShowHint(false), 3000)
          }
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Control Buttons */}
            {showControls && (
              <Box
                sx={{
                  position: 'absolute',
                  top: isFullscreen ? 16 : 8,
                  right: isFullscreen ? 16 : 8,
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: isFullscreen ? 'row' : 'column',
                  gap: 1,
                }}
              >
                <IconButton
                  onClick={() => zoomIn()}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                  }}
                >
                  <ZoomInIcon />
                </IconButton>
                
                <IconButton
                  onClick={() => zoomOut()}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                  }}
                >
                  <ZoomOutIcon />
                </IconButton>
                
                <IconButton
                  onClick={() => resetTransform()}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                  }}
                >
                  <ResetIcon />
                </IconButton>
                
                <IconButton
                  onClick={handleFullscreen}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                  }}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Box>
            )}

            {/* Touch Hint */}
            <Fade in={showHint}>
              <Paper
                sx={{
                  position: 'absolute',
                  top: isFullscreen ? '50%' : 16,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 20,
                  p: 2,
                  display: { xs: 'flex', md: 'none' }, // Only show on mobile
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  borderRadius: 2,
                  cursor: 'pointer',
                }}
                onClick={dismissHint}
              >
                <TouchIcon fontSize="small" />
                <Typography variant="caption">
                  ピンチでズーム、タップで拡大
                </Typography>
              </Paper>
            </Fade>

            {/* Zoomable Image */}
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
              }}
              contentStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={src}
                alt={alt}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVlaWdodD0iMTAwJSIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuODu+ODoeODvOOCuOOCkuiqrOOBv+i+vOOCgeOBvuOBm+OCk+OBp+OBl+OBnzwvdGV4dD48L3N2Zz4='
                }}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </Box>
  )
}

export default ZoomableImage