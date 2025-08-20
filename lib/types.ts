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
  isActive: boolean;
  entryTime: number;
}

export interface WeeklyCompetition {
  weekNumber: number;
  totalEntries: number;
  totalRewardPool: number;
  leagueAverageScore: number;
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