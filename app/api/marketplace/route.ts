import { NextResponse } from 'next/server'
import { MarketplaceListing, PlayerAnalytics, PriceHistoryPoint } from '@/lib/types'

// Mock database - in production this would be a real database
let marketplaceListings: MarketplaceListing[] = [
  {
    id: '1',
    playerId: '1',
    sellerId: 'user1',
    sellerName: 'Trader_John',
    shares: 50,
    price: 0.14,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    playerName: 'Patrick Mahomes',
    isActive: true
  },
  {
    id: '2',
    playerId: '2',
    sellerId: 'user2',
    sellerName: 'Fantasy_Pro',
    shares: 25,
    price: 0.11,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    playerName: 'Christian McCaffrey',
    isActive: true
  },
  {
    id: '3',
    playerId: '3',
    sellerId: 'user3',
    sellerName: 'SportsFan_2024',
    shares: 75,
    price: 0.09,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    playerName: 'Tyreek Hill',
    isActive: true
  },
  {
    id: '4',
    playerId: '4',
    sellerId: 'user4',
    sellerName: 'ChiefsKingdom',
    shares: 30,
    price: 0.07,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    playerName: 'Travis Kelce',
    isActive: true
  },
  {
    id: '5',
    playerId: '6',
    sellerId: 'user5',
    sellerName: 'BillsMafia',
    shares: 40,
    price: 0.13,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    playerName: 'Josh Allen',
    isActive: true
  }
]

// Mock price history data
const generatePriceHistory = (playerId: string, basePrice: number): PriceHistoryPoint[] => {
  const history: PriceHistoryPoint[] = []
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  
  for (let i = 30; i >= 0; i--) {
    const timestamp = now - (i * dayMs)
    const volatility = 0.1 // 10% daily volatility
    const randomChange = (Math.random() - 0.5) * volatility
    const price = basePrice * (1 + randomChange)
    const volume = Math.random() * 1000 + 100
    
    history.push({
      timestamp,
      price: Math.max(0.01, price), // Minimum price of $0.01
      volume
    })
  }
  
  return history
}

// Mock player analytics
const playerAnalytics: { [key: string]: PlayerAnalytics } = {
  '1': {
    playerId: '1',
    currentPrice: 0.14,
    priceChange24h: 0.02,
    priceChange7d: 0.05,
    volume24h: 1250,
    volume7d: 8500,
    totalListings: 3,
    lowestAsk: 0.14,
    highestBid: 0.12,
    marketCap: 140000,
    circulatingSupply: 1000000,
    performanceScore: 85.2,
    competitionRank: 1,
    weeklyPerformance: 28.5,
    lastWeekPerformance: 24.3,
    positionWeight: 1.2,
    priceHistory: generatePriceHistory('1', 0.14)
  },
  '2': {
    playerId: '2',
    currentPrice: 0.11,
    priceChange24h: -0.01,
    priceChange7d: 0.03,
    volume24h: 980,
    volume7d: 7200,
    totalListings: 2,
    lowestAsk: 0.11,
    highestBid: 0.10,
    marketCap: 110000,
    circulatingSupply: 1000000,
    performanceScore: 78.9,
    competitionRank: 3,
    weeklyPerformance: 22.1,
    lastWeekPerformance: 19.8,
    positionWeight: 1.0,
    priceHistory: generatePriceHistory('2', 0.11)
  },
  '3': {
    playerId: '3',
    currentPrice: 0.09,
    priceChange24h: 0.015,
    priceChange7d: -0.02,
    volume24h: 750,
    volume7d: 5200,
    totalListings: 1,
    lowestAsk: 0.09,
    highestBid: 0.08,
    marketCap: 90000,
    circulatingSupply: 1000000,
    performanceScore: 72.4,
    competitionRank: 5,
    weeklyPerformance: 18.7,
    lastWeekPerformance: 21.2,
    positionWeight: 0.9,
    priceHistory: generatePriceHistory('3', 0.09)
  },
  '4': {
    playerId: '4',
    currentPrice: 0.07,
    priceChange24h: -0.005,
    priceChange7d: 0.01,
    volume24h: 620,
    volume7d: 4100,
    totalListings: 1,
    lowestAsk: 0.07,
    highestBid: 0.065,
    marketCap: 70000,
    circulatingSupply: 1000000,
    performanceScore: 68.1,
    competitionRank: 8,
    weeklyPerformance: 15.3,
    lastWeekPerformance: 14.9,
    positionWeight: 0.8,
    priceHistory: generatePriceHistory('4', 0.07)
  },
  '6': {
    playerId: '6',
    currentPrice: 0.13,
    priceChange24h: 0.025,
    priceChange7d: 0.08,
    volume24h: 1100,
    volume7d: 7800,
    totalListings: 1,
    lowestAsk: 0.13,
    highestBid: 0.12,
    marketCap: 130000,
    circulatingSupply: 1000000,
    performanceScore: 82.7,
    competitionRank: 2,
    weeklyPerformance: 26.8,
    lastWeekPerformance: 20.1,
    positionWeight: 1.2,
    priceHistory: generatePriceHistory('6', 0.13)
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')
    const action = searchParams.get('action')

    if (action === 'analytics' && playerId) {
      const analytics = playerAnalytics[playerId]
      if (!analytics) {
        return NextResponse.json(
          { success: false, error: 'Player analytics not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, analytics })
    }

    if (action === 'listings' && playerId) {
      const playerListings = marketplaceListings.filter(
        listing => listing.playerId === playerId && listing.isActive
      )
      return NextResponse.json({ success: true, listings: playerListings })
    }

    // Return all active listings
    const activeListings = marketplaceListings.filter(listing => listing.isActive)
    
    return NextResponse.json({ 
      success: true, 
      listings: activeListings,
      totalListings: activeListings.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch marketplace data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, playerId, shares, price, sellerId, sellerName, playerName, listingId } = body

    if (action === 'create-listing') {
      // Validate required fields
      if (!playerId || !shares || !price || !sellerId || !sellerName || !playerName) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Create new listing
      const newListing: MarketplaceListing = {
        id: Date.now().toString(),
        playerId,
        sellerId,
        sellerName,
        shares,
        price,
        playerName,
        createdAt: new Date().toISOString(),
        isActive: true
      }

      marketplaceListings.push(newListing)

      return NextResponse.json({ 
        success: true, 
        listing: newListing,
        message: 'Listing created successfully'
      })
    }

    if (action === 'buy-listing') {
      if (!listingId) {
        return NextResponse.json(
          { success: false, error: 'Listing ID required' },
          { status: 400 }
        )
      }

      const listingIndex = marketplaceListings.findIndex(l => l.id === listingId && l.isActive)
      if (listingIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Listing not found or already sold' },
          { status: 404 }
        )
      }

      const listing = marketplaceListings[listingIndex]
      
      // Mark listing as inactive (sold)
      marketplaceListings[listingIndex] = {
        ...listing,
        isActive: false
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Purchase successful',
        listing: listing
      })
    }

    if (action === 'cancel-listing') {
      if (!listingId) {
        return NextResponse.json(
          { success: false, error: 'Listing ID required' },
          { status: 400 }
        )
      }

      const listingIndex = marketplaceListings.findIndex(l => l.id === listingId && l.isActive)
      if (listingIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Listing not found' },
          { status: 404 }
        )
      }

      // Mark listing as inactive (cancelled)
      marketplaceListings[listingIndex] = {
        ...marketplaceListings[listingIndex],
        isActive: false
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Listing cancelled successfully'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process marketplace action' },
      { status: 500 }
    )
  }
} 