// Frontend constants for Swarm Arena

// ============================================================================
// Exposure Configuration
// ============================================================================

export const EXPOSURE = {
  MIN: 0,
  MAX: 100,
  DEFAULT: 0,
  PRESETS: [0, 25, 50, 75, 100],
  STEP: 1,
} as const;

// ============================================================================
// Risk Levels
// ============================================================================

export const RISK_LEVELS = {
  NONE: {
    label: 'No Risk',
    color: 'text-gray-400',
    gradient: 'from-gray-500 to-gray-600',
    min: 0,
    max: 0,
  },
  LOW: {
    label: 'Low Risk',
    color: 'text-green-400',
    gradient: 'from-green-500 to-green-600',
    min: 1,
    max: 24,
  },
  MEDIUM: {
    label: 'Medium Risk',
    color: 'text-yellow-400',
    gradient: 'from-yellow-500 to-yellow-600',
    min: 25,
    max: 49,
  },
  HIGH: {
    label: 'High Risk',
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-orange-600',
    min: 50,
    max: 74,
  },
  MAXIMUM: {
    label: 'Maximum Risk',
    color: 'text-red-400',
    gradient: 'from-red-500 to-red-600',
    min: 75,
    max: 100,
  },
} as const;

// ============================================================================
// Rank Tiers
// ============================================================================

export const RANK_TIERS = {
  FIRST: {
    rank: 1,
    label: '1st',
    bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    border: 'border-yellow-500/50',
    text: 'text-yellow-900',
    iconColor: 'text-yellow-400',
  },
  SECOND: {
    rank: 2,
    label: '2nd',
    bg: 'bg-gradient-to-r from-gray-300 to-gray-400',
    border: 'border-gray-300/50',
    text: 'text-gray-900',
    iconColor: 'text-gray-300',
  },
  THIRD: {
    rank: 3,
    label: '3rd',
    bg: 'bg-gradient-to-r from-amber-600 to-amber-700',
    border: 'border-amber-600/50',
    text: 'text-amber-900',
    iconColor: 'text-amber-600',
  },
  TOP_10: {
    min: 4,
    max: 10,
    bg: 'bg-gradient-to-r from-purple-600 to-purple-700',
    border: 'border-purple-500/50',
    text: 'text-white',
    iconColor: 'text-purple-400',
  },
  TOP_100: {
    min: 11,
    max: 100,
    bg: 'bg-gradient-to-r from-blue-600 to-blue-700',
    border: 'border-blue-500/50',
    text: 'text-white',
    iconColor: 'text-blue-400',
  },
  DEFAULT: {
    bg: 'bg-white/10',
    border: 'border-white/20',
    text: 'text-gray-300',
    iconColor: 'text-gray-400',
  },
} as const;

// ============================================================================
// Theme Colors
// ============================================================================

export const COLORS = {
  // Primary brand colors
  PRIMARY: {
    purple: {
      light: '#a855f7',
      DEFAULT: '#9333ea',
      dark: '#7e22ce',
    },
    blue: {
      light: '#3b82f6',
      DEFAULT: '#2563eb',
      dark: '#1d4ed8',
    },
    pink: {
      light: '#ec4899',
      DEFAULT: '#db2777',
      dark: '#be185d',
    },
  },
  
  // Status colors
  STATUS: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Gradient combinations
  GRADIENTS: {
    primary: 'from-purple-600 to-blue-600',
    secondary: 'from-pink-500 to-purple-600',
    success: 'from-green-500 to-emerald-600',
    warning: 'from-yellow-500 to-orange-600',
    danger: 'from-red-500 to-pink-600',
    gold: 'from-yellow-500 to-orange-500',
  },
} as const;

// ============================================================================
// UI Configuration
// ============================================================================

