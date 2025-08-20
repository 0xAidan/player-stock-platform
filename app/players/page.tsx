'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Users, TrendingUp, DollarSign, Clock, Zap } from 'lucide-react';
import { Player } from '@/lib/types';

interface ShareListing {
  id: string;
  playerId: string;
  sellerId: string;
  shares: number;
  price: number;
  createdAt: string;
}

interface FreeAgencyPlayer {
  id: string;
  name: string;
  team: string;
  position: string;
  imageUrl?: string;
  basePrice: number;
  availableShares: number;
  totalSupply: number;
  bondingCurvePrice: number;
  positionWeight: number;
}

export default function PlayersPage() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'free-agency'>('marketplace');
  const [players, setPlayers] = useState<Player[]>([]);
  const [freeAgencyPlayers, setFreeAgencyPlayers] = useState<FreeAgencyPlayer[]>([]);
  const [marketplaceListings, setMarketplaceListings] = useState<ShareListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [userBalance, setUserBalance] = useState(1000); // Mock balance
  const [userShares, setUserShares] = useState<{[key: string]: number}>({});

  useEffect(() => {
    fetchPlayers();
    fetchFreeAgencyPlayers();
    fetchMarketplaceListings();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      
      if (data.success) {
        const transformedPlayers: Player[] = data.players.map((player: any) => ({
          id: player.id,
          name: player.name,
          team: player.team,
          position: player.position,
          currentPPR: player.weeklyPerformance,
          lastWeekPPR: player.weeklyPerformance * 0.9,
          tokenSupply: 1000000,
          tokenPrice: player.currentPrice,
          totalBurned: 0,
          totalEmitted: 0,
          isActive: true
        }));
        setPlayers(transformedPlayers);
      }
    } catch (error) {
      console.error('Failed to fetch players:', error);
    }
  };

  const fetchFreeAgencyPlayers = async () => {
    try {
      const response = await fetch('/api/free-agency');
      const data = await response.json();
      
      if (data.success) {
        setFreeAgencyPlayers(data.players);
      }
    } catch (error) {
      console.error('Failed to fetch free agency players:', error);
    }
  };

  const fetchMarketplaceListings = async () => {
    try {
      const response = await fetch('/api/marketplace');
      const data = await response.json();
      
      if (data.success) {
        setMarketplaceListings(data.listings);
      }
    } catch (error) {
      console.error('Failed to fetch marketplace listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyFromMarketplace = async (listingId: string) => {
    const listing = marketplaceListings.find(l => l.id === listingId);
    if (!listing) return;

    const totalCost = listing.shares * listing.price;
    if (userBalance < totalCost) {
      alert('Insufficient balance');
      return;
    }

    // Mock transaction
    setUserBalance(prev => prev - totalCost);
    setUserShares(prev => ({
      ...prev,
      [listing.playerId]: (prev[listing.playerId] || 0) + listing.shares
    }));

    // Remove listing
    setMarketplaceListings(prev => prev.filter(l => l.id !== listingId));
    alert(`Bought ${listing.shares} shares for $${totalCost.toFixed(2)}`);
  };

  const handleInstantSell = async (playerId: string, shares: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const instantPrice = player.tokenPrice * 0.95; // 5% discount for instant sell
    const totalValue = shares * instantPrice;

    setUserBalance(prev => prev + totalValue);
    setUserShares(prev => ({
      ...prev,
      [playerId]: (prev[playerId] || 0) - shares
    }));

    alert(`Instantly sold ${shares} shares for $${totalValue.toFixed(2)}`);
  };

  const handleBuyFromFreeAgency = async (playerId: string, shares: number) => {
    const player = freeAgencyPlayers.find(p => p.id === playerId);
    if (!player) return;

    const totalCost = shares * player.bondingCurvePrice;
    if (userBalance < totalCost) {
      alert('Insufficient balance');
      return;
    }

    setUserBalance(prev => prev - totalCost);
    setUserShares(prev => ({
      ...prev,
      [playerId]: (prev[playerId] || 0) + shares
    }));

    // Update bonding curve price (simplified)
    setFreeAgencyPlayers(prev => prev.map(p => 
      p.id === playerId 
        ? { ...p, bondingCurvePrice: p.bondingCurvePrice * 1.01, availableShares: p.availableShares - shares }
        : p
    ));

    alert(`Bought ${shares} shares from free agency for $${totalCost.toFixed(2)}`);
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.name || 'Unknown Player';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Player Share Marketplace</h1>
        <p className="text-gray-600">Buy and sell NFL player shares or participate in free agency</p>
        
        {/* User Balance */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Your Balance</p>
              <p className="text-2xl font-bold text-green-600">${userBalance.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Shares Owned</p>
              <p className="text-xl font-semibold">{Object.values(userShares).reduce((a, b) => a + b, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'marketplace'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Marketplace</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('free-agency')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'free-agency'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Free Agency</span>
          </div>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Available Listings</h2>
                <p className="text-gray-600">Buy shares from other users or instantly sell your shares</p>
              </div>

              {/* Your Shares */}
              {Object.keys(userShares).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Your Shares</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(userShares).map(([playerId, shares]) => {
                      const player = players.find(p => p.id === playerId);
                      if (!player || shares === 0) return null;
                      
                      return (
                        <div key={playerId} className="bg-white p-4 rounded-lg shadow-sm border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{player.name}</h4>
                              <p className="text-sm text-gray-600">{player.team} • {player.position}</p>
                            </div>
                            <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {shares} shares
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Current Price: ${player.tokenPrice}
                            </span>
                            <button
                              onClick={() => handleInstantSell(playerId, shares)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              Instant Sell
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Listings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Marketplace Listings</h3>
                {marketplaceListings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No shares currently listed for sale</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marketplaceListings.map((listing) => (
                      <div key={listing.id} className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{listing.playerName || getPlayerName(listing.playerId)}</h4>
                            <p className="text-sm text-gray-600">Listed by {listing.sellerName || listing.sellerId}</p>
                          </div>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {listing.shares} shares
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-bold text-green-600">
                            ${listing.price}
                          </span>
                          <span className="text-sm text-gray-600">
                            Total: ${(listing.shares * listing.price).toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleBuyFromMarketplace(listing.id)}
                          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors"
                        >
                          Buy Shares
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Free Agency Tab */}
          {activeTab === 'free-agency' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Free Agency</h2>
                <p className="text-gray-600">Buy new player shares through bonding curve pricing</p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      <strong>Bonding Curve:</strong> Price increases with each purchase. Tuesday/Wednesday special pricing!
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freeAgencyPlayers.map((player) => (
                  <div key={player.id} className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{player.name}</h3>
                        <p className="text-gray-600">{player.team} • {player.position}</p>
                      </div>
                      <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {player.positionWeight}x weight
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Price:</span>
                        <span className="font-semibold">${player.basePrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Price:</span>
                        <span className="font-bold text-green-600">${player.bondingCurvePrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-semibold">{player.availableShares.toLocaleString()} shares</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleBuyFromFreeAgency(player.id, 10)}
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        Buy 10 Shares (${(10 * player.bondingCurvePrice).toFixed(2)})
                      </button>
                      <button
                        onClick={() => handleBuyFromFreeAgency(player.id, 50)}
                        className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition-colors"
                      >
                        Buy 50 Shares (${(50 * player.bondingCurvePrice).toFixed(2)})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}