# Proportional Reward System Implementation

## Overview

The proportional reward system incentivizes users to buy more shares by making rewards directly proportional to the number of shares entered into the weekly competition. This solves the core incentive problem where users had no reason to buy more than the minimum shares needed to participate.

## Key Changes

### 1. Smart Contract Updates (`CustodialPlayerShares.sol`)

#### New Constants
```solidity
uint256 public constant MAX_SHARES_PER_COMPETITION = 10; // Max 10 shares per player in competition
```

#### Enhanced Data Structures
```solidity
struct WeeklyEntry {
    address user;
    address[] players;
    uint256[] shareAmounts;
    uint256 totalScore;
    uint256 rewardTier;
    uint256 totalSharesEntered; // NEW: Total shares entered for proportional rewards
    bool isActive;
    uint256 entryTime;
}

struct WeeklyCompetition {
    uint256 weekNumber;
    uint256 totalEntries;
    uint256 totalRewardPool;
    uint256 leagueAverageScore;
    uint256 totalSharesEntered; // NEW: Total shares entered across all participants
    bool isActive;
    bool rewardsDistributed;
}
```

#### New Functions
```solidity
function calculateProportionalReward(address user, uint256 weekNumber) public view returns (uint256 rewardAmount)
function getCompetitionStats(uint256 weekNumber) external view returns (...)
function getUserEntryDetails(address user, uint256 weekNumber) external view returns (...)
```

### 2. Frontend Updates

#### WeeklyCompetition Component
- **10-share maximum**: Users can't enter more than 10 shares per player
- **Real-time calculations**: Shows estimated rewards based on shares entered
- **Enhanced UI**: Displays total shares entered and estimated rewards

#### New ProportionalRewardDisplay Component
- **Interactive calculator**: Shows detailed breakdown of reward calculations
- **Visual feedback**: Displays performance ratio, tier, and estimated rewards
- **Educational content**: Explains how the proportional system works

### 3. API Endpoints

#### `/api/competition/rewards`
- **POST**: Calculate proportional rewards for a user
- **GET**: Fetch competition statistics

## How It Works

### Reward Calculation Formula
```
Base Reward per Share = Total Reward Pool ÷ Total Shares in Competition
User's Reward = Base Reward per Share × User's Total Shares Entered
```

### Example Scenarios

#### Scenario 1: Small Investor
- **Shares Entered**: 2
- **Total Competition Shares**: 1000
- **Reward Pool**: $50,000
- **Calculation**: ($50,000 ÷ 1000) × 2 = $100

#### Scenario 2: Large Investor
- **Shares Entered**: 50
- **Total Competition Shares**: 1000
- **Reward Pool**: $50,000
- **Calculation**: ($50,000 ÷ 1000) × 50 = $2,500

### Performance Tiers
The system still uses performance tiers, but rewards are scaled within each tier:

1. **Tier 1 (Top 10%)**: 50% of pool
2. **Tier 2 (11-25%)**: 25% of pool
3. **Tier 3 (26-50%)**: 15% of pool
4. **Tier 4 (51-75%)**: 10% of pool

## Benefits

### For Users
- **Clear incentives**: More shares = more rewards
- **Fair scaling**: Proportional rewards within each tier
- **No freeriding**: Small holders can't game the system
- **Transparent**: Users understand exactly how rewards are calculated

### For Platform
- **Increased trading volume**: Users buy more shares to maximize rewards
- **Better price discovery**: More shares traded = more accurate pricing
- **Reduced manipulation**: Large holders can't dominate with minimal shares
- **Clear value proposition**: Users understand why they should invest more

## Implementation Details

### Validation Rules
1. **Maximum 10 shares per player** in competition
2. **Minimum 0.1 shares** per player (allows fractional participation)
3. **Performance ratio ≥ 1.0** required for rewards
4. **Shares must be owned** before entering competition

### Edge Cases Handled
- **Zero shares**: Returns zero reward
- **All shares**: Returns full reward pool
- **Invalid tiers**: No reward for performance ratio < 1.0
- **Division by zero**: Handled gracefully

## Testing

### Test Coverage
- ✅ Proportional reward calculations
- ✅ Edge cases (zero shares, all shares)
- ✅ 10-share maximum enforcement
- ✅ Performance tier assignments
- ✅ Real-world scenarios
- ✅ Proportional scaling verification

### Test Results
```
Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
```

## Future Enhancements

### Potential Improvements
1. **Dynamic maximums**: Adjust share limits based on player popularity
2. **Tier-specific scaling**: Different multipliers for different tiers
3. **Time-based bonuses**: Extra rewards for long-term holders
4. **Team bonuses**: Rewards for owning multiple players from same team

### Monitoring
- Track reward distribution patterns
- Monitor user behavior changes
- Analyze trading volume impact
- Measure user satisfaction

## Deployment Notes

### Smart Contract Deployment
1. Deploy updated `CustodialPlayerShares.sol`
2. Verify contract on blockchain explorer
3. Update frontend to use new contract address
4. Test with small user group first

### Frontend Deployment
1. Deploy updated components
2. Test reward calculator functionality
3. Verify 10-share maximum enforcement
4. Monitor user feedback

## Conclusion

The proportional reward system successfully addresses the core incentive problem by making rewards directly proportional to share count. This encourages users to buy more shares while maintaining the competitive aspect of the weekly competitions. The implementation is robust, well-tested, and provides clear value to both users and the platform. 