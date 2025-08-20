'use client'

import React, { useState, useEffect } from 'react'
import { Mail, Lock, User, DollarSign, Eye, EyeOff } from 'lucide-react'
import { PlayerStockService } from '@/lib/custodial-service'

interface AuthProps {
  onAuthSuccess: (userAddress: string) => void;
  playerStockService: PlayerStockService;
}

export default function CustodialAuth({ onAuthSuccess, playerStockService }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = playerStockService.getCurrentUser()
    if (currentUser) {
      onAuthSuccess(currentUser)
      loadBalance()
    }
  }, [])

  const loadBalance = async () => {
    try {
      const userBalance = await playerStockService.getBalance()
      setBalance(userBalance)
    } catch (error) {
      console.error('Error loading balance:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        
        if (password.length < 8) {
          setError('Password must be at least 8 characters')
          return
        }

        const success = await playerStockService.signUp(email, password)
        if (success) {
          const userAddress = playerStockService.getCurrentUser()
          if (userAddress) {
            onAuthSuccess(userAddress)
            loadBalance()
          }
        } else {
          setError('Failed to create account. Please try again.')
        }
      } else {
        const success = await playerStockService.signIn(email, password)
        if (success) {
          const userAddress = playerStockService.getCurrentUser()
          if (userAddress) {
            onAuthSuccess(userAddress)
            loadBalance()
          }
        } else {
          setError('Invalid email or password')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeposit = async (amount: number) => {
    try {
      setIsLoading(true)
      // In production, this would integrate with Stripe or other payment processor
      const success = await playerStockService.deposit(amount)
      if (success) {
        loadBalance()
        alert(`Successfully deposited $${amount}`)
      } else {
        alert('Deposit failed. Please try again.')
      }
    } catch (error) {
      alert('Deposit failed. Please try again.')
      console.error('Deposit error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentUser = playerStockService.getCurrentUser()

  if (currentUser) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-gray-900">Account</span>
          </div>
          <button
            onClick={() => playerStockService.signOut()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign Out
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-gray-900">Balance</span>
            </div>
            <span className="text-xl font-bold text-green-600">
              ${balance?.toFixed(2) || '0.00'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDeposit(50)}
              disabled={isLoading}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              Deposit $50
            </button>
            <button
              onClick={() => handleDeposit(100)}
              disabled={isLoading}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              Deposit $100
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Funds are held securely in your custodial account. No gas fees or wallet required.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        <p className="text-gray-600">
          {isSignUp 
            ? 'Join Player Stock and start competing' 
            : 'Welcome back to Player Stock'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium"
        >
          {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-purple-600 hover:text-purple-700 font-medium ml-1"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">No Wallet Required!</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• No gas fees - we handle all blockchain transactions</li>
          <li>• No MetaMask or crypto wallet needed</li>
          <li>• Instant deposits and trading</li>
          <li>• Your shares are securely stored on-chain</li>
        </ul>
      </div>
    </div>
  )
}