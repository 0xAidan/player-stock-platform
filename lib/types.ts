export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  imageUrl?: string;
  currentPrice: number;
  totalSupply: number;
  circulatingSupply: number;
  reservedSupply: number;
  weeklyPerformance: number;
  rollingAverage: number;
  positionWeight: number;
  isActive: boolean;
}

export interface PlayerShare {
  tokenId: number;
  playerAddress: string;
  shareAmount: number;
  owner: string;
}

export interface WeeklyEntry {
  user: string;
  players: string[];
  shareAmounts: number[];
  totalScore: number;
  rewardTier: number;
  totalSharesEntered: number; // Total shares entered for proportional rewards
  isActive: boolean;
  entryTime: number;
}

export interface WeeklyCompetition {
  weekNumber: number;
  totalEntries: number;
  totalRewardPool: number;
  leagueAverageScore: number;
  totalSharesEntered: number; // Total shares entered across all participants
  isActive: boolean;
  rewardsDistributed: boolean;
}

export interface Portfolio {
  playerAddress: string;
  sharesOwned: number;
  averagePrice: number;
  totalValue: number;
  profitLoss: number;
}

export interface Trade {
  id: string;
  playerAddress: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: Date;
  txHash?: string;
}

export interface CompetitionRewards {
  user: string;
  weekNumber: number;
  rewardAmount: number;
  tier: number;
  performanceRatio: number;
  sharesEntered: number; // Number of shares entered by user
  proportionalReward: number; // Proportional reward based on shares
}

export interface PositionWeight {
  position: string;
  weight: number;
  description: string;
}

export interface BondingCurveSale {
  playerAddress: string;
  sharesIssued: number;
  price: number;
  timestamp: number;
  weekNumber: number;
}

export interface AMMTrade {
  playerAddress: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  discount: number;
  timestamp: number;
}

// Enhanced marketplace types
export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
  volume: number;
}

// Updated to support fractional shares and time-based priority
export interface MarketplaceListing {
  id: string;
  playerId: string;
  sellerId: string;
  sellerName: string;
  shares: number; // Now supports fractional shares (e.g., 0.1, 1.5, etc.)
  price: number;
  createdAt: string;
  playerName: string;
  expiresAt?: string;
  isActive: boolean;
  remainingShares: number; // Track remaining shares for partial fills
  totalValue: number; // Total value of the listing
}

// New order book types
export interface OrderBookLevel {
  price: number;
  totalShares: number;
  orderCount: number;
  orders: OrderBookOrder[];
}

export interface OrderBookOrder {
  id: string;
  sellerId: string;
  sellerName: string;
  shares: number;
  remainingShares: number;
  createdAt: string;
  listingId: string;
}

export interface OrderBook {
  playerId: string;
  asks: OrderBookLevel[]; // Sell orders (ascending by price)
  bids: OrderBookLevel[]; // Buy orders (descending by price)
  lastUpdated: string;
}

// Enhanced trade execution
export interface TradeExecution {
  id: string;
  buyerId: string;
  sellerId: string;
  playerId: string;
  shares: number;
  price: number;
  totalValue: number;
  executedAt: string;
  listingId: string;
  partialFill: boolean;
}

// User balance tracking for custodial system
export interface UserBalance {
  userId: string;
  usdcBalance: number;
  lastUpdated: string;
}

export interface PlayerStakingPosition {
  player: string;
  amount: number;
  startTime: number;
  lockEndTime: number;
  lastRewardClaim: number;
  isActive: boolean;
  performanceMultiplier: number; // Frozen multiplier at stake time
}

export interface PlayerAnalytics {
  playerId: string;
  currentPrice: number;
  priceChange24h: number;
  priceChange7d: number;
  volume24h: number;
  volume7d: number;
  totalListings: number;
  lowestAsk: number;
  highestBid: number;
  marketCap: number;
  circulatingSupply: number;
  performanceScore: number;
  competitionRank?: number;
  weeklyPerformance: number;
  lastWeekPerformance: number;
  positionWeight: number;
  priceHistory: PriceHistoryPoint[];
}

export interface UserPortfolio {
  playerId: string;
  sharesOwned: number;
  averagePrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  lastUpdated: string;
}

export interface TradeOrder {
  id: string;
  playerId: string;
  userId: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled';
  createdAt: string;
  filledAt?: string;
  totalValue: number;
}