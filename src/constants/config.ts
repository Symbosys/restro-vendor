/**
 * ============================================
 * 🌐 Application Configuration
 * ============================================
 * Centralized environment management for API 
 * and WebSocket endpoints.
 */

const IS_PRODUCTION = false; // 👈 Toggle this for Production/Local

const LOCAL_IP = "192.168.1.8";
const PROD_DOMAIN = "api.mintafresh.com";

// 🚀 API BASE URL
export const API_BASE_URL = IS_PRODUCTION 
    ? `https://${PROD_DOMAIN}/api/v1/minta-fresh` 
    : `http://${LOCAL_IP}:4000/api/v1/minta-fresh`;

// 🔌 WEBSOCKET BASE URL
export const WS_BASE_URL = IS_PRODUCTION
    ? `wss://${PROD_DOMAIN}/ws`
    : `ws://${LOCAL_IP}:4000/ws`;
