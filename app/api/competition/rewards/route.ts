import { NextRequest, NextResponse } from 'next/server';

export interface CompetitionRewardCalculation {
  user: string;
  weekNumber: number;
  totalScore: number;
  rewardTier: number;
  sharesEntered: number;
  totalSharesInCompetition: number;
  baseRewardPerShare: number;
  proportionalReward: number;
  performanceRatio: number;
}

export async function POST(request: NextRequest) {
  try {
    const { user, weekNumber } = await request.json();

    // Mock data - in real implementation this would come from the smart contract
    const mockCompetitionData = {
      totalRewardPool: 10000, // $10,000
      totalSharesEntered: 500, // 500 total shares across all participants
      leagueAverageScore: 20,
    };

    const mockUserEntry = {
      totalScore: 25, // User's total score
      sharesEntered: 5, // User's total shares entered
      performanceRatio: 1.25, // 25/20
    };

    // Calculate tier based on performance ratio
    const getTier = (performanceRatio: number): number => {
      if (performanceRatio >= 1.5) return 1; // Top 10%
      if (performanceRatio >= 1.3) return 2; // 11-25%
      if (performanceRatio >= 1.1) return 3; // 26-50%
      if (performanceRatio >= 1.0) return 4; // 51-75%
      return 0; // No reward
    };

    const tier = getTier(mockUserEntry.performanceRatio);
    
    // Calculate proportional reward
    const baseRewardPerShare = mockCompetitionData.totalRewardPool / mockCompetitionData.totalSharesEntered;
    const proportionalReward = baseRewardPerShare * mockUserEntry.sharesEntered;

    const calculation: CompetitionRewardCalculation = {
      user,
      weekNumber,
      totalScore: mockUserEntry.totalScore,
      rewardTier: tier,
      sharesEntered: mockUserEntry.sharesEntered,
      totalSharesInCompetition: mockCompetitionData.totalSharesEntered,
      baseRewardPerShare,
      proportionalReward,
      performanceRatio: mockUserEntry.performanceRatio,
    };

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error calculating competition rewards:', error);
    return NextResponse.json(
      { error: 'Failed to calculate rewards' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekNumber = searchParams.get('weekNumber');

    // Mock competition statistics
    const mockStats = {
      weekNumber: parseInt(weekNumber || '1'),
      totalEntries: 150,
      totalRewardPool: 10000,
      totalSharesEntered: 500,
      leagueAverageScore: 20,
      isActive: true,
      rewardsDistributed: false,
    };

    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('Error fetching competition stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competition stats' },
      { status: 500 }
    );
  }
} 