'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Coins, DollarSign, Info } from 'lucide-react';

interface ProportionalRewardDisplayProps {
  sharesEntered: number;
  totalSharesInCompetition?: number;
  rewardPool?: number;
  performanceRatio?: number;
}

export default function ProportionalRewardDisplay({
  sharesEntered,
  totalSharesInCompetition = 500,
  rewardPool = 10000,
  performanceRatio = 1.25
}: ProportionalRewardDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  const calculateReward = () => {
    if (totalSharesInCompetition === 0) return 0;
    const baseRewardPerShare = rewardPool / totalSharesInCompetition;
    return baseRewardPerShare * sharesEntered;
  };

  const getTier = (ratio: number): { tier: number; name: string; color: string; percentage: number } => {
    if (ratio >= 1.5) return { tier: 1, name: 'Tier 1', color: 'text-yellow-600', percentage: 50 };
    if (ratio >= 1.3) return { tier: 2, name: 'Tier 2', color: 'text-blue-600', percentage: 25 };
    if (ratio >= 1.1) return { tier: 3, name: 'Tier 3', color: 'text-green-600', percentage: 15 };
    if (ratio >= 1.0) return { tier: 4, name: 'Tier 4', color: 'text-purple-600', percentage: 10 };
    return { tier: 0, name: 'No Reward', color: 'text-gray-600', percentage: 0 };
  };

  const tierInfo = getTier(performanceRatio);
  const estimatedReward = calculateReward();
  const sharePercentage = totalSharesInCompetition > 0 ? (sharesEntered / totalSharesInCompetition) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-purple-600" />
          Proportional Reward Calculator
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
        >
          <Info className="w-4 h-4 mr-1" />
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{sharesEntered.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Shares Entered</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{performanceRatio.toFixed(2)}x</div>
          <div className="text-xs text-gray-600">Performance Ratio</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className={`text-2xl font-bold ${tierInfo.color}`}>{tierInfo.name}</div>
          <div className="text-xs text-gray-600">Reward Tier</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">${estimatedReward.toFixed(2)}</div>
          <div className="text-xs text-gray-600">Estimated Reward</div>
        </div>
      </div>

      {/* Detailed Calculation */}
      {showDetails && (
        <div className="border-t pt-4 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-900">📊 Calculation Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Reward Pool:</span>
                <span className="font-medium">${rewardPool.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Shares in Competition:</span>
                <span className="font-medium">{totalSharesInCompetition.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Base Reward per Share:</span>
                <span className="font-medium">${(rewardPool / totalSharesInCompetition).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Share Percentage:</span>
                <span className="font-medium">{sharePercentage.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-blue-900">💰 Reward Formula</h4>
            <div className="text-sm text-blue-800">
              <div className="font-mono bg-white p-2 rounded mb-2">
                Your Reward = (Total Reward Pool ÷ Total Shares) × Your Shares
              </div>
              <div className="font-mono bg-white p-2 rounded">
                ${estimatedReward.toFixed(2)} = (${rewardPool} ÷ {totalSharesInCompetition}) × {sharesEntered}
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-green-900">🎯 Key Benefits</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <strong>Fair Scaling:</strong> More shares = proportionally more rewards</li>
              <li>• <strong>No Freeriding:</strong> Small holders can't game the system</li>
              <li>• <strong>Clear Incentives:</strong> Users understand exactly why to buy more shares</li>
              <li>• <strong>Performance + Volume:</strong> Rewards both skill and investment size</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-yellow-900">⚠️ Important Notes</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Maximum 10 shares per player in competition</li>
              <li>• Performance ratio must be ≥ 1.0 to receive rewards</li>
              <li>• Rewards are distributed within your performance tier</li>
              <li>• Higher performance ratios earn higher tier placement</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 