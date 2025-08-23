'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Coins, Activity, Clock, ExternalLink } from 'lucide-react';
import { Portfolio, Trade } from '@/lib/types';

// Enhanced mock portfolio data with real player names
const mockPortfolio: Portfolio[] = [
  {
    playerAddress: '0x1234567890abcdef',
    sharesOwned: 1250,
    averagePrice: 1.20,
    totalValue: 1500,
    profitLoss: 150
  },
  {
    playerAddress: '0xabcdef1234567890',
    sharesOwned: 800,
    averagePrice: 0.95,
    totalValue: 760,
    profitLoss: -40
  },
  {
    playerAddress: '0x9876543210fedcba',
    sharesOwned: 2000,
    averagePrice: 2.10,
    totalValue: 4200,
    profitLoss: 600
  }
];

// Enhanced mock trading history
const mockTrades: Trade[] = [
  {
    id: '1',
    playerAddress: '0x1234567890abcdef',
    type: 'buy',
    amount: 500,
    price: 1.20,
    timestamp: new Date('2024-01-15T10:30:00Z'),
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: '2',
    playerAddress: '0xabcdef1234567890',
    type: 'sell',
    amount: 200,
    price: 0.95,
    timestamp: new Date('2024-01-14T15:45:00Z'),
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    id: '3',
    playerAddress: '0x9876543210fedcba',
    type: 'buy',
    amount: 1000,
    price: 2.10,
    timestamp: new Date('2024-01-13T09:15:00Z'),
    txHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba'
  }
];

// Mock player names for better UX
const playerNames: Record<string, string> = {
  '0x1234567890abcdef': 'LeBron James',
  '0xabcdef1234567890': 'Stephen Curry',
  '0x9876543210fedcba': 'Kevin Durant'
};

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAddress, setUserAddress] = useState<string>('0x1234567890abcdef1234567890abcdef12345678');

  useEffect(() => {
    // Simulate loading
    const loadData = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPortfolio(mockPortfolio);
      setTrades(mockTrades);
      setLoading(false);
    };

    loadData();
  }, []);

  const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
  const totalProfitLoss = portfolio.reduce((sum, item) => sum + item.profitLoss, 0);
  const totalTokens = portfolio.reduce((sum, item) => sum + item.sharesOwned, 0);
  const profitLossPercentage = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getPlayerName = (address: string) => {
    return playerNames[address] || `Player ${address.slice(0, 6)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Portfolio</h1>
              <p className="text-gray-600">Track your player investments and trading history</p>
            </div>
            {userAddress && (
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Connected Wallet</p>
                <p className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-md">
                  {formatAddress(userAddress)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Value</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total P&L</p>
                <p className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
                </p>
                <p className={`text-sm ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitLossPercentage >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${totalProfitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {totalProfitLoss >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Shares</p>
                <p className="text-3xl font-bold text-gray-900">{totalTokens.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Coins className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Positions</p>
                <p className="text-3xl font-bold text-gray-900">{portfolio.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Holdings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Current Holdings</h2>
              <p className="text-sm text-gray-600 mt-1">Your active player positions</p>
            </div>
            <div className="p-6">
              {portfolio.length === 0 ? (
                <div className="text-center py-12">
                  <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No holdings yet</p>
                  <p className="text-sm text-gray-400">Start trading to build your portfolio!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolio.map((item) => (
                    <div key={item.playerAddress} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{getPlayerName(item.playerAddress)}</h3>
                        <p className="text-sm text-gray-600">
                          {item.sharesOwned.toLocaleString()} shares @ {formatCurrency(item.averagePrice)} avg
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatAddress(item.playerAddress)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(item.totalValue)}</p>
                        <p className={`text-sm font-medium ${item.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.profitLoss >= 0 ? '+' : ''}{formatCurrency(item.profitLoss)}
                        </p>
                        <p className={`text-xs ${item.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {((item.profitLoss / (item.totalValue - item.profitLoss)) * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trading History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Recent Trades</h2>
              <p className="text-sm text-gray-600 mt-1">Your latest trading activity</p>
            </div>
            <div className="p-6">
              {trades.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No trades yet</p>
                  <p className="text-sm text-gray-400">Your trading history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trades.slice(0, 5).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${trade.type === 'buy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {trade.type === 'buy' ? 'Bought' : 'Sold'} {trade.amount.toLocaleString()} shares
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getPlayerName(trade.playerAddress)} @ {formatCurrency(trade.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(trade.amount * trade.price)}</p>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(trade.timestamp)}</span>
                        </div>
                        {trade.txHash && (
                          <a 
                            href={`https://etherscan.io/tx/${trade.txHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                          >
                            <span>View on Etherscan</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 