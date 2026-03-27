// API client for Swarm Arena backend

// Base URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginationMeta {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Game State types
export interface GameStateData {
  currentCycle: number;
  cycleStartSlot: number;
  cycleEndSlot: number;
  totalValueLocked: string;
  totalExposedValue: string;
  activePlayers: number;
  cycleResolved: boolean;
  lastUpdateSlot: number;
}

// Cycle types
export interface CycleData {
  cycleNumber: number;
  startSlot: number;
  endSlot: number;
  resolvedSlot: number;
  totalValueLocked: string;
  totalExposedValue: string;
  totalRedistributed: string;
  feesCollected: string;
  participants: number;
  winners: number;
  resolved: boolean;
  resolvedAt?: string;
}

// Player types
export interface PlayerData {
  wallet: string;
  balance: string;
  totalDeposited: string;
  totalWithdrawn: string;
  exposure: number;
  exposedValue: string;
  cyclesParticipated: number;
  totalRedistributed: string;
  participatingInCycle: boolean;
  score: string;
  registeredAt: string;
  lastActionAt?: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  score: string;
  balance: string;
  totalRedistributed: string;
  cyclesParticipated: number;
  exposure: number;
  participatingInCycle: boolean;
}

// Activity types
export type ActivityType = 'deposit' | 'withdraw' | 'exposure' | 'cycle' | 'redistribution';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  wallet?: string;
  amount?: string;
  exposure?: number;
  cycleNumber?: number;
  timestamp: string;
  signature?: string;
}

// Stats types
export interface GlobalStats {
  totalPlayers: number;
  activePlayers: number;
  totalValueLocked: string;
  totalExposedValue: string;
  totalCycles: number;
  totalFeesCollected: string;
  totalRedistributed: string;
}

// Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || data.message || 'API request failed',
        response.status,
        data.code
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or parsing error
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

/**
 * GET request helper
 */
async function get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  const queryString = params
    ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';

  return apiFetch<T>(`${endpoint}${queryString}`, {
    method: 'GET',
  });
}

/**
 * POST request helper
 */
async function post<T>(endpoint: string, body?: any): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ============================================================================
// Health Endpoints
// ============================================================================

/**
 * Check API health
 */
export async function checkHealth(): Promise<{
  status: string;
  timestamp: string;
  uptime: number;
}> {
  const response = await get<{
    status: string;
    timestamp: string;
    uptime: number;
  }>('/health');
  return response;
}

/**
 * Check API readiness
 */
export async function checkReadiness(): Promise<{
  status: string;
  timestamp: string;
}> {
  const response = await get<{
    status: string;
    timestamp: string;
  }>('/health/ready');
  return response;
}

// ============================================================================
// Game State Endpoints
// ============================================================================

/**
 * Get current game state
 */
export async function getGameState(): Promise<GameStateData> {
  const response = await get<ApiResponse<GameStateData>>('/game/state');
  return response.data;
}

/**
 * Get historical cycles
 */
export async function getCycles(
  limit: number = 20,
  offset: number = 0
): Promise<PaginatedResponse<CycleData>> {
  const response = await get<ApiResponse<PaginatedResponse<CycleData>>>(
    '/game/cycles',
    { limit, offset }
  );
  return response.data;
}

/**
 * Get specific cycle details
 */
export async function getCycle(cycleNumber: number): Promise<CycleData> {
  const response = await get<ApiResponse<CycleData>>(
    `/game/cycles/${cycleNumber}`
  );
  return response.data;
}

/**
 * Get current cycle number
 */
export async function getCurrentCycle(): Promise<number> {
  const gameState = await getGameState();
  return gameState.currentCycle;
}

// ============================================================================
// Leaderboard Endpoints
// ============================================================================

export type LeaderboardSortBy = 'score' | 'balance' | 'cycles' | 'totalRedistributed';

/**
 * Get player leaderboard
 */
export async function getLeaderboard(
  limit: number = 50,
  offset: number = 0,
  sortBy: LeaderboardSortBy = 'score'
): Promise<PaginatedResponse<LeaderboardEntry>> {
  const response = await get<ApiResponse<PaginatedResponse<LeaderboardEntry>>>(
    '/game/leaderboard',
    { limit, offset, sortBy }
  );
  return response.data;
}

/**
 * Get top players (shorthand for leaderboard)
 */
