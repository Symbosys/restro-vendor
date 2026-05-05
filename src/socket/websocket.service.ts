
type MessageHandler = (data: any) => void;

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private handlers: Record<string, MessageHandler[]> = {};
  private reconnectInterval = 5000; // 5s
  private url: string | null = null;
  private isManuallyClosed = false;

  private constructor() {}

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(url: string) {
    this.url = url;
    this.isManuallyClosed = false;
    this.initialize();
  }

  private initialize() {
    if (!this.url) throw new Error("WebSocket URL not set.");

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("✅ WebSocket connected:", this.url);
      this.emit("system", { type: "connected" });
      this.startHeartbeat();
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.dispatch(message);
      } catch (err) {
        console.warn("⚠️ Invalid WS message:", event.data);
      }
    };

    this.socket.onclose = (e) => {
      console.log("❌ WebSocket closed:", e.reason || e.code);
      this.emit("system", { type: "disconnected" });
      this.stopHeartbeat();

      if (!this.isManuallyClosed) {
        console.log(`♻️ Reconnecting in ${this.reconnectInterval / 1000}s...`);
        setTimeout(() => this.initialize(), this.reconnectInterval);
      }
    };

    this.socket.onerror = (err) => {
      console.error("⚠️ WebSocket error:", err);
      this.socket?.close();
    };
  }

  send(data: Record<string, any>) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn("⚠️ WebSocket not connected, message dropped:", data);
    }
  }

  close() {
    this.isManuallyClosed = true;
    this.socket?.close();
    this.socket = null;
  }

  // ✅ Heartbeat (ping)
  private heartbeatInterval: any;
  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send({ type: "ping" });
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }

  // ✅ Event system
  on(event: string, handler: MessageHandler) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  }

  off(event: string, handler: MessageHandler) {
    this.handlers[event] = (this.handlers[event] || []).filter((h) => h !== handler);
  }

  private emit(event: string, data: any) {
    (this.handlers[event] || []).forEach((h) => h(data));
  }

  private dispatch(message: any) {
    if (!message?.type) return;
    this.emit(message.type, message);
  }
}

export const wsService = WebSocketService.getInstance();
