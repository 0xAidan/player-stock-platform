'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Users, Target, TrendingUp, Clock, Award, DollarSign, Coins } from 'lucide-react'
import { PlayerStockService } from '@/lib/custodial-service'
import CustodialAuth from './CustodialAuth'
import ProportionalRewardDisplay from './ProportionalRewardDisplay'

interface Player {
  id: string
  name: string
  team: string
  position: string
  imageUrl?: string
  currentPrice: number
  sharesOwned: number
  weeklyPerformance: number
  positionWeight: number
}

interface LineupEntry {
  playerId: string
  shares: number
  estimatedScore: number
}

interface WeeklyCompetitionProps {
  playerStockService?: PlayerStockService;
}

export default function WeeklyCompetition({ playerStockService }: WeeklyCompetitionProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<LineupEntry[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [competitionStatus, setCompetitionStatus] = useState<'open' | 'locked' | 'scoring'>('open')
  const [timeRemaining, setTimeRemaining] = useState('')
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [userBalance, setUserBalance] = useState<number>(0)

  // Mock data - would come from API
  const availablePlayers: Player[] = [
    {
      id: '1',
      name: 'Patrick Mahomes',
      team: 'KC',
      position: 'QB',
      currentPrice: 0.15,
      sharesOwned: 50,
      weeklyPerformance: 0,
      positionWeight: 1.2
    },
    {
      id: '2',
      name: 'Christian McCaffrey',
      team: 'SF',
      position: 'RB',
      currentPrice: 0.12,
      sharesOwned: 75,
      weeklyPerformance: 0,
      positionWeight: 1.0
    },
    {
      id: '3',
      name: 'Tyreek Hill',
      team: 'MIA',
      position: 'WR',
      currentPrice: 0.10,
      sharesOwned: 60,
      weeklyPerformance: 0,
      positionWeight: 0.9
    },
    {
      id: '4',
      name: 'Travis Kelce',
      team: 'KC',
      position: 'TE',
      currentPrice: 0.08,
      sharesOwned: 40,
      weeklyPerformance: 0,
      positionWeight: 0.8
    },
    {
      id: '5',
      name: 'Justin Tucker',
      team: 'BAL',
      position: 'K',
      currentPrice: 0.05,
      sharesOwned: 30,
      weeklyPerformance: 0,
      positionWeight: 0.7
    }
  ]

  const addPlayerToLineup = (player: Player) => {
    if (selectedPlayers.length >= 5) {
      alert('Maximum 5 players allowed in lineup')
      return
    }

    if (selectedPlayers.find(p => p.playerId === player.id)) {
      alert('Player already in lineup')
      return
    }

    const newEntry: LineupEntry = {
      playerId: player.id,
      shares: Math.min(player.sharesOwned, 1), // Default to 1 share or max owned
      estimatedScore: 0
    }

    setSelectedPlayers([...selectedPlayers, newEntry])
  }

  const removePlayerFromLineup = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.playerId !== playerId))
  }

  const updateShares = (playerId: string, shares: number) => {
    const player = availablePlayers.find(p => p.id === playerId)
    if (!player) return

    const maxShares = Math.min(player.sharesOwned, 10) // Max 10 shares per player in competition
    const clampedShares = Math.max(0.1, Math.min(shares, maxShares))

    setSelectedPlayers(selectedPlayers.map(p => 
      p.playerId === playerId 
        ? { ...p, shares: clampedShares }
        : p
    ))
  }

  const calculateTotalScore = () => {
    return selectedPlayers.reduce((total, entry) => {
      const player = availablePlayers.find(p => p.id === entry.playerId)
      if (!player) return total
      
      // Mock calculation - would be based on actual performance
      const baseScore = 20 // Mock average score
      const weightedScore = baseScore * (player.positionWeight / 1000)
      return total + (weightedScore * entry.shares)
    }, 0)
  }

  const calculateTotalShares = () => {
    return selectedPlayers.reduce((total, entry) => total + entry.shares, 0)
  }

  const calculateEstimatedReward = () => {
    // Mock calculation - in real implementation this would use actual competition data
    const totalShares = calculateTotalShares()
    const mockRewardPool = 10000 // $10,000 reward pool
    const mockTotalShares = 500 // 500 total shares across all participants
    
    if (mockTotalShares <= 0) return 0
    return (mockRewardPool / mockTotalShares) * totalShares
  }

  const submitLineup = async () => {
    if (selectedPlayers.length === 0) {
      alert('Please select at least one player')
      return
    }

    setIsSubmitting(true)
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setCompetitionStatus('locked')
    alert('Lineup submitted successfully!')
  }

  const getPlayerById = (id: string) => {
    return availablePlayers.find(p => p.id === id)
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'QB': return 'text-blue-600 bg-blue-100'
      case 'RB': return 'text-green-600 bg-green-100'
      case 'WR': return 'text-purple-600 bg-purple-100'
      case 'TE': return 'text-orange-600 bg-orange-100'
      case 'K': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Authentication check
  if (!currentUser && playerStockService) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Weekly Competition</h1>
          <p className="text-lg text-gray-600 mb-8">
            Sign in to compete in weekly NFL predictions and earn rewards
          </p>
        </div>
        <CustodialAuth 
          onAuthSuccess={setCurrentUser}
          playerStockService={playerStockService}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-purple-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Weekly Competition</h1>
        </div>
        <p className="text-lg text-gray-600 mb-4">
          Lock in your 5-player lineup and compete for rewards based on performance predictions
        </p>
        {currentUser && (
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <DollarSign className="w-4 h-4 mr-1" />
            <span className="font-semibold">${userBalance.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Competition Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-gray-700">Competition Status:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
              competitionStatus === 'open' ? 'bg-green-100 text-green-800' :
              competitionStatus === 'locked' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {competitionStatus === 'open' ? 'Open for Entries' :
               competitionStatus === 'locked' ? 'Lineups Locked' :
               'Scoring in Progress'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Time Remaining</div>
            <div className="text-lg font-semibold text-gray-900">{timeRemaining || '23:45:12'}</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Available Players */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Available Players
          </h2>
          <div className="space-y-3">
            {availablePlayers.map(player => (
              <div 
                key={player.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => addPlayerToLineup(player)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getPositionColor(player.position)}`}>
                      {player.position}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{player.name}</div>
                      <div className="text-sm text-gray-500">{player.team}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">${player.currentPrice.toFixed(3)}</div>
                    <div className="text-xs text-gray-500">{player.sharesOwned} shares</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Lineup */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Your Lineup ({selectedPlayers.length}/5)
          </h2>
          
          {selectedPlayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No players selected</p>
              <p className="text-sm">Click on players to add them to your lineup</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedPlayers.map(entry => {
                const player = getPlayerById(entry.playerId)
                if (!player) return null

                return (
                  <div key={entry.playerId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getPositionColor(player.position)}`}>
                          {player.position}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-gray-500">{player.team}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removePlayerFromLineup(entry.playerId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm text-gray-600">Shares:</label>
                        <input
                          type="number"
                          min="0.1"
                          max={Math.min(player.sharesOwned, 10)}
                          step="0.1"
                          value={entry.shares}
                          onChange={(e) => updateShares(entry.playerId, parseFloat(e.target.value) || 0.1)}
                          className="ml-2 w-20 px-2 py-1 border rounded text-sm"
                        />
                        <span className="text-xs text-gray-500 ml-1">/ {Math.min(player.sharesOwned, 10)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Weight: {(player.positionWeight / 1000).toFixed(1)}x</div>
                        <div className="text-sm font-medium">Est. Score: {entry.estimatedScore}</div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Total Score and Shares */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium">Total Estimated Score:</span>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {calculateTotalScore().toFixed(1)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Coins className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">Total Shares Entered:</span>
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {calculateTotalShares().toFixed(1)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium">Estimated Reward:</span>
                  </div>
                  <div className="text-lg font-semibold text-purple-600">
                    ${calculateEstimatedReward().toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={submitLineup}
                disabled={isSubmitting || selectedPlayers.length === 0}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Lineup'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Proportional Reward Calculator */}
      {selectedPlayers.length > 0 && (
        <div className="mt-8">
          <ProportionalRewardDisplay
            sharesEntered={calculateTotalShares()}
            totalSharesInCompetition={500}
            rewardPool={10000}
            performanceRatio={calculateTotalScore() / 20} // Mock league average of 20
          />
        </div>
      )}

      {/* Reward System */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2" />
          Proportional Reward System
        </h2>
        
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 How Rewards Work</h3>
            <p className="text-blue-800 text-sm">
              Your reward is <strong>proportional to the number of shares you enter</strong>. 
              More shares = more rewards! The system calculates rewards based on your total shares 
              relative to all shares entered in the competition.
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 text-gray-900">📊 Performance Tiers</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                <span className="text-sm font-medium">Tier 1 (Top 10%)</span>
                <span className="text-sm font-bold text-yellow-600">50% of Pool</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-sm font-medium">Tier 2 (11-25%)</span>
                <span className="text-sm font-bold text-blue-600">25% of Pool</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm font-medium">Tier 3 (26-50%)</span>
                <span className="text-sm font-bold text-green-600">15% of Pool</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                <span className="text-sm font-medium">Tier 4 (51-75%)</span>
                <span className="text-sm font-bold text-purple-600">10% of Pool</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3 text-gray-900">💰 Proportional Distribution</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm font-medium text-gray-700">Example:</div>
                <div className="text-xs text-gray-600 mt-1">
                  • You enter 5 shares, total competition has 100 shares<br/>
                  • You get 5% of your tier's reward pool<br/>
                  • If Tier 1 pool is $1000, you get $50
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm font-medium text-green-700">Key Benefits:</div>
                <div className="text-xs text-green-600 mt-1">
                  • More shares = more rewards<br/>
                  • Fair scaling within each tier<br/>
                  • Encourages larger investments
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules */}
      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4">Competition Rules</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Maximum 5 players per lineup</li>
          <li>• Maximum 10 shares per player in competition</li>
          <li>• Performance scored vs league average with position-weighted adjustments</li>
          <li>• Lineups lock 1 hour before first game of the week</li>
          <li>• Rewards distributed based on performance tiers</li>
          <li>• <strong>Rewards are proportional to shares entered</strong> - more shares = more rewards</li>
          <li>• Players with performance ratio &lt; 1.0 receive no rewards</li>
          <li>• Higher performance ratios earn higher tier placement</li>
        </ul>
      </div>
    </div>
  )
} 