export async function getTopPlayers(
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const result = await getLeaderboard(limit, 0, 'score');
  return result.data;
}

// ============================================================================
// Activity Endpoints
// ============================================================================

/**
 * Get recent activity/events
 */
export async function getActivity(
  limit: number = 20,
  offset: number = 0,
  type?: ActivityType
): Promise<PaginatedResponse<ActivityEvent>> {
  const response = await get<ApiResponse<PaginatedResponse<ActivityEvent>>>(
    '/game/activity',
    { limit, offset, type }
  );
  return response.data;
}

/**
 * Get recent activity (shorthand)
 */
export async function getRecentActivity(
  limit: number = 20
): Promise<ActivityEvent[]> {
  const result = await getActivity(limit, 0);
  return result.data;
}

// ============================================================================
// Player Endpoints
// ============================================================================

/**
 * Get player state by wallet address
 */
export async function getPlayer(wallet: string): Promise<PlayerData> {
  const response = await get<ApiResponse<PlayerData>>(
    `/game/player/${wallet}`
  );
  return response.data;
}

/**
 * Check if player exists
 */
export async function playerExists(wallet: string): Promise<boolean> {
  try {
    await getPlayer(wallet);
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return false;
    }
    throw error;
  }
}

// ============================================================================
// Stats Endpoints
// ============================================================================

/**
 * Get global statistics
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  const response = await get<ApiResponse<GlobalStats>>('/game/stats');
  return response.data;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format lamports to SOL string
 */
export function formatLamportsToSol(lamports: string | number): string {
  const value = typeof lamports === 'string' ? parseFloat(lamports) : lamports;
  return (value / 1e9).toFixed(4);
}

/**
 * Format SOL amount with proper decimals
 */
export function formatSol(sol: number, decimals: number = 4): string {
  return sol.toFixed(decimals);
}

/**
 * Parse API error message
 */
export function parseApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Retry API call with exponential backoff
 */
export async function retryApiCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Create API client with custom base URL
 */
export function createApiClient(baseUrl: string) {
  const originalBaseUrl = API_BASE_URL;
  
  return {
    setBaseUrl: (url: string) => {
      // Note: This modifies the module-level constant
      // In production, consider using a class-based approach
      Object.defineProperty(globalThis, 'API_BASE_URL', {
        value: url,
        writable: true,
      });
    },
    resetBaseUrl: () => {
      Object.defineProperty(globalThis, 'API_BASE_URL', {
        value: originalBaseUrl,
        writable: true,
      });
    },
  };
}

/**
 * Batch fetch multiple players
 */
export async function getPlayers(wallets: string[]): Promise<(PlayerData | null)[]> {
  const promises = wallets.map(wallet =>
    getPlayer(wallet).catch(() => null)
  );
  return Promise.all(promises);
}

/**
 * Get player rank from leaderboard
 */
export async function getPlayerRank(wallet: string): Promise<number | null> {
  try {
    // Fetch leaderboard in chunks until we find the player
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const result = await getLeaderboard(limit, offset);
      
      const entry = result.data.find(e => e.wallet === wallet);
      if (entry) {
        return entry.rank;
      }
      
      if (!result.pagination.hasMore) {
        break;
      }
      
      offset += limit;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching player rank:', error);
    return null;
  }
}

/**
 * Subscribe to real-time updates (WebSocket placeholder)
 */
export function subscribeToUpdates(
  onUpdate: (data: any) => void,
  onError?: (error: Error) => void
): () => void {
  // TODO: Implement WebSocket connection
  console.warn('WebSocket subscription not yet implemented');
  
  // Return unsubscribe function
  return () => {
    console.log('Unsubscribed from updates');
  };
}

// Export all functions as default API client
export default {
  // Health
  checkHealth,
  checkReadiness,
  
  // Game State
  getGameState,
  getCycles,
  getCycle,
  getCurrentCycle,
  
  // Leaderboard
  getLeaderboard,
  getTopPlayers,
  getPlayerRank,
  
  // Activity
  getActivity,
  getRecentActivity,
  
  // Player
  getPlayer,
  getPlayers,
  playerExists,
  
  // Stats
  getGlobalStats,
  
  // Utilities
  formatLamportsToSol,
  formatSol,
  parseApiError,
  retryApiCall,
  subscribeToUpdates,
};
