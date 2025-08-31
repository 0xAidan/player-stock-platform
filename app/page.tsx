import Link from 'next/link'
import { TrendingUp, Users, BarChart3, Wallet, Coins, Lock, Trophy, Target, Zap } from 'lucide-react'



export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Player Stock
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              No-wallet sports prediction platform - as easy as DraftKings, powered by blockchain
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/players" 
                className="btn-primary text-lg px-8 py-3"
              >
                Browse Marketplace
              </Link>
              <Link 
                href="/competition" 
                className="bg-white text-purple-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors text-lg"
              >
                Join Competition
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Revolutionary NFT Share System
          </h2>
          <p className="text-lg text-gray-600">
            Sign up with email, deposit funds, and compete in weekly NFL predictions - no crypto wallet needed
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">NFT Player Shares</h3>
            <p className="text-gray-600">Limited supply NFT shares for each NFL player with dynamic pricing</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Weekly Competitions</h3>
            <p className="text-gray-600">Lock in lineups and compete for rewards based on performance vs league average</p>
          </div>

          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Dynamic Supply</h3>
            <p className="text-gray-600">Performance-based share issuance with Tuesday/Wednesday bonding curves</p>
          </div>

          <div className="text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Position-Weighted Scoring</h3>
            <p className="text-gray-600">Fair comparison across positions with research-based weight adjustments</p>
          </div>

          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Skill-Based Rewards</h3>
            <p className="text-gray-600">Top performers earn trading fee percentages and bonding curve revenue</p>
          </div>

          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Hybrid Trading</h3>
            <p className="text-gray-600">AMM for instant liquidity + marketplace for better prices</p>
          </div>
        </div>
      </div>

      {/* Custodial Benefits Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No Wallet, No Gas Fees, No Hassle
            </h2>
            <p className="text-lg text-gray-600">
              We handle all the blockchain complexity so you can focus on winning
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-semibold mb-2">Email Signup</h3>
              <p className="text-sm text-gray-600">No MetaMask, no seed phrases, just your email and password</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">Instant Trading</h3>
              <p className="text-sm text-gray-600">Buy and sell shares instantly with no gas fees or delays</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🏦</div>
              <h3 className="font-semibold mb-2">Easy Deposits</h3>
              <p className="text-sm text-gray-600">Deposit with credit card or bank transfer like any app</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold mb-2">Secure & Transparent</h3>
              <p className="text-sm text-gray-600">Your shares are secured on blockchain but easy to use</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple 3-step process to start competing and earning rewards
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Buy Player Shares</h3>
              <p className="text-gray-600">
                Purchase NFT shares of NFL players through AMM or marketplace. Each player has limited supply with dynamic pricing.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Lock Weekly Lineup</h3>
              <p className="text-gray-600">
                Submit your 5-player lineup before games start. Performance is tracked vs league average with position-weighted scoring.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
              <p className="text-gray-600">
                Top performers earn rewards from trading fees and bonding curve revenue. Higher performance ratios = bigger rewards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Flow Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Weekly Competition Flow
            </h2>
            <p className="text-lg text-gray-600">
              Natural rhythm that keeps you engaged throughout the NFL week
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-bold mb-2">Sunday</div>
              <p className="text-sm text-gray-600">Games played, scores calculated</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-green-600 font-bold mb-2">Monday</div>
              <p className="text-sm text-gray-600">Performance analysis, supply calculations</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-bold mb-2">Tuesday</div>
              <p className="text-sm text-gray-600">Bonding curve sales (new shares issued)</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-orange-600 font-bold mb-2">Wednesday</div>
              <p className="text-sm text-gray-600">Bonding curve sales (continued)</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-gray-600 font-bold mb-2">Thu-Sat</div>
              <p className="text-sm text-gray-600">Normal trading and lineup preparation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Position Weights Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Position-Weighted Scoring
            </h2>
            <p className="text-lg text-gray-600">
              Fair comparison across positions based on historical variance analysis
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-2">QB</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1.2x</div>
              <p className="text-sm text-gray-600">Higher variance, higher weight</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600 mb-2">RB</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1.0x</div>
              <p className="text-sm text-gray-600">Baseline position</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600 mb-2">WR</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">0.9x</div>
              <p className="text-sm text-gray-600">More consistent, lower weight</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600 mb-2">TE</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">0.8x</div>
              <p className="text-sm text-gray-600">Most consistent, lowest weight</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600 mb-2">K</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">0.7x</div>
              <p className="text-sm text-gray-600">Very consistent, minimal weight</p>
            </div>
          </div>
        </div>
      </div>

      {/* Competition Interface Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Weekly Competition
            </h2>
            <p className="text-lg text-gray-600">
              Lock in your lineup and compete for rewards based on performance predictions
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Competition Coming Soon</h3>
              <p className="text-gray-600 mb-6">
                Weekly competitions with position-weighted scoring and performance-based rewards will be available once the protocol is deployed.
              </p>
              <Link 
                href="/competition" 
                className="inline-block bg-purple-600 text-white hover:bg-purple-700 font-medium py-2 px-6 rounded-lg transition-colors"
              >
                View Competition Demo
              </Link>
              <div className="bg-gray-50 rounded-lg p-4 text-left mt-6">
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>5-Player Lineups:</strong> Maximum 5 players per weekly entry</li>
                  <li>• <strong>Position Weights:</strong> Fair scoring across all positions</li>
                  <li>• <strong>Performance Tracking:</strong> Real-time vs league average</li>
                  <li>• <strong>Reward Tiers:</strong> Top performers earn bigger rewards</li>
                  <li>• <strong>Weekly Reset:</strong> Fresh competition every NFL week</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Predicting?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Join the future of sports prediction markets with NFT shares and DeFi mechanics
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/players" 
              className="bg-white text-purple-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors text-lg"
            >
              Browse Marketplace
            </Link>
            <Link 
              href="/competition" 
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-medium py-3 px-8 rounded-lg transition-colors text-lg"
            >
              Join Competition
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 