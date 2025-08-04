// 長文問題関連の型定義

export interface QuestionSection {
  id: string
  questionId: string
  title: string
  content: string // Markdown形式
  order: number
  sectionType: 'introduction' | 'main' | 'subsection' | 'conclusion'
  hasImage: boolean
  hasTable: boolean
  hasCode: boolean
  createdAt: string
  updatedAt: string
}

export interface LongFormQuestion {
  id: string
  content: string
  explanation?: string
  difficulty: number
  year?: number
  session?: string
  categoryId: string
  questionType: 'long_form'
  maxScore?: number
  sampleAnswer?: string
  hasImages: boolean
  hasTables: boolean
  hasCodeBlocks: boolean
  readingTime?: number // 推定読解時間（分）
  sections: QuestionSection[]
  choices?: any[]
  createdAt: string
  updatedAt: string
}

export interface LongQuestionNavigation {
  currentSectionIndex: number
  totalSections: number
  sectionProgress: Record<string, boolean> // セクションID → 読了状態
  readingProgress: number // 全体の読了進捗（0-100%）
}

export interface LongQuestionBookmark {
  questionId: string
  sectionId: string
  sectionTitle: string
  position?: number // セクション内の位置
  note?: string
}

export interface ContentRenderer {
  type: 'text' | 'image' | 'table' | 'code' | 'formula'
  content: string
  metadata?: {
    language?: string // コードブロック用
    caption?: string // 画像・表用
    alt?: string // 画像用
    zoomable?: boolean // 画像用
  }
}

export interface LongQuestionDisplayProps {
  question: LongFormQuestion
  onAnswer?: (questionId: string, choiceId: string, timeSpent: number) => Promise<any>
  onEssaySubmit?: (questionId: string, content: string, timeSpent: number) => Promise<any>
  onNextQuestion?: () => void
  onSectionRead?: (sectionId: string) => void
  onBookmarkSection?: (sectionId: string, note?: string) => void
  showTimer?: boolean
  timeLimit?: number
  reviewMode?: boolean
  showExplanation?: boolean
  showBookmark?: boolean
  categoryName?: string
}