# タスク: リアルタイムWebSocket クライアント

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-007
タスクサイズ: 中規模
想定ファイル数: 1
想定作業時間: 3時間
依存タスク: LPD-004, LPD-005

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
WebSocketサーバーと接続してリアルタイム更新を受信し、ダッシュボードの状態を即座に更新するクライアント機能を実装する

### 前タスクとの関連
- 前タスク: LPD-004 (リアルタイムWebSocketインフラ), LPD-005 (ダッシュボード状態管理)
- 引き継ぐ情報: WebSocketサーバー仕様とダッシュボードストア構造

### 後続タスクへの影響
- 後続タスク: LPD-008 (ダッシュボードページレイアウト)
- 提供する情報: リアルタイム更新機能とカスタムReact Hook

## 概要
Socket.ioクライアントを使用してWebSocketサーバーに接続し、学習活動に応じたリアルタイム更新をダッシュボードに反映するカスタムReact Hookを実装する。

## 対象ファイル
- [ ] frontend/src/hooks/useRealtimeUpdates.ts

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] WebSocket接続フックのimportテストを作成し、存在しないことを確認
   - [ ] リアルタイム更新の受信テストを作成し、機能が未実装であることを確認
   - [ ] 接続状態管理テストを作成し、状態が正しく管理されないことを確認

