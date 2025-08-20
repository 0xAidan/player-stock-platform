'use client';

import { useState, useEffect } from 'react';
import { Player, PlayerAnalytics, MarketplaceListing } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, DollarSign, BarChart3, ShoppingCart, Plus, Eye, Clock, Users, X, Zap } from 'lucide-react';
import PriceChart from './PriceChart';

interface PlayerCardProps {
  player: Player;
  onTrade: (playerId: string) => void;
  userAddress?: string;
  userShares?: number;
}

export default function PlayerCard({ player, onTrade, userAddress, userShares = 0 }: PlayerCardProps) {
  const [analytics, setAnalytics] = useState<PlayerAnalytics | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [listShares, setListShares] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [bondingCurveShares, setBondingCurveShares] = useState('10');

  useEffect(() => {
    fetchPlayerData();
  }, [player.id]);

  const fetchPlayerData = async () => {
    try {
      // Fetch analytics
      const analyticsResponse = await fetch(`/api/marketplace?action=analytics&playerId=${player.id}`);
      const analyticsData = await analyticsResponse.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }

      // Fetch listings
      const listingsResponse = await fetch(`/api/marketplace?action=listings&playerId=${player.id}`);
      const listingsData = await listingsResponse.json();
      if (listingsData.success) {
        setListings(listingsData.listings);
      }
    } catch (error) {
      console.error('Failed to fetch player data:', error);
    }
  };

  const handleListShares = async () => {
    if (!userAddress || !listShares || !listPrice) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-listing',
          playerId: player.id,
          shares: parseInt(listShares),
          price: parseFloat(listPrice),
          sellerId: userAddress,
          sellerName: userAddress.slice(0, 8) + '...',
          playerName: player.name
        })
      });

      const data = await response.json();
      if (data.success) {
        setListModalOpen(false);
        setListShares('');
        setListPrice('');
        fetchPlayerData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to list shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyShares = async (listingId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy-listing',
          listingId
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchPlayerData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to buy shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBondingCurvePurchase = async () => {
    if (!userAddress || !bondingCurveShares) return;
    
    setLoading(true);
    try {
      // Mock bonding curve purchase
      const shares = parseInt(bondingCurveShares);
      const basePrice = analytics?.currentPrice || 0.1;
      const bondingCurvePrice = basePrice * Math.pow(1.01, shares); // Simple bonding curve
      const totalCost = shares * bondingCurvePrice;
      
      // In real implementation, this would call the bonding curve contract
      console.log(`Bought ${shares} shares via bonding curve for $${totalCost.toFixed(2)}`);
      
      // Refresh data
      fetchPlayerData();
    } catch (error) {
      console.error('Failed to purchase via bonding curve:', error);
    } finally {
      setLoading(false);
    }
  };

  const lowestPrice = listings.length > 0 ? Math.min(...listings.map(l => l.price)) : null;
  const totalListings = listings.length;
  const bondingCurvePrice = analytics ? analytics.currentPrice * Math.pow(1.01, parseInt(bondingCurveShares) || 10) : 0;

  if (!analytics) {
    return (
      <div className="card-hover">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card-hover">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {player.imageUrl && (
              <img 
                src={player.imageUrl} 
                alt={player.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <h3 className="font-semibold text-lg">{player.name}</h3>
              <p className="text-sm text-gray-600">{player.team} • {player.position}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1">
              {analytics.priceChange24h > 0 && <TrendingUp className="w-4 h-4 text-green-500" />}
              {analytics.priceChange24h < 0 && <TrendingDown className="w-4 h-4 text-red-500" />}
              {analytics.priceChange24h === 0 && <Minus className="w-4 h-4 text-gray-500" />}
              <span className={`text-sm font-medium ${
                analytics.priceChange24h > 0 ? 'text-green-600' : 
                analytics.priceChange24h < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {analytics.priceChange24h > 0 ? '+' : ''}{analytics.priceChange24h.toFixed(3)}
              </span>
            </div>
          </div>
        </div>

        {/* Price and Market Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Current Price</p>
            <p className="font-semibold">${analytics.currentPrice.toFixed(3)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Market Cap</p>
            <p className="font-semibold">${(analytics.marketCap / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">24h Volume</p>
            <p className="font-semibold">${analytics.volume24h.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Performance</p>
            <p className="font-semibold">{analytics.performanceScore.toFixed(1)}</p>
          </div>
        </div>

        {/* Competition Stats */}
        <div className="bg-purple-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Weekly Performance</p>
              <p className="text-lg font-bold text-purple-800">{analytics.weeklyPerformance.toFixed(1)} PPR</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-600">Rank</p>
              <p className="text-lg font-bold text-purple-800">#{analytics.competitionRank || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Marketplace Info */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Marketplace</span>
            </div>
            <span className="text-sm text-blue-600">{totalListings} listings</span>
          </div>
          {lowestPrice ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600">Lowest Ask:</span>
              <span className="font-semibold text-blue-800">${lowestPrice.toFixed(3)}</span>
            </div>
          ) : (
            <p className="text-sm text-blue-600">No active listings</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={() => setDetailsModalOpen(true)}
            className="flex-1 btn-secondary flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Details</span>
          </button>
          {userShares > 0 && (
            <button 
              onClick={() => setListModalOpen(true)}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>List</span>
            </button>
          )}
        </div>

        {/* Buy Button */}
        {lowestPrice && (
          <button 
            onClick={() => handleBuyShares(listings.find(l => l.price === lowestPrice)?.id || '')}
            disabled={loading}
            className="w-full btn-success disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Buy for $${lowestPrice.toFixed(3)}`}
          </button>
        )}
      </div>

      {/* Details Modal */}
      {detailsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Player Details - {player.name}</h2>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Charts and Analytics */}
              <div className="space-y-6">
                {/* Price Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Price History</h3>
                  <PriceChart data={analytics.priceHistory} height={300} showVolume={true} />
                </div>

                {/* Performance Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Performance Analytics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Weekly Performance</p>
                      <p className="text-xl font-bold text-purple-600">{analytics.weeklyPerformance.toFixed(1)} PPR</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Week</p>
                      <p className="text-xl font-bold">{analytics.lastWeekPerformance.toFixed(1)} PPR</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Position Weight</p>
                      <p className="text-xl font-bold">{analytics.positionWeight}x</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Competition Rank</p>
                      <p className="text-xl font-bold">#{analytics.competitionRank || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Trading and Bonding Curve */}
              <div className="space-y-6">
                {/* Bonding Curve */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Free Agency (Bonding Curve)</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Buy new shares directly from the bonding curve. Price increases with each purchase.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Price:</span>
                      <span className="font-semibold">${analytics.currentPrice.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bonding Curve Price:</span>
                      <span className="font-bold text-green-600">${bondingCurvePrice.toFixed(3)}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={bondingCurveShares}
                        onChange={(e) => setBondingCurveShares(e.target.value)}
                        min="1"
                        className="flex-1 input-field"
                        placeholder="Shares"
                      />
                      <button
                        onClick={handleBondingCurvePurchase}
                        disabled={loading}
                        className="btn-success disabled:opacity-50"
                      >
                        {loading ? 'Buying...' : 'Buy'}
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Total: ${(parseInt(bondingCurveShares) * bondingCurvePrice).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Current Listings */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Marketplace Listings</h3>
                  {listings.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No active listings</p>
                  ) : (
                    <div className="space-y-2">
                      {listings.slice(0, 5).map((listing) => (
                        <div key={listing.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium">{listing.sellerName}</p>
                            <p className="text-xs text-gray-600">{listing.shares} shares</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">${listing.price.toFixed(3)}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(listing.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Market Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Market Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">24h Change</p>
                      <p className={`font-semibold ${analytics.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analytics.priceChange24h >= 0 ? '+' : ''}{analytics.priceChange24h.toFixed(3)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">7d Change</p>
                      <p className={`font-semibold ${analytics.priceChange7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analytics.priceChange7d >= 0 ? '+' : ''}{analytics.priceChange7d.toFixed(3)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">24h Volume</p>
                      <p className="font-semibold">${analytics.volume24h.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">7d Volume</p>
                      <p className="font-semibold">${analytics.volume7d.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Supply</p>
                      <p className="font-semibold">{(analytics.circulatingSupply / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Market Cap</p>
                      <p className="font-semibold">${(analytics.marketCap / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List Shares Modal */}
      {listModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">List {player.name} Shares</h2>
              <button
                onClick={() => setListModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shares to List (Max: {userShares})
                </label>
                <input
                  type="number"
                  value={listShares}
                  onChange={(e) => setListShares(e.target.value)}
                  max={userShares}
                  min="1"
                  className="input-field"
                  placeholder="Enter number of shares"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Share
                </label>
                <input
                  type="number"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  step="0.001"
                  min="0.001"
                  className="input-field"
                  placeholder="Enter price"
                />
              </div>

              {listShares && listPrice && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    Total Value: ${(parseFloat(listShares) * parseFloat(listPrice)).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setListModalOpen(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleListShares}
                  disabled={loading || !listShares || !listPrice || parseInt(listShares) > userShares}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? 'Listing...' : 'List Shares'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}