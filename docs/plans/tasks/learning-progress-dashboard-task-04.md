# タスク: リアルタイムWebSocketインフラ

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-004
タスクサイズ: 中規模
想定ファイル数: 2
想定作業時間: 4時間
依存タスク: LPD-002

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
ダッシュボードのリアルタイム更新機能を実現するWebSocketサーバーインフラを構築し、問題回答等のイベントに応じて即座にダッシュボードを更新する

### 前タスクとの関連
- 前タスク: LPD-002 (コアダッシュボードAPI エンドポイント)
- 引き継ぐ情報: ダッシュボードデータの構造と更新すべき統計情報

### 後続タスクへの影響
- 後続タスク: LPD-007 (WebSocket クライアント)
- 提供する情報: WebSocketサーバー設定とリアルタイムイベント仕様

## 概要
Socket.ioを使用してWebSocketサーバーを構築し、学習活動（問題回答、セッション完了等）に応じてダッシュボードにリアルタイム更新を配信する機能を実装する。

## 対象ファイル
- [ ] backend/src/websocket/socketServer.ts
- [ ] backend/src/index.ts

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] WebSocket接続テストを作成し、サーバーが存在しないことを確認
   - [ ] ダッシュボードイベント配信テストを作成し、機能が未実装であることを確認
   - [ ] 複数クライアント接続テストを作成し、接続管理が未実装であることを確認

### 2. **Green Phase - 最小限の実装**
   - [ ] socketServer.tsにSocket.ioサーバー設定を実装:
   ```typescript
   import { Server as SocketIOServer } from 'socket.io';
   import { Server as HttpServer } from 'http';

   interface DashboardJoinEvent {
     userId?: string;
     preferences: Record<string, any>;
   }

   interface ProgressUpdateEvent {
     type: 'answer_submitted' | 'session_completed' | 'achievement_unlocked';
     data: {
       userId?: string;
       questionId?: string;
       newStats?: Record<string, any>;
       achievement?: Record<string, any>;
     };
     timestamp: string;
   }

   export class DashboardSocketServer {
     private io: SocketIOServer;
     private connectedClients = new Map<string, { userId?: string; socketId: string }>();

     constructor(httpServer: HttpServer) {
       this.io = new SocketIOServer(httpServer, {
         cors: {
           origin: process.env.FRONTEND_URL || "http://localhost:5173",
           methods: ["GET", "POST"]
         },
         transports: ['websocket', 'polling']
       });

       this.setupNamespace();
     }

     private setupNamespace() {
       const dashboardNamespace = this.io.of('/dashboard');
       
       dashboardNamespace.on('connection', (socket) => {
         console.log(`Dashboard client connected: ${socket.id}`);
         
         socket.on('join-dashboard', (data: DashboardJoinEvent) => {
           this.connectedClients.set(socket.id, {
             userId: data.userId,
             socketId: socket.id
           });
           
           socket.emit('dashboard-joined', {
             status: 'connected',
             timestamp: new Date().toISOString()
           });
         });

         socket.on('disconnect', (reason) => {
           console.log(`Dashboard client disconnected: ${socket.id}, reason: ${reason}`);
           this.connectedClients.delete(socket.id);
         });

         socket.on('ping', (timestamp) => {
           socket.emit('pong', timestamp);
         });
       });
     }

     public broadcastProgressUpdate(event: ProgressUpdateEvent) {
       const dashboardNamespace = this.io.of('/dashboard');
       dashboardNamespace.emit('progress:updated', event);
     }

     public getConnectedClientsCount(): number {
       return this.connectedClients.size;
     }
   }
   ```
   - [ ] index.tsにWebSocketサーバーを統合:
   ```typescript
   import { DashboardSocketServer } from './websocket/socketServer';

   // 既存のHTTPサーバー作成後に追加
   const dashboardSocket = new DashboardSocketServer(server);

   // エクスポートして他のモジュールから使用可能にする
   export { dashboardSocket };
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] 接続管理を改善:
   ```typescript
   private cleanupConnections() {
     // 定期的に無効な接続をクリーンアップ
     setInterval(() => {
       this.connectedClients.forEach((client, socketId) => {
         const socket = this.io.of('/dashboard').sockets.get(socketId);
         if (!socket || !socket.connected) {
           this.connectedClients.delete(socketId);
         }
       });
     }, 30000); // 30秒ごと
   }
   ```
   - [ ] エラーハンドリングを追加:
   ```typescript
   private setupErrorHandling(socket: Socket) {
     socket.on('error', (error) => {
       console.error(`Socket error for client ${socket.id}:`, error);
     });

     socket.on('connect_error', (error) => {
       console.error(`Connection error for client ${socket.id}:`, error);
     });
   }
   ```
   - [ ] 接続制限とレート制限を実装:
   ```typescript
   // 最大接続数制限
   private readonly MAX_CONNECTIONS = 1000;
   
   // レート制限（メッセージ/秒）
   private readonly RATE_LIMIT = 10;
   private messageRates = new Map<string, number[]>();

   private checkRateLimit(socketId: string): boolean {
     const now = Date.now();
     const rates = this.messageRates.get(socketId) || [];
     
     // 1秒以内のメッセージをカウント
     const recentMessages = rates.filter(time => now - time < 1000);
     
     if (recentMessages.length >= this.RATE_LIMIT) {
       return false;
     }
     
     recentMessages.push(now);
     this.messageRates.set(socketId, recentMessages);
     return true;
   }
   ```
   - [ ] ヘルスチェック機能を追加:
   ```typescript
   public getServerHealth() {
     return {
       connectedClients: this.connectedClients.size,
       uptime: process.uptime(),
       memory: process.memoryUsage(),
       timestamp: new Date().toISOString()
     };
   }
   ```

## 完了条件
- [ ] Red Phase: WebSocket関連の失敗テストを作成し、未実装状態を確認済み
- [ ] Green Phase: 基本的なWebSocketサーバーが動作し、接続・切断が処理される
- [ ] Refactor Phase: エラーハンドリング、接続管理、パフォーマンス対策が実装済み
- [ ] ダッシュボード名前空間（/dashboard）での接続が正常に動作することを確認済み
- [ ] ping/pong機能で接続の健全性確認が可能であることを確認済み
- [ ] **注記**: 実際のイベント配信テストはLPD-007のクライアント実装後に実施

## 注意事項
### 実装上の注意
- CORS設定は開発環境用、本番環境では適切なオリジン制限が必要  
- 接続数制限は現実的な値に設定し、必要に応じて調整可能にする
- メモリリークを防ぐため、切断されたクライアントの適切なクリーンアップが重要
- WebSocketとPollingの両方をサポートし、ネットワーク環境に応じた自動選択

### 影響範囲の制御
- このタスクで変更してはいけない部分: 既存のHTTPサーバー設定と認証機能
- 影響が波及する可能性がある箇所: サーバーのメモリ使用量（接続管理により制御）

### 共通化の指針
- 他タスクと共通化すべき処理: エラーハンドリングパターンは既存のサーバー実装に準拠
- 冗長実装を避けるための確認事項: Socket.ioの設定は将来的な他のリアルタイム機能でも再利用可能