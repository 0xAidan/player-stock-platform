import { NextResponse } from 'next/server'

// Mock free agency data - in production this would come from a database
const freeAgencyPlayers = [
  {
    id: 'fa1',
    name: 'CJ Stroud',
    team: 'HOU',
    position: 'QB',
    imageUrl: 'https://example.com/stroud.jpg',
    basePrice: 0.08,
    availableShares: 1000,
    totalSupply: 10000,
    bondingCurvePrice: 0.12,
    positionWeight: 1.2,
    stats: {
      passingYards: 4108,
      touchdowns: 23,
      interceptions: 5,
      rushingYards: 167
    }
  },
  {
    id: 'fa2',
    name: 'Bijan Robinson',
    team: 'ATL',
    position: 'RB',
    imageUrl: 'https://example.com/robinson.jpg',
    basePrice: 0.06,
    availableShares: 1500,
    totalSupply: 12000,
    bondingCurvePrice: 0.09,
    positionWeight: 1.0,
    stats: {
      rushingYards: 976,
      rushingTouchdowns: 4,
      receivingYards: 487,
      receivingTouchdowns: 4
    }
  },
  {
    id: 'fa3',
    name: 'Puka Nacua',
    team: 'LAR',
    position: 'WR',
    imageUrl: 'https://example.com/nacua.jpg',
    basePrice: 0.05,
    availableShares: 2000,
    totalSupply: 15000,
    bondingCurvePrice: 0.07,
    positionWeight: 0.9,
    stats: {
      receivingYards: 1486,
      receivingTouchdowns: 6,
      receptions: 105,
      targets: 160
    }
  },
  {
    id: 'fa4',
    name: 'Sam LaPorta',
    team: 'DET',
    position: 'TE',
    imageUrl: 'https://example.com/laporta.jpg',
    basePrice: 0.04,
    availableShares: 1200,
    totalSupply: 8000,
    bondingCurvePrice: 0.06,
    positionWeight: 0.8,
    stats: {
      receivingYards: 889,
      receivingTouchdowns: 10,
      receptions: 86,
      targets: 120
    }
  },
  {
    id: 'fa5',
    name: 'Jake Moody',
    team: 'SF',
    position: 'K',
    imageUrl: 'https://example.com/moody.jpg',
    basePrice: 0.03,
    availableShares: 800,
    totalSupply: 5000,
    bondingCurvePrice: 0.04,
    positionWeight: 0.7,
    stats: {
      fieldGoals: 21,
      fieldGoalPercentage: 84.0,
      extraPoints: 60,
      extraPointPercentage: 100
    }
  }
]

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      players: freeAgencyPlayers,
      totalPlayers: freeAgencyPlayers.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch free agency players' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { playerId, shares, buyerId } = body

    // Validate required fields
    if (!playerId || !shares || !buyerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the player
    const player = freeAgencyPlayers.find(p => p.id === playerId)
    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }

    // Check if enough shares are available
    if (player.availableShares < shares) {
      return NextResponse.json(
        { success: false, error: 'Insufficient shares available' },
        { status: 400 }
      )
    }

    // Calculate total cost
    const totalCost = shares * player.bondingCurvePrice

    // In production, this would update the database
    // For now, just return the transaction details
    return NextResponse.json({ 
      success: true, 
      transaction: {
        playerId,
        playerName: player.name,
        shares,
        pricePerShare: player.bondingCurvePrice,
        totalCost,
        buyerId,
        timestamp: new Date().toISOString()
      },
      message: 'Purchase successful'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process purchase' },
      { status: 500 }
    )
  }
} 