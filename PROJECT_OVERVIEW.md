# Player Stock - Custodial Sports Prediction Platform

## 🎯 **Project Vision**

Player Stock is a **revolutionary custodial sports prediction platform** that combines the best elements of Polymarket, DraftKings, and DeFi. Users sign up with email (no wallet required), buy "shares" representing NFL players, compete in weekly performance-based competitions, and earn rewards based on their predictive accuracy - all without gas fees or crypto complexity.

## 🚀 **Core Concept**

### **Custodial Share System**
- Each NFL player has a limited supply of "shares" (tracked on-chain)
- Users sign up with email - no crypto wallet required
- All transactions are gasless and instant
- Shares represent ownership and prediction rights
- Dynamic supply based on weekly performance

### **Weekly Competition**
- Users lock in lineups of player shares
- Performance tracked vs. league average
- Leaderboards created based on performance ratios
- Rewards distributed to top performers

### **Custodial Economics**
- Performance-based share issuance
- Gasless trading with instant settlement
- Protocol handles all blockchain transactions
- Users deposit/withdraw via traditional payment methods
- Shares secured on-chain but managed custodially

## 🏛️ **Custodial Architecture**

### **Best of Both Worlds**
- **Traditional UX**: Email signup, credit card deposits, instant trading
- **Blockchain Benefits**: Transparent markets, verifiable ownership, audit trail
- **No Crypto Complexity**: No wallets, gas fees, or seed phrases
- **Regulatory Friendly**: KYC/AML compliance, traditional payment rails

### **How It Works**
1. **User Registration**: Sign up with email, create internal account
2. **Fund Deposit**: Deposit via credit card/bank (like any app)
3. **Share Trading**: Buy/sell shares instantly with no gas fees
4. **Competition Entry**: Submit lineups using owned shares
5. **Reward Distribution**: Earn rewards in USDC balance
6. **Withdrawals**: Cash out to bank account or card

### **Security Model**
- **Custodial Wallets**: Protocol manages private keys securely
- **On-Chain Tracking**: All ownership and trades recorded on blockchain
- **Meta-Transactions**: Users never pay gas or interact with blockchain directly
- **Audit Trail**: Complete transparency while maintaining ease of use

## 📊 **Key Innovations**

### **1. Dynamic Supply Management**
```
Weekly Share Issuance = Base Supply × (1 + Performance Penalty)

Where:
- Performance Penalty = (League Average - Player Average) / League Average
- Rolling Average = Last 4 weeks performance
- Bonding Curve = Tuesday/Wednesday distribution
```

**Benefits:**
- Self-correcting supply (bad performers get more shares)
- Natural price discovery
- Incentivizes recovery and redemption
- Weekly rebalancing cycles

### **2. Position-Weighted Scoring**
```
Adjusted Score = Raw PPR × Position Weight × Consistency Multiplier

Position Weights (Research-Based):
- QB: 1.2 (Higher variance, higher weight)
- RB: 1.0 (Baseline)
- WR: 0.9 (More consistent, lower weight)
- TE: 0.8 (Most consistent, lowest weight)
- K: 0.7 (Very consistent, minimal weight)
```

**Benefits:**
- Fair comparison across positions
- Accounts for natural variance differences
- Rewards position-specific knowledge
- Historical data-driven adjustments

### **3. Hybrid AMM + Marketplace**
```
AMM Price = Average(Marketplace Sell Orders) × (1 - Discount)

Features:
- Market-driven pricing
- 5-10% discount for instant liquidity
- Tuesday/Wednesday bonding curve redistribution
- Dynamic adjustment based on performance
```

**Benefits:**
- Always provides exit option
- Market-driven price discovery
- Revenue generation through discount
- Weekly supply redistribution

## 🏗️ **Technical Architecture**

### **Smart Contract Structure**
```solidity
struct PlayerShare {
    uint256 totalSupply;        // Fixed base supply
    uint256 circulatingSupply;  // Available for trading
    uint256 reservedSupply;     // Held for new users
    uint256 currentPrice;       // AMM calculated price
    uint256 weeklyPerformance;  // Current week score
    uint256 rollingAverage;     // 4-week average
    uint256 positionWeight;     // Position-specific weight
    uint256 lastIssuance;       // Last issuance timestamp
}

struct WeeklyEntry {
    address user;
    address[] players;          // Max 5 players per lineup
    uint256[] shareAmounts;     // Shares of each player
    uint256 totalScore;         // Performance vs average
    uint256 rewardTier;         // 1-10 based on performance
}
```

### **Weekly Flow**
```
Sunday: Games played, scores calculated
Monday: Performance analysis, supply calculations
Tuesday: Bonding curve sales (new shares issued)
Wednesday: Bonding curve sales (continued)
Thursday-Saturday: Normal trading
```

## 💰 **Economic Model**

### **Revenue Streams**
1. **Trading Fees**: 0.25% on all marketplace transactions
2. **AMM Discount**: 5-10% spread on instant sales
3. **Bonding Curve Sales**: Revenue from new share issuance
4. **Performance Fees**: Optional fees on reward distributions

### **Reward Distribution**
```
Weekly Reward Pool = Trading Fees + AMM Revenue + Bonding Curve Revenue

Distribution Tiers:
- Tier 1 (Top 10%): 50% of pool
- Tier 2 (11-25%): 25% of pool  
- Tier 3 (26-50%): 15% of pool
- Tier 4 (51-75%): 10% of pool
```

### **Performance Scoring**
```
Performance Ratio = Player Score / League Average Score

Rewards:
- Ratio > 1.0: Receive rewards based on tier
- Ratio < 1.0: No rewards for that week
- Scaling: Higher ratios = higher tier placement
```

