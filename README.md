# Player Stock - NFT-Based Sports Prediction Platform

A revolutionary NFT-based sports prediction platform that combines the best elements of Polymarket, DraftKings, and DeFi. Users buy NFT "shares" representing NFL players, compete in weekly performance-based competitions, and earn rewards based on their predictive accuracy.

## 🚀 Core Innovations

### 1. **Dynamic NFT Share System**
- **Limited Supply**: Each NFL player has a fixed base supply of NFT shares
- **Performance-Based Issuance**: Weekly share issuance based on player performance
- **Bonding Curve Sales**: Tuesday/Wednesday distribution of new shares
- **Hybrid Trading**: AMM + marketplace for optimal liquidity

### 2. **Position-Weighted Scoring**
- **Research-Based Weights**: QB (1.2x), RB (1.0x), WR (0.9x), TE (0.8x), K (0.7x)
- **Consistency Multipliers**: Rewards consistent performers
- **Fair Comparison**: Accounts for natural variance between positions
- **Historical Data**: Driven by 5+ seasons of performance analysis

### 3. **Weekly Competition System**
- **Lineup Locking**: Users lock in 5-player lineups weekly
- **Performance Tracking**: Real-time scoring vs. league average
- **Leaderboard Creation**: Performance-based rankings
- **Reward Distribution**: Top performers earn trading fee percentages

## 📊 Dynamic Supply Management

### Performance-Based Share Issuance
```
Weekly Share Issuance = Base Supply × (1 + Performance Penalty)

Where:
- Performance Penalty = (League Average - Player Average) / League Average
- Rolling Average = Last 4 weeks performance
- Bonding Curve = Tuesday/Wednesday distribution
```

### Supply Flow Mechanics
```
// Bad performers get more shares (lower prices)
if (playerPerformance < leagueAverage) {
    newShares = baseSupply * (1 + (leagueAverage - playerPerformance) / leagueAverage);
}

// Good performers maintain scarcity (higher prices)
if (playerPerformance >= leagueAverage) {
    newShares = baseSupply * 0.5; // Reduced issuance
}
```

### Example Supply Scenarios
- **Elite Performer** (150% of league average): 500 new shares
- **Average Performer** (100% of league average): 1000 new shares
- **Below Average** (80% of league average): 1200 new shares
- **Poor Performer** (60% of league average): 1400 new shares

## 🎯 Position-Weighted Performance Scoring

### Adjusted Score Formula
```
Adjusted Score = Raw PPR × Position Weight × Consistency Multiplier

Position Weights (Research-Based):
- QB: 1.2 (Higher variance, higher weight)
- RB: 1.0 (Baseline)
- WR: 0.9 (More consistent, lower weight)
- TE: 0.8 (Most consistent, lowest weight)
- K: 0.7 (Very consistent, minimal weight)
```

### Consistency Multiplier
```
Consistency Multiplier = 1 + (Standard Deviation Bonus - Variance Penalty)

Where:
- Standard Deviation Bonus = Up to 0.3 for consistent performers
- Variance Penalty = Up to 0.2 for volatile performers
```

## 🔄 Hybrid AMM + Marketplace System

### AMM Pricing Mechanism
```
AMM Price = Average(Marketplace Sell Orders) × (1 - Discount)

Features:
- Market-driven pricing
- 5-10% discount for instant liquidity
- Tuesday/Wednesday bonding curve redistribution
- Dynamic adjustment based on performance
```

### Trading Options
- **Instant Sale**: AMM provides immediate liquidity at discount
- **Marketplace**: Secondary trading for better prices
- **Bonding Curve**: Tuesday/Wednesday new share sales
- **Limit Orders**: Advanced trading features

## 🏗️ Smart Contract Architecture

### Key Contracts
- **PlayerShares.sol**: Main NFT contract with dynamic supply
- **WeeklyCompetition.sol**: Competition and reward management
- **AMM.sol**: Automated market maker for instant liquidity
- **Marketplace.sol**: Secondary trading platform

### Core Data Structures
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

## 💰 Economic Model

### Revenue Streams
1. **Trading Fees**: 0.25% on all marketplace transactions
2. **AMM Discount**: 5-10% spread on instant sales
3. **Bonding Curve Sales**: Revenue from new share issuance
4. **Performance Fees**: Optional fees on reward distributions

### Reward Distribution
```
Weekly Reward Pool = Trading Fees + AMM Revenue + Bonding Curve Revenue

Distribution Tiers:
- Tier 1 (Top 10%): 50% of pool
- Tier 2 (11-25%): 25% of pool  
- Tier 3 (26-50%): 15% of pool
- Tier 4 (51-75%): 10% of pool
```

### Performance Scoring
```
Performance Ratio = Player Score / League Average Score

Rewards:
- Ratio > 1.0: Receive rewards based on tier
- Ratio < 1.0: No rewards for that week
- Scaling: Higher ratios = higher tier placement
```

## 🎮 User Experience

### Core User Journey
1. **Research**: Analyze player performance, position weights, historical data
2. **Purchase**: Buy shares through AMM or marketplace
3. **Lineup**: Lock in weekly lineup (max 5 players)
4. **Compete**: Track performance vs. league average
5. **Rewards**: Earn based on performance tier
6. **Trade**: Sell shares instantly or on marketplace

### Weekly Flow
```
Sunday: Games played, scores calculated
Monday: Performance analysis, supply calculations
Tuesday: Bonding curve sales (new shares issued)
Wednesday: Bonding curve sales (continued)
Thursday-Saturday: Normal trading
```

### Engagement Mechanics
- **Tuesday/Wednesday Rush**: Compete for new shares via bonding curve
- **Weekly Anticipation**: Research and strategize before games
- **Performance Tracking**: Real-time updates during games
- **Leaderboard Competition**: Compare against other users
- **Position Strategy**: Consider position weights in lineup decisions

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Hardhat
- Ethers.js
- OpenZeppelin Contracts

### Installation
```bash
npm install
```

### Compilation
```bash
npx hardhat compile
```

### Deployment
```bash
npx hardhat run scripts/deploy.js --network <network>
```

### Testing
```bash
npx hardhat test
```

## 📊 API Integration

### PlayerSharesService
```typescript
import { PlayerSharesService } from '@/lib/api';

const playerShares = new PlayerSharesService(contractAddress, signer);

// Share management
await playerShares.buyShares(playerAddress, amount);
await playerShares.sellShares(playerAddress, amount);

// Weekly competition
await playerShares.lockLineup(players, amounts);
const score = await playerShares.getWeeklyScore(userAddress);

// Performance tracking
const performance = await playerShares.getPlayerPerformance(playerAddress);
const supply = await playerShares.getShareSupply(playerAddress);
```

### Performance Analytics
```typescript
import { PerformanceAnalyticsService } from '@/lib/api';

const positionWeight = PerformanceAnalyticsService.getPositionWeight(position);
const adjustedScore = PerformanceAnalyticsService.calculateAdjustedScore(rawPPR, position);
const consistencyMultiplier = PerformanceAnalyticsService.calculateConsistency(playerHistory);
```

## 🎨 Frontend Components

### PlayerShareCard
- Real-time share price display
- Performance metrics and trends
- Position weight indicators
- Supply information and bonding curve status

### WeeklyCompetition
- Lineup builder interface
- Performance tracking dashboard
- Leaderboard display
- Reward calculation preview

### TradingInterface
- AMM instant trading
- Marketplace order book
- Bonding curve participation
- Portfolio management

### Key Features
- Real-time performance tracking
- Position-weighted scoring display
- Dynamic supply visualization
- Weekly competition interface
- Enhanced trading experience
- Responsive design

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_NETWORK_ID=your_network_id
NFL_API_KEY=your_nfl_api_key
```

### Contract Constants
```solidity
uint256 public constant BASE_SHARE_SUPPLY = 10000; // 10k shares per player
uint256 public constant MAX_LINEUP_SIZE = 5; // Max 5 players per lineup
uint256 public constant WEEKLY_ISSUANCE_BASE = 1000; // Base weekly issuance
uint256 public constant AMM_DISCOUNT_BPS = 500; // 5% AMM discount
uint256 public constant TRADING_FEE_BPS = 25; // 0.25% trading fee
```

## 📈 Economic Benefits

### For Traders
- **Predictable Supply Changes**: Clear relationship between performance and supply
- **Meaningful Impact**: Dynamic supply creates real price pressure
- **Performance-Based Pricing**: Supply changes reflect actual player value
- **Transparent Mechanics**: All calculations are on-chain and verifiable

### For Competitors
- **Skill-Based Rewards**: Knowledge and research are rewarded
- **Position Strategy**: Consider position weights in lineup decisions
- **Weekly Engagement**: Natural competition rhythm
- **Performance Tracking**: Real-time updates and leaderboards

### For the Platform
- **Sustainable Economics**: Multiple revenue streams
- **Performance Alignment**: Share economics directly tied to player success
- **Natural Price Discovery**: Supply changes beyond just demand
- **Engaging User Experience**: Weekly competitions and bonding curve sales

## 🛡️ Risk Management

### Supply Change Limits
- **Maximum Issuance**: 200% of base supply per week
- **Minimum Issuance**: 50% of base supply per week
- **Bonding Curve Caps**: Maximum 24-hour sales limits

### Performance Multiplier Limits
- **Maximum Weight**: 1.5x for any position
- **Minimum Weight**: 0.5x for any position
- **Consistency Caps**: 0.3x maximum consistency bonus

### Trading Protection
- **Slippage Protection**: Maximum 10% price impact
- **Liquidity Requirements**: Minimum liquidity for AMM
- **Circuit Breakers**: Emergency trading halts

## 🔮 Future Enhancements

### Potential Upgrades
1. **Dynamic Position Weights**: Adjust based on recent performance
2. **Advanced Bonding Curves**: Multiple curve types for different scenarios
3. **Governance Integration**: Share holders earn governance rights
4. **Cross-Sport Analytics**: Compare performance across positions

### Scalability Considerations
1. **Batch Processing**: Process multiple players efficiently
2. **Gas Optimization**: Minimize computational costs
3. **Layer 2 Integration**: Scale to higher transaction volumes
4. **Off-Chain Analytics**: Move complex calculations off-chain

## 📚 Documentation

- **[Smart Contracts](./contracts/)**: Contract source code
- **[API Reference](./lib/api.ts)**: Complete API documentation
- **[Test Suite](./test/)**: Comprehensive tests
- **[Frontend Components](./components/)**: UI components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test suite for examples

---

**This platform represents a paradigm shift in sports prediction markets, combining the best of DeFi mechanics with engaging competitive gameplay and sustainable economic models.**