### 2. **Green Phase - 最小限の実装**
   - [ ] useRealtimeUpdates.tsにカスタムフックを実装:
   ```typescript
   import { useEffect, useState, useCallback } from 'react';
   import { io, Socket } from 'socket.io-client';
   import { useDashboardStore } from '../stores/useDashboardStore';

   interface ProgressUpdateEvent {
     type: 'answer_submitted' | 'session_completed' | 'achievement_unlocked';
     data: {
       userId?: string;
       questionId?: string;
       newStats?: any;
       achievement?: any;
     };
     timestamp: string;
   }

   interface UseRealtimeUpdatesOptions {
     enabled?: boolean;
     userId?: string;
     autoReconnect?: boolean;
     timeout?: number;
   }

   interface UseRealtimeUpdatesReturn {
     socket: Socket | null;
     connected: boolean;
     connecting: boolean;
     error: string | null;
     reconnectAttempts: number;
     disconnect: () => void;
     connect: () => void;
   }

   export const useRealtimeUpdates = (
     options: UseRealtimeUpdatesOptions = {}
   ): UseRealtimeUpdatesReturn => {
     const {
       enabled = true,
       userId,
       autoReconnect = true,
       timeout = 5000
     } = options;

     const [socket, setSocket] = useState<Socket | null>(null);
     const [connected, setConnected] = useState(false);
     const [connecting, setConnecting] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [reconnectAttempts, setReconnectAttempts] = useState(0);

     // ダッシュボードストアのアクション取得
     const {
       setOverview,
       setAchievements,
       fetchOverview,
       fetchAchievements
     } = useDashboardStore();

     // リアルタイム更新処理
     const handleProgressUpdate = useCallback((event: ProgressUpdateEvent) => {
       console.log('Received progress update:', event);

       switch (event.type) {
         case 'answer_submitted':
           // 統計情報の部分更新またはフル再取得
           if (event.data.newStats) {
             setOverview(event.data.newStats);
           } else {
             fetchOverview('30d'); // デフォルト期間で再取得
           }
           break;

         case 'achievement_unlocked':
           // 新しい達成記録を追加
           if (event.data.achievement) {
             fetchAchievements(); // 達成記録リストを再取得
           }
           break;

         case 'session_completed':
           // セッション完了時の統計更新
           fetchOverview('30d');
           break;

         default:
           console.warn('Unknown progress update type:', event.type);
       }
     }, [setOverview, setAchievements, fetchOverview, fetchAchievements]);

     // WebSocket接続
     const connect = useCallback(() => {
       if (!enabled || socket?.connected) return;

       setConnecting(true);
       setError(null);

       const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
       const newSocket = io(`${serverUrl}/dashboard`, {
         timeout,
         transports: ['websocket', 'polling'],
         forceNew: true,
         reconnection: autoReconnect,
         reconnectionAttempts: 5,
         reconnectionDelay: 1000,
       });

       // 接続成功
       newSocket.on('connect', () => {
         console.log('Dashboard WebSocket connected');
         setConnected(true);
         setConnecting(false);
         setError(null);
         setReconnectAttempts(0);

         // ダッシュボードに参加
         newSocket.emit('join-dashboard', {
           userId,
           preferences: useDashboardStore.getState().preferences
         });
       });

       // ダッシュボード参加確認
       newSocket.on('dashboard-joined', (data) => {
         console.log('Dashboard joined:', data);
       });

       // プログレス更新受信
       newSocket.on('progress:updated', handleProgressUpdate);

       // 接続エラー
       newSocket.on('connect_error', (err) => {
         console.error('WebSocket connection error:', err);
         setError(err.message || 'Connection failed');
         setConnected(false);
         setConnecting(false);
         setReconnectAttempts(prev => prev + 1);
       });

       // 切断
       newSocket.on('disconnect', (reason) => {
         console.log('WebSocket disconnected:', reason);
         setConnected(false);
         setConnecting(false);
         
         if (reason === 'io server disconnect') {
           // サーバー側から切断された場合は手動再接続
           setError('Server disconnected');
         }
       });

       // Ping/Pong for connection health
       newSocket.on('pong', (timestamp) => {
         const latency = Date.now() - timestamp;
         console.log(`WebSocket latency: ${latency}ms`);
       });

       setSocket(newSocket);
     }, [enabled, timeout, autoReconnect, userId, handleProgressUpdate]);

     // WebSocket切断
     const disconnect = useCallback(() => {
       if (socket) {
         socket.disconnect();
         setSocket(null);
         setConnected(false);
         setConnecting(false);
       }
     }, [socket]);

     // 初期接続とクリーンアップ
     useEffect(() => {
       if (enabled) {
         connect();
       }

       return () => {
         disconnect();
       };
     }, [enabled, connect, disconnect]);

     // 定期的なping送信（接続健全性チェック）
     useEffect(() => {
       if (!socket || !connected) return;

       const pingInterval = setInterval(() => {
         socket.emit('ping', Date.now());
       }, 30000); // 30秒ごと

       return () => clearInterval(pingInterval);
     }, [socket, connected]);

     return {
       socket,
       connected,
       connecting,
       error,
       reconnectAttempts,
       disconnect,
       connect,
     };
   };
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] フォールバック機能を追加:
   ```typescript
   // ポーリングフォールバック機能
   const [pollingFallback, setPollingFallback] = useState(false);
   const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

   const startPollingFallback = useCallback(() => {
     if (pollingInterval) return;

     console.log('Starting polling fallback');
     setPollingFallback(true);

     const interval = setInterval(() => {
       // 定期的にAPIを呼び出してデータを更新
       fetchOverview('30d');
     }, 10000); // 10秒ごと

     setPollingInterval(interval);
   }, [fetchOverview, pollingInterval]);

   const stopPollingFallback = useCallback(() => {
     if (pollingInterval) {
       clearInterval(pollingInterval);
       setPollingInterval(null);
       setPollingFallback(false);
       console.log('Stopped polling fallback');
     }
   }, [pollingInterval]);
   ```
   - [ ] 接続状態インジケーター用のコンポーネントを追加:
   ```typescript
   // 接続状態を表すユーティリティ
   export const getConnectionStatus = (
     connected: boolean,
     connecting: boolean,
     error: string | null,
     reconnectAttempts: number
   ) => {
     if (connecting) return { status: 'connecting', message: '接続中...' };
     if (connected) return { status: 'connected', message: 'リアルタイム更新有効' };
     if (error) return { status: 'error', message: `接続エラー: ${error}` };
     if (reconnectAttempts > 0) return { status: 'reconnecting', message: `再接続中... (${reconnectAttempts}/5)` };
     return { status: 'disconnected', message: 'オフライン' };
   };
   ```
   - [ ] メモリリーク防止とパフォーマンス最適化
   - [ ] TypeScript型の厳密化とエラーハンドリング強化

## 完了条件
- [ ] Red Phase: WebSocket接続とリアルタイム更新の失敗テストを作成済み
- [ ] Green Phase: WebSocket接続が確立され、プログレス更新イベントを受信してストアを更新する
- [ ] Refactor Phase: フォールバック機能と接続状態管理が実装済み
- [ ] 接続・切断・再接続が正常に動作することを確認済み
- [ ] ping/pong機能で接続の健全性を監視できることを確認済み
- [ ] **注記**: 実際のリアルタイム更新テストは LPD-008 のページ実装で統合テスト

## 注意事項
### 実装上の注意
- WebSocket接続は必要な時のみ確立し、不要なリソース消費を避ける
- 自動再接続機能は適切な間隔とリトライ回数を設定する
- ポーリングフォールバックはWebSocket接続失敗時のみ有効化
- メモリリークを防ぐため、useEffectのクリーンアップを確実に実行

### 影響範囲の制御
- このタスクで変更してはいけない部分: 既存のWebSocket使用箇所（存在しない想定）
- 影響が波及する可能性がある箇所: ダッシュボードストアの状態（意図的な更新）

### 共通化の指針
- 他タスクと共通化すべき処理: WebSocket接続パターンは将来的な他のリアルタイム機能で再利用可能
- 冗長実装を避けるための確認事項: 接続状態管理ロジックは再利用可能な形で実装