export const UI = {
  // Animation durations (ms)
  ANIMATION: {
    FAST: 150,
    DEFAULT: 200,
    SLOW: 300,
    VERY_SLOW: 500,
  },
  
  // Polling intervals (ms)
  POLLING: {
    FAST: 1000,      // 1 second
    DEFAULT: 5000,   // 5 seconds
    SLOW: 10000,     // 10 seconds
    VERY_SLOW: 30000, // 30 seconds
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    LEADERBOARD_LIMIT: 50,
    ACTIVITY_LIMIT: 20,
    CYCLES_LIMIT: 20,
  },
  
  // Display limits
  DISPLAY: {
    MAX_WALLET_CHARS: 4,
    MAX_LEADERBOARD_PREVIEW: 5,
    MAX_ACTIVITY_PREVIEW: 10,
    MAX_RECENT_CYCLES: 5,
  },
  
  // Breakpoints (matches Tailwind)
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const;

// ============================================================================
// Game Configuration
// ============================================================================

export const GAME = {
  // Protocol fee
  PROTOCOL_FEE_BPS: 200, // 2%
  PROTOCOL_FEE_PERCENT: 2,
  
  // Deposit limits (in lamports)
  MIN_DEPOSIT: 1_000_000, // 0.001 SOL
  MAX_DEPOSIT: 1_000_000_000, // 1 SOL
  
  // Deposit limits (in SOL for display)
  MIN_DEPOSIT_SOL: 0.001,
  MAX_DEPOSIT_SOL: 1,
  
  // Cycle configuration
  CYCLE_DURATION_SLOTS: 100,
  EXPOSURE_COOLDOWN_SLOTS: 10,
  
  // Slot timing (approximate)
  SLOT_TIME_MS: 400, // ~400ms per slot on Solana
  
  // Calculated durations (approximate)
  CYCLE_DURATION_MS: 100 * 400, // ~40 seconds
  EXPOSURE_COOLDOWN_MS: 10 * 400, // ~4 seconds
} as const;

// ============================================================================
// Format Configuration
// ============================================================================

export const FORMAT = {
  // Number formatting
  DECIMALS: {
    SOL: 4,
    PERCENTAGE: 2,
    SCORE: 0,
    LARGE_NUMBER: 0,
  },
  
  // Date/time formats
  DATE: {
    SHORT: 'MMM d',
    LONG: 'MMM d, yyyy',
    WITH_TIME: 'MMM d, yyyy HH:mm',
    TIME_ONLY: 'HH:mm:ss',
  },
  
  // Number abbreviations
  ABBREVIATIONS: {
    THOUSAND: 'K',
    MILLION: 'M',
    BILLION: 'B',
  },
} as const;

// ============================================================================
// Activity Event Types
// ============================================================================

export const ACTIVITY_TYPES = {
  DEPOSIT: {
    type: 'deposit',
    label: 'Deposit',
    icon: '↓',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  WITHDRAW: {
    type: 'withdraw',
    label: 'Withdraw',
    icon: '↑',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  EXPOSURE: {
    type: 'exposure',
    label: 'Exposure Change',
    icon: '⚡',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  CYCLE: {
    type: 'cycle',
    label: 'Cycle Resolved',
    icon: '🔄',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  REDISTRIBUTION: {
    type: 'redistribution',
    label: 'Redistribution',
    icon: '💰',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  REGISTER: {
    type: 'register',
    label: 'Player Registered',
    icon: '👤',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  BELOW_MIN_DEPOSIT: `Minimum deposit is ${GAME.MIN_DEPOSIT_SOL} SOL`,
  ABOVE_MAX_DEPOSIT: `Maximum deposit is ${GAME.MAX_DEPOSIT_SOL} SOL`,
  INVALID_EXPOSURE: `Exposure must be between ${EXPOSURE.MIN}% and ${EXPOSURE.MAX}%`,
  EXPOSURE_COOLDOWN: 'Please wait before changing exposure again',
  ACTIVE_EXPOSURE: 'Cannot withdraw with active exposure. Set exposure to 0% first',
  TRANSACTION_FAILED: 'Transaction failed. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  PLAYER_NOT_REGISTERED: 'Player not registered. Please register first',
  CYCLE_NOT_ENDED: 'Cycle has not ended yet',
  ALREADY_CLAIMED: 'Redistribution already claimed for this cycle',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  PLAYER_REGISTERED: 'Player registered successfully',
  DEPOSIT_SUCCESS: 'Deposit successful',
  WITHDRAW_SUCCESS: 'Withdrawal successful',
  EXPOSURE_UPDATED: 'Exposure updated successfully',
  CLAIM_SUCCESS: 'Redistribution claimed successfully',
  TRANSACTION_CONFIRMED: 'Transaction confirmed',
} as const;

// ============================================================================
// Routes
// ============================================================================

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LEADERBOARD: '/leaderboard',
  ACTIVITY: '/activity',
  PROFILE: '/profile',
} as const;

// ============================================================================
// External Links
// ============================================================================

export const LINKS = {
  DOCS: 'https://docs.swarmarena.io',
  GITHUB: 'https://github.com/swarmarena',
  TWITTER: 'https://twitter.com/swarmarena',
  DISCORD: 'https://discord.gg/swarmarena',
  SOLANA_EXPLORER: 'https://explorer.solana.com',
} as const;

// ============================================================================
// Local Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  WALLET_PREFERENCE: 'swarm_wallet_preference',
  THEME_PREFERENCE: 'swarm_theme_preference',
  LAST_VISITED: 'swarm_last_visited',
  TUTORIAL_COMPLETED: 'swarm_tutorial_completed',
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get risk level for exposure value
 */
export function getRiskLevel(exposure: number) {
  if (exposure === 0) return RISK_LEVELS.NONE;
  if (exposure < 25) return RISK_LEVELS.LOW;
  if (exposure < 50) return RISK_LEVELS.MEDIUM;
  if (exposure < 75) return RISK_LEVELS.HIGH;
  return RISK_LEVELS.MAXIMUM;
}

/**
 * Get rank tier for rank number
 */
export function getRankTier(rank: number) {
  if (rank === 1) return RANK_TIERS.FIRST;
  if (rank === 2) return RANK_TIERS.SECOND;
  if (rank === 3) return RANK_TIERS.THIRD;
  if (rank <= 10) return RANK_TIERS.TOP_10;
  if (rank <= 100) return RANK_TIERS.TOP_100;
  return RANK_TIERS.DEFAULT;
}

/**
 * Get activity type configuration
 */
export function getActivityType(type: string) {
  const typeUpper = type.toUpperCase() as keyof typeof ACTIVITY_TYPES;
  return ACTIVITY_TYPES[typeUpper] || ACTIVITY_TYPES.DEPOSIT;
}

/**
 * Format number with abbreviations
 */
export function formatNumberAbbreviated(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + FORMAT.ABBREVIATIONS.BILLION;
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + FORMAT.ABBREVIATIONS.MILLION;
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + FORMAT.ABBREVIATIONS.THOUSAND;
  }
  return num.toString();
}

/**
 * Check if value is within exposure range
 */
export function isValidExposure(value: number): boolean {
  return value >= EXPOSURE.MIN && value <= EXPOSURE.MAX;
}

/**
 * Check if value is within deposit range (in lamports)
 */
export function isValidDeposit(lamports: number): boolean {
  return lamports >= GAME.MIN_DEPOSIT && lamports <= GAME.MAX_DEPOSIT;
}

/**
 * Calculate cycle progress percentage
 */
export function calculateCycleProgress(
  currentSlot: number,
  startSlot: number,
  endSlot: number
): number {
  if (currentSlot < startSlot) return 0;
  if (currentSlot >= endSlot) return 100;
  
  const elapsed = currentSlot - startSlot;
  const total = endSlot - startSlot;
  return Math.round((elapsed / total) * 100);
}

/**
 * Calculate remaining time in cycle (ms)
 */
export function calculateRemainingTime(
  currentSlot: number,
  endSlot: number
): number {
  if (currentSlot >= endSlot) return 0;
  
  const remainingSlots = endSlot - currentSlot;
  return remainingSlots * GAME.SLOT_TIME_MS;
}
