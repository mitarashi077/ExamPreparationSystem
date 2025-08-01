import { useState, useCallback } from 'react';
import axios from 'axios';

interface _ReviewItem {
  id: string;
  questionId: string;
  question: {
    id: string;
    content: string;
    explanation?: string;
    difficulty: number;
    category: {
      name: string;
    };
    choices: Array<{
      id: string;
      content: string;
      isCorrect: boolean;
    }>;
  };
  masteryLevel: number;
  reviewCount: number;
  nextReview: string;
  wrongCount: number;
  correctStreak: number;
  priority: number;
  isActive: boolean;
}

interface ReviewSchedule {
  schedule: {
    today: number;
    tomorrow: number;
    thisWeek: number;
    totalActive: number;
  };
  masteryDistribution: Record<string, number>;
  recommendations: {
    suggestedDailyReviews: number;
    estimatedTimeMinutes: number;
    urgentItems: number;
  };
}

interface ReviewStats {
  recentSessions: Array<{
    date: string;
    totalItems: number;
    correctItems: number;
    accuracy: number;
    duration?: number;
  }>;
  categoryStats: Record<string, {
    total: number;
    avgMasteryLevel: number;
    avgReviewCount: number;
  }>;
  masteryProgress: Array<{
    level: number;
    count: number;
    avgReviewCount: number;
  }>;
}

export const useReviewApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 復習対象問題の取得
  const getReviewQuestions = useCallback(async (limit: number = 10, priority: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/review/questions`, {
        params: { limit, priority }
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.error || '復習問題の取得に失敗しました'
        : '復習問題の取得に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 復習スケジュールの取得
  const getReviewSchedule = useCallback(async (): Promise<ReviewSchedule> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/review/schedule');
      return response.data;
    } catch (err: any) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.error || '復習スケジュールの取得に失敗しました'
        : '復習スケジュールの取得に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 復習セッションの開始
  const startReviewSession = useCallback(async (deviceType?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/review/sessions', {
        deviceType: deviceType || (window.innerWidth < 768 ? 'mobile' : 'pc')
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.error || '復習セッションの開始に失敗しました'
        : '復習セッションの開始に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 復習セッションの終了
  const endReviewSession = useCallback(async (
    sessionId: string, 
    duration: number, 
    totalItems: number, 
    correctItems: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/review/sessions/${sessionId}`, {
        duration,
        totalItems,
        correctItems
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.error || '復習セッションの終了に失敗しました'
        : '復習セッションの終了に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 復習統計の取得
  const getReviewStats = useCallback(async (period: number = 7): Promise<ReviewStats> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/review/stats', {
        params: { period }
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.error || '復習統計の取得に失敗しました'
        : '復習統計の取得に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 復習問題への回答送信（既存のAPIと統合）
  const submitReviewAnswer = useCallback(async (
    questionId: string,
    choiceId: string,
    timeSpent?: number,
    deviceType?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/answers', {
        questionId,
        choiceId,
        timeSpent,
        deviceType: deviceType || (window.innerWidth < 768 ? 'mobile' : 'pc')
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.error || '回答の送信に失敗しました'
        : '回答の送信に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getReviewQuestions,
    getReviewSchedule,
    startReviewSession,
    endReviewSession,
    getReviewStats,
    submitReviewAnswer,
    clearError: () => setError(null)
  };
};