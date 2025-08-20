import { NextResponse } from 'next/server'

// Mock marketplace data - in production this would come from a database
const marketplaceListings = [
  {
    id: '1',
    playerId: '1',
    sellerId: 'user1',
    sellerName: 'Trader_John',
    shares: 50,
    price: 0.14,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    playerName: 'Patrick Mahomes'
  },
  {
    id: '2',
    playerId: '2',
    sellerId: 'user2',
    sellerName: 'Fantasy_Pro',
    shares: 25,
    price: 0.11,
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    playerName: 'Christian McCaffrey'
  },
  {
    id: '3',
    playerId: '3',
    sellerId: 'user3',
    sellerName: 'SportsFan_2024',
    shares: 75,
    price: 0.09,
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    playerName: 'Tyreek Hill'
  },
  {
    id: '4',
    playerId: '4',
    sellerId: 'user4',
    sellerName: 'ChiefsKingdom',
    shares: 30,
    price: 0.07,
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    playerName: 'Travis Kelce'
  },
  {
    id: '5',
    playerId: '6',
    sellerId: 'user5',
    sellerName: 'BillsMafia',
    shares: 40,
    price: 0.13,
    createdAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
    playerName: 'Josh Allen'
  }
]

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      listings: marketplaceListings,
      totalListings: marketplaceListings.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch marketplace listings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { playerId, shares, price, sellerId, sellerName, playerName } = body

    // Validate required fields
    if (!playerId || !shares || !price || !sellerId || !sellerName || !playerName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new listing
    const newListing = {
      id: Date.now().toString(),
      playerId,
      sellerId,
      sellerName,
      shares,
      price,
      playerName,
      createdAt: new Date().toISOString()
    }

    // In production, this would save to database
    // For now, just return the new listing
    return NextResponse.json({ 
      success: true, 
      listing: newListing,
      message: 'Listing created successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    )
  }
} 