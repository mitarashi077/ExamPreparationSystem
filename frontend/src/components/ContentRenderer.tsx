import { useState } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { 
  Code as CodeIcon,
  Image as ImageIcon,
  TableChart as TableIcon,
} from '@mui/icons-material'
import ZoomableImage from './ZoomableImage'
import { ContentRenderer as ContentRendererType } from '../types/longQuestion'

interface ContentRendererProps {
  content: string
  type?: 'markdown' | 'html'
  showImages?: boolean
  showTables?: boolean
  showCode?: boolean
  maxImageHeight?: number
}

const ContentRenderer = ({
  content,
  type = 'markdown',
  showImages = true,
  showTables = true,
  showCode = true,
  maxImageHeight = 300,
}: ContentRendererProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [expandedCode, setExpandedCode] = useState<Record<string, boolean>>({})

  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string): ContentRendererType[] => {
    const elements: ContentRendererType[] = []
    const lines = text.split('\n')
    let currentElement: ContentRendererType | null = null
    let inCodeBlock = false
    let codeLanguage = ''
    let codeContent = ''
    let inTable = false
    let tableRows: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Code block detection
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push({
            type: 'code',
            content: codeContent,
            metadata: { language: codeLanguage }
          })
          inCodeBlock = false
          codeContent = ''
          codeLanguage = ''
        } else {
          // Start code block
          inCodeBlock = true
          codeLanguage = line.slice(3).trim()
        }
        continue
      }

      if (inCodeBlock) {
        codeContent += line + '\n'
        continue
      }

      // Table detection
      if (line.includes('|') && line.trim().length > 0) {
        if (!inTable) {
          inTable = true
          tableRows = []
        }
        tableRows.push(line)
        continue
      } else if (inTable) {
        // End table
        elements.push({
          type: 'table',
          content: tableRows.join('\n')
        })
        inTable = false
        tableRows = []
      }

      // Image detection
      const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/)
      if (imageMatch) {
        elements.push({
          type: 'image',
          content: imageMatch[2],
          metadata: {
            alt: imageMatch[1],
            zoomable: true
          }
        })
        continue
      }

      // Regular text
      if (line.trim()) {
        elements.push({
          type: 'text',
          content: line
        })
      }
    }

    // Handle remaining table if any
    if (inTable && tableRows.length > 0) {
      elements.push({
        type: 'table',
        content: tableRows.join('\n')
      })
    }

    return elements
  }

  const renderTable = (content: string) => {
    const rows = content.split('\n').filter(row => row.trim())
    if (rows.length < 2) return null

    const headerRow = rows[0].split('|').map(cell => cell.trim()).filter(cell => cell)
    const dataRows = rows.slice(2).map(row => 
      row.split('|').map(cell => cell.trim()).filter(cell => cell)
    )

    return (
      <TableContainer 
        component={Paper} 
        sx={{ 
          my: 2, 
          maxWidth: '100%',
          overflowX: 'auto'
        }}
      >
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {headerRow.map((header, index) => (
                <TableCell 
                  key={index}
                  sx={{ 
                    fontWeight: 'bold',
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText'
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dataRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  const renderCodeBlock = (content: string, language?: string, index?: number) => {
    const codeId = `code-${index}`
    const isExpanded = expandedCode[codeId] || false
    const shouldTruncate = content.split('\n').length > 10
    const displayContent = shouldTruncate && !isExpanded 
      ? content.split('\n').slice(0, 10).join('\n') + '\n...'
      : content

    return (
      <Box sx={{ my: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CodeIcon fontSize="small" sx={{ mr: 1 }} />
          {language && (
            <Chip 
              label={language.toUpperCase()} 
              size="small" 
              variant="outlined"
              sx={{ mr: 1 }}
            />
          )}
          {shouldTruncate && (
            <Chip
              label={isExpanded ? '折りたたむ' : 'すべて表示'}
              size="small"
              clickable
              onClick={() => setExpandedCode(prev => ({
                ...prev,
                [codeId]: !isExpanded
              }))}
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        <Paper
          sx={{
            p: 2,
            backgroundColor: 'grey.100',
            borderRadius: 2,
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            lineHeight: 1.4,
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {displayContent}
          </pre>
        </Paper>
      </Box>
    )
  }

  const renderImage = (src: string, alt?: string) => {
    // Handle base64 encoded images or URLs
    const isValidSrc = src.startsWith('data:') || src.startsWith('http') || src.startsWith('/')
    
    if (!isValidSrc) {
      return (
        <Alert severity="warning" sx={{ my: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ImageIcon sx={{ mr: 1 }} />
            画像を読み込めませんでした: {alt || 'Untitled'}
          </Box>
        </Alert>
      )
    }

    return (
      <Box sx={{ my: 2, textAlign: 'center' }}>
        <ZoomableImage
          src={src}
          alt={alt || '問題図表'}
          maxHeight={maxImageHeight}
          showTouchHint={isMobile}
        />
        {alt && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {alt}
          </Typography>
        )}
      </Box>
    )
  }

  const formatText = (text: string) => {
    // Simple text formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px;">$1</code>')
  }

  const elements = parseMarkdown(content)

  return (
    <Box sx={{ width: '100%' }}>
      {elements.map((element, index) => {
        switch (element.type) {
          case 'image':
            return showImages ? (
              <Box key={index}>
                {renderImage(element.content, element.metadata?.alt)}
              </Box>
            ) : null

          case 'table':
            return showTables ? (
              <Box key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TableIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    表データ
                  </Typography>
                </Box>
                {renderTable(element.content)}
              </Box>
            ) : null

          case 'code':
            return showCode ? (
              <Box key={index}>
                {renderCodeBlock(element.content, element.metadata?.language, index)}
              </Box>
            ) : null

          case 'text':
          default:
            return (
              <Typography
                key={index}
                variant="body1"
                sx={{
                  mb: 1,
                  lineHeight: 1.6,
                  '& code': {
                    backgroundColor: 'grey.100',
                    padding: '2px 4px',
                    borderRadius: 1,
                    fontSize: '0.9em',
                  }
                }}
                dangerouslySetInnerHTML={{
                  __html: formatText(element.content)
                }}
              />
            )
        }
      })}
    </Box>
  )
}

export default ContentRenderer