import { NextResponse } from 'next/server'

// Mock NFL player data - in production this would come from a database
const players = [
  {
    id: '1',
    name: 'Patrick Mahomes',
    team: 'KC',
    position: 'QB',
    imageUrl: 'https://example.com/mahomes.jpg',
    currentPrice: 0.15,
    sharesOwned: 50,
    weeklyPerformance: 28.5,
    positionWeight: 1.2,
    stats: {
      passingYards: 4183,
      touchdowns: 31,
      interceptions: 8,
      rushingYards: 389
    }
  },
  {
    id: '2',
    name: 'Christian McCaffrey',
    team: 'SF',
    position: 'RB',
    imageUrl: 'https://example.com/mccaffrey.jpg',
    currentPrice: 0.12,
    sharesOwned: 75,
    weeklyPerformance: 24.2,
    positionWeight: 1.0,
    stats: {
      rushingYards: 1459,
      rushingTouchdowns: 14,
      receivingYards: 564,
      receivingTouchdowns: 7
    }
  },
  {
    id: '3',
    name: 'Tyreek Hill',
    team: 'MIA',
    position: 'WR',
    imageUrl: 'https://example.com/hill.jpg',
    currentPrice: 0.10,
    sharesOwned: 60,
    weeklyPerformance: 22.8,
    positionWeight: 0.9,
    stats: {
      receivingYards: 1799,
      receivingTouchdowns: 13,
      receptions: 119,
      targets: 171
    }
  },
  {
    id: '4',
    name: 'Travis Kelce',
    team: 'KC',
    position: 'TE',
    imageUrl: 'https://example.com/kelce.jpg',
    currentPrice: 0.08,
    sharesOwned: 40,
    weeklyPerformance: 18.5,
    positionWeight: 0.8,
    stats: {
      receivingYards: 984,
      receivingTouchdowns: 5,
      receptions: 93,
      targets: 121
    }
  },
  {
    id: '5',
    name: 'Justin Tucker',
    team: 'BAL',
    position: 'K',
    imageUrl: 'https://example.com/tucker.jpg',
    currentPrice: 0.05,
    sharesOwned: 30,
    weeklyPerformance: 12.3,
    positionWeight: 0.7,
    stats: {
      fieldGoals: 32,
      fieldGoalPercentage: 89.7,
      extraPoints: 35,
      extraPointPercentage: 100
    }
  },
  {
    id: '6',
    name: 'Josh Allen',
    team: 'BUF',
    position: 'QB',
    imageUrl: 'https://example.com/allen.jpg',
    currentPrice: 0.14,
    sharesOwned: 45,
    weeklyPerformance: 26.1,
    positionWeight: 1.2,
    stats: {
      passingYards: 4306,
      touchdowns: 35,
      interceptions: 14,
      rushingYards: 762
    }
  },
  {
    id: '7',
    name: 'Saquon Barkley',
    team: 'NYG',
    position: 'RB',
    imageUrl: 'https://example.com/barkley.jpg',
    currentPrice: 0.11,
    sharesOwned: 55,
    weeklyPerformance: 20.8,
    positionWeight: 1.0,
    stats: {
      rushingYards: 962,
      rushingTouchdowns: 6,
      receivingYards: 280,
      receivingTouchdowns: 4
    }
  },
  {
    id: '8',
    name: 'Stefon Diggs',
    team: 'BUF',
    position: 'WR',
    imageUrl: 'https://example.com/diggs.jpg',
    currentPrice: 0.09,
    sharesOwned: 65,
    weeklyPerformance: 21.2,
    positionWeight: 0.9,
    stats: {
      receivingYards: 1183,
      receivingTouchdowns: 8,
      receptions: 107,
      targets: 160
    }
  }
]

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      players,
      totalPlayers: players.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
} 