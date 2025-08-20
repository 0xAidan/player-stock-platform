'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, DollarSign, Users, BarChart3 } from 'lucide-react';
import { Player } from '@/lib/types';
import PlayerCard from '@/components/PlayerCard';

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'performance' | 'volume'>('performance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [userAddress, setUserAddress] = useState<string>('user123'); // Mock user
  const [userShares, setUserShares] = useState<{[key: string]: number}>({
    '1': 25,
    '2': 50,
    '3': 0,
    '4': 100,
    '6': 0
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    filterAndSortPlayers();
  }, [players, searchTerm, sortBy, sortOrder, positionFilter]);

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
          currentPrice: player.currentPrice,
          totalSupply: player.totalSupply,
          circulatingSupply: player.circulatingSupply,
          reservedSupply: player.reservedSupply,
          weeklyPerformance: player.weeklyPerformance,
          rollingAverage: player.rollingAverage,
          positionWeight: player.positionWeight,
          isActive: player.isActive
        }));
        setPlayers(transformedPlayers);
      }
    } catch (error) {
      console.error('Failed to fetch players:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPlayers = () => {
    let filtered = players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           player.team.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = positionFilter === 'all' || player.position === positionFilter;
      return matchesSearch && matchesPosition;
    });

    // Sort players
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = a.currentPrice;
          bValue = b.currentPrice;
          break;
        case 'performance':
          aValue = a.weeklyPerformance;
          bValue = b.weeklyPerformance;
          break;
        case 'volume':
          // Mock volume data
          aValue = Math.random() * 1000;
          bValue = Math.random() * 1000;
          break;
        default:
          aValue = a.weeklyPerformance;
          bValue = b.weeklyPerformance;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPlayers(filtered);
  };

  const handleTrade = (playerId: string) => {
    // This will be handled by the PlayerCard component now
    console.log('Trade initiated for player:', playerId);
  };

  const totalSharesOwned = Object.values(userShares).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Player Share Marketplace</h1>
        <p className="text-gray-600">Buy, sell, and trade NFL player shares with real-time analytics and bonding curves</p>
        
        {/* User Portfolio Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Portfolio Value</p>
                <p className="text-xl font-bold text-green-600">$1,250.00</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Shares Owned</p>
                <p className="text-xl font-bold text-blue-600">{totalSharesOwned}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Active Players</p>
                <p className="text-xl font-bold text-purple-600">{Object.keys(userShares).filter(k => userShares[k] > 0).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">24h Change</p>
                <p className="text-xl font-bold text-orange-600">+$45.20</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search players by name or team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Position Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Positions</option>
              <option value="QB">Quarterback</option>
              <option value="RB">Running Back</option>
              <option value="WR">Wide Receiver</option>
              <option value="TE">Tight End</option>
              <option value="K">Kicker</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="performance">Performance</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
              <option value="volume">Volume</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="mb-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Market Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">$2.4M</p>
            <p className="text-sm text-gray-600">Total Market Cap</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">$45.2K</p>
            <p className="text-sm text-gray-600">24h Volume</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">156</p>
            <p className="text-sm text-gray-600">Active Listings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">+12.5%</p>
            <p className="text-sm text-gray-600">Market Change</p>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Available Players</h2>
          <p className="text-gray-600">{filteredPlayers.length} players found</p>
        </div>

        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onTrade={handleTrade}
                userAddress={userAddress}
                userShares={userShares[player.id] || 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">View Portfolio</p>
                <p className="text-sm text-gray-600">Check your holdings</p>
              </div>
            </div>
          </button>
          <button className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Market Analytics</p>
                <p className="text-sm text-gray-600">Detailed insights</p>
              </div>
            </div>
          </button>
          <button className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Join Competition</p>
                <p className="text-sm text-gray-600">Weekly contests</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}