## 🎮 **User Experience**

### **Core User Journey**
1. **Research**: Analyze player performance, position weights, historical data
2. **Purchase**: Buy shares through AMM or marketplace
3. **Lineup**: Lock in weekly lineup (max 5 players)
4. **Compete**: Track performance vs. league average
5. **Rewards**: Earn based on performance tier
6. **Trade**: Sell shares instantly or on marketplace

### **Engagement Mechanics**
- **Tuesday/Wednesday Rush**: Compete for new shares via bonding curve
- **Weekly Anticipation**: Research and strategize before games
- **Performance Tracking**: Real-time updates during games
- **Leaderboard Competition**: Compare against other users
- **Position Strategy**: Consider position weights in lineup decisions

## 🔬 **Research Requirements**

### **Data Analysis Needed**
1. **Position Variance Analysis**
   - Last 5 seasons of PPR data
   - Standard deviation by position
   - Week-to-week consistency metrics
   - Seasonal trends and patterns

2. **Performance Distribution**
   - How often players exceed league average
   - Distribution of performance ratios
   - Optimal bonding curve parameters
   - Market behavior patterns

3. **Economic Modeling**
   - Optimal share supply per player
   - Bonding curve pricing parameters
   - AMM discount optimization
   - Reward distribution scaling

## 🚀 **Development Phases**

### **Phase 1: Core Platform ✅**
- [x] Smart contract development (`PlayerShares.sol`)
- [x] Basic AMM implementation
- [x] Marketplace functionality
- [x] Weekly competition mechanics
- [x] Basic reward distribution
- [x] Frontend components
- [x] Deployment scripts

### **Phase 2: Advanced Features**
- [ ] Dynamic supply issuance
- [ ] Position-weighted scoring
- [ ] Bonding curve sales
- [ ] Advanced analytics dashboard
- [ ] Mobile optimization

### **Phase 3: Scale & Optimize**
- [ ] Performance optimization
- [ ] Advanced trading features
- [ ] Tournament system
- [ ] Governance integration
- [ ] Cross-sport expansion

## 🎯 **Success Metrics**

### **User Engagement**
- Weekly active users
- Average lineup size
- User retention rates
- Trading volume

### **Economic Health**
- Total value locked (TVL)
- Trading fee revenue
- Bonding curve participation
- Market liquidity

### **Platform Performance**
- Transaction success rates
- Gas optimization
- Smart contract efficiency
- API response times

## 🔮 **Future Enhancements**

### **Advanced Features**
- **Tournaments**: Special events with larger prize pools
- **Side Bets**: User-to-user prediction markets
- **Governance**: Share holders vote on platform changes
- **Cross-Sport**: Expand to NBA, MLB, etc.
- **Social Features**: User profiles, leaderboards, communities

### **Technical Improvements**
- **Layer 2 Scaling**: Reduce gas costs and increase throughput
- **Advanced Analytics**: Machine learning for performance prediction
- **Mobile App**: Native iOS/Android applications
- **API Integration**: Real-time sports data feeds

## 📚 **Key Documents**

- **[Smart Contracts](./contracts/)**: Contract source code
- **[API Reference](./lib/api.ts)**: Complete API documentation
- **[Test Suite](./test/)**: Comprehensive tests
- **[Frontend Components](./components/)**: UI components

## 🛠️ **Quick Start**

### **Development Setup**
```bash
# Install dependencies
npm install

# Compile contracts
npm run contract:compile

# Run tests
npm run contract:test

# Deploy to local network
npm run contract:deploy-shares

# Start frontend
npm run dev
```

### **Deployment**
```bash
# Deploy to testnet
npm run contract:deploy-shares -- --network sepolia

# Deploy to mainnet
npm run contract:deploy-shares -- --network mainnet
```

## 🎉 **What's Been Implemented**

### **Smart Contracts**
- ✅ **PlayerShares.sol**: Complete NFT contract with dynamic supply
- ✅ **Weekly Competition**: Lineup submission and scoring
- ✅ **AMM Integration**: Instant liquidity with discounts
- ✅ **Position Weights**: Research-based scoring adjustments
- ✅ **Bonding Curves**: Tuesday/Wednesday share issuance

### **Frontend Components**
- ✅ **WeeklyCompetition.tsx**: Complete competition interface
- ✅ **Updated Homepage**: New NFT-based messaging
- ✅ **Position Weight Display**: Visual scoring system
- ✅ **Competition Page**: Dedicated competition route

### **Infrastructure**
- ✅ **Deployment Scripts**: Automated contract deployment
- ✅ **Type Definitions**: Updated for NFT system
- ✅ **Documentation**: Comprehensive project overview
- ✅ **Package Scripts**: New deployment commands

## 🔄 **Migration from Token System**

### **What Changed**
- **From**: ERC20 tokens with complex tokenomics
- **To**: ERC721 NFT shares with dynamic supply
- **From**: Staking and burn mechanics
- **To**: Weekly competitions and performance rewards
- **From**: Treasury-based burns
- **To**: Bonding curve sales and AMM trading

### **Why This is Better**
- ✅ **Simpler Economics**: No complex burns/emissions
- ✅ **Better UX**: Clear competition mechanics
- ✅ **More Engaging**: Weekly competitions create retention
- ✅ **Regulatory Friendly**: More like fantasy sports
- ✅ **Sustainable Revenue**: Multiple revenue streams

---

**This platform represents a paradigm shift in sports prediction markets, combining the best of DeFi mechanics with engaging competitive gameplay and sustainable economic models.** 