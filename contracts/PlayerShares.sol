// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
contract PlayerShares is ERC721, Ownable, Pausable, ReentrancyGuard {
    using Math for uint256;
    
    // Constants
    uint256 public constant BASE_SHARE_SUPPLY = 10000; // 10k shares per player
    uint256 public constant MAX_LINEUP_SIZE = 5; // Max 5 players per lineup
    uint256 public constant WEEKLY_ISSUANCE_BASE = 1000; // Base weekly issuance
    uint256 public constant AMM_DISCOUNT_BPS = 500; // 5% AMM discount
    uint256 public constant TRADING_FEE_BPS = 25; // 0.25% trading fee
    uint256 public constant MAX_ISSUANCE_MULTIPLIER = 200; // 200% max issuance
    uint256 public constant MIN_ISSUANCE_MULTIPLIER = 50; // 50% min issuance
    
    // Position weights (scaled by 1000 for precision)
    uint256 public constant QB_WEIGHT = 1200; // 1.2x
    uint256 public constant RB_WEIGHT = 1000; // 1.0x
    uint256 public constant WR_WEIGHT = 900;  // 0.9x
    uint256 public constant TE_WEIGHT = 800;  // 0.8x
    uint256 public constant K_WEIGHT = 700;   // 0.7x
    
    // Protocol state
    uint256 public totalTradingFees;
    uint256 public currentWeek;
    uint256 public lastWeekUpdate;
    uint256 public bondingCurveRevenue;
    
    // Token ID counter
    uint256 private _tokenIds;
    
    // Player data structure
    struct Player {
        string name;
        string position;
        uint256 totalSupply;
        uint256 circulatingSupply;
        uint256 reservedSupply;
        uint256 currentPrice;
        uint256 weeklyPerformance;
        uint256 rollingAverage;
        uint256 positionWeight;
        uint256 lastIssuance;
        bool isActive;
        uint256[4] performanceHistory; // Last 4 weeks
        uint256 historyIndex;
    }
    
    // User lineup entry
    struct WeeklyEntry {
        address user;
        address[] players;
        uint256[] shareAmounts;
        uint256 totalScore;
        uint256 rewardTier;
        bool isActive;
        uint256 entryTime;
    }
    
    // Weekly competition data
    struct WeeklyCompetition {
        uint256 weekNumber;
        uint256 totalEntries;
        uint256 totalRewardPool;
        uint256 leagueAverageScore;
        bool isActive;
        bool rewardsDistributed;
    }
    
    // Mappings
    mapping(address => Player) public players;
    mapping(address => uint256[]) public userTokenIds;
    mapping(uint256 => address) public tokenToPlayer;
    mapping(uint256 => uint256) public tokenToShareAmount;
    mapping(address => WeeklyEntry) public userWeeklyEntries;
    mapping(uint256 => WeeklyCompetition) public weeklyCompetitions;
    mapping(address => uint256) public userTotalRewards;
    
    // Arrays
    address[] public activePlayers;
    
    // Events
    event PlayerAdded(address indexed player, string name, string position);
    event SharesIssued(address indexed player, uint256 amount, uint256 price);
    event SharesBought(address indexed buyer, address indexed player, uint256 amount, uint256 price);
    event SharesSold(address indexed seller, address indexed player, uint256 amount, uint256 price);
    event WeeklyEntrySubmitted(address indexed user, address[] players, uint256[] amounts);
    event WeeklyRewardsDistributed(address indexed user, uint256 amount, uint256 tier);
    event PerformanceUpdated(address indexed player, uint256 performance, uint256 rollingAverage);
    
    constructor() ERC721("Player Shares", "PSHARE") Ownable(msg.sender) {
        currentWeek = 1;
    }
    
    // ============ PLAYER MANAGEMENT ============
    
    function addPlayer(
        address playerAddress, 
        string memory name, 
        string memory position
    ) external onlyOwner {
        require(!players[playerAddress].isActive, "Player already exists");
        
        uint256 positionWeight = _getPositionWeight(position);
        
        players[playerAddress] = Player({
            name: name,
            position: position,
            totalSupply: BASE_SHARE_SUPPLY,
            circulatingSupply: 0,
            reservedSupply: BASE_SHARE_SUPPLY,
            currentPrice: 0.01 ether, // Starting price
            weeklyPerformance: 0,
            rollingAverage: 0,
            positionWeight: positionWeight,
            lastIssuance: 0,
            isActive: true,
            performanceHistory: [uint256(0), uint256(0), uint256(0), uint256(0)],
            historyIndex: 0
        });
        
        activePlayers.push(playerAddress);
        emit PlayerAdded(playerAddress, name, position);
    }
    
    function _getPositionWeight(string memory position) internal pure returns (uint256) {
        if (keccak256(bytes(position)) == keccak256(bytes("QB"))) return QB_WEIGHT;
        if (keccak256(bytes(position)) == keccak256(bytes("RB"))) return RB_WEIGHT;
        if (keccak256(bytes(position)) == keccak256(bytes("WR"))) return WR_WEIGHT;
        if (keccak256(bytes(position)) == keccak256(bytes("TE"))) return TE_WEIGHT;
        if (keccak256(bytes(position)) == keccak256(bytes("K"))) return K_WEIGHT;
        return RB_WEIGHT; // Default to RB weight
    }
    
    // ============ SHARE ISSUANCE ============
    
    function issueWeeklyShares(address playerAddress) external onlyOwner {
        Player storage player = players[playerAddress];
        require(player.isActive, "Player not active");
        
        uint256 issuanceAmount = _calculateWeeklyIssuance(playerAddress);
        uint256 issuancePrice = _calculateBondingCurvePrice(playerAddress, issuanceAmount);
        
        player.reservedSupply += issuanceAmount;
        player.currentPrice = issuancePrice;
        player.lastIssuance = block.timestamp;
        
        bondingCurveRevenue += issuanceAmount * issuancePrice;
        
        emit SharesIssued(playerAddress, issuanceAmount, issuancePrice);
    }
    
    function _calculateWeeklyIssuance(address playerAddress) internal view returns (uint256) {
        Player storage player = players[playerAddress];
        
        if (player.rollingAverage == 0) {
            return WEEKLY_ISSUANCE_BASE;
        }
        
        // Calculate performance ratio vs league average
        uint256 leagueAverage = _calculateLeagueAverage();
        uint256 performanceRatio = (player.rollingAverage * 100) / leagueAverage;
        
        // Issuance based on performance
        if (performanceRatio >= 100) {
            // Good performers get reduced issuance
            uint256 reduction = ((performanceRatio - 100) * WEEKLY_ISSUANCE_BASE) / 100;
            return WEEKLY_ISSUANCE_BASE - reduction;
        } else {
            // Bad performers get increased issuance
            uint256 increase = ((100 - performanceRatio) * WEEKLY_ISSUANCE_BASE) / 100;
            return WEEKLY_ISSUANCE_BASE + increase;
        }
    }
    
    function _calculateBondingCurvePrice(address playerAddress, uint256 sharesToIssue) internal view returns (uint256) {
        Player storage player = players[playerAddress];
        
        // Simple bonding curve: price increases with supply
        uint256 currentSupply = player.circulatingSupply;
        uint256 newSupply = currentSupply + sharesToIssue;
        
        // Price = base price * (1 + supply ratio)
        uint256 basePrice = 0.01 ether;
        uint256 supplyRatio = (newSupply * 1000) / BASE_SHARE_SUPPLY;
        
        return basePrice + (basePrice * supplyRatio) / 1000;
    }
    
    // ============ TRADING FUNCTIONS ============
    
    function buyShares(address playerAddress, uint256 amount) external payable nonReentrant whenNotPaused {
        Player storage player = players[playerAddress];
        require(player.isActive, "Player not active");
        require(amount > 0, "Amount must be greater than 0");
        require(player.reservedSupply >= amount, "Insufficient reserved supply");
        
        uint256 totalCost = amount * player.currentPrice;
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Calculate trading fee
        uint256 tradingFee = (totalCost * TRADING_FEE_BPS) / 10000;
        uint256 netCost = totalCost - tradingFee;
        
        // Update player supply
        player.reservedSupply -= amount;
        player.circulatingSupply += amount;
        
        // Update protocol fees
        totalTradingFees += tradingFee;
        
        // Mint NFT tokens for the shares
        for (uint256 i = 0; i < amount; i++) {
            _tokenIds++;
            uint256 tokenId = _tokenIds;
            
            _mint(msg.sender, tokenId);
            tokenToPlayer[tokenId] = playerAddress;
            tokenToShareAmount[tokenId] = 1;
            userTokenIds[msg.sender].push(tokenId);
        }
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit SharesBought(msg.sender, playerAddress, amount, player.currentPrice);
    }
    
    function sellSharesToAMM(address playerAddress, uint256 amount) external nonReentrant whenNotPaused {
        Player storage player = players[playerAddress];
        require(player.isActive, "Player not active");
        require(amount > 0, "Amount must be greater than 0");
        
        // Check user has enough shares
        uint256 userShares = _getUserShares(msg.sender, playerAddress);
        require(userShares >= amount, "Insufficient shares");
        
        // Calculate AMM price (with discount)
        uint256 ammPrice = (player.currentPrice * (10000 - AMM_DISCOUNT_BPS)) / 10000;
        uint256 totalPayment = amount * ammPrice;
        
        // Calculate trading fee
        uint256 tradingFee = (totalPayment * TRADING_FEE_BPS) / 10000;
        uint256 netPayment = totalPayment - tradingFee;
        
        // Update player supply
        player.circulatingSupply -= amount;
        player.reservedSupply += amount;
        
        // Update protocol fees
        totalTradingFees += tradingFee;
        
        // Burn user's NFT tokens
        _burnUserShares(msg.sender, playerAddress, amount);
        
        // Transfer payment to user
        payable(msg.sender).transfer(netPayment);
        
        emit SharesSold(msg.sender, playerAddress, amount, ammPrice);
    }
    
    // ============ WEEKLY COMPETITION ============
    
    function submitWeeklyEntry(address[] memory playerAddresses, uint256[] memory shareAmounts) external nonReentrant whenNotPaused {
        require(playerAddresses.length <= MAX_LINEUP_SIZE, "Too many players");
        require(playerAddresses.length == shareAmounts.length, "Array length mismatch");
        require(playerAddresses.length > 0, "Must submit at least one player");
        
        // Check if user already has an active entry
        require(!userWeeklyEntries[msg.sender].isActive, "Already has active entry");
        
        // Verify user owns the shares
        for (uint256 i = 0; i < playerAddresses.length; i++) {
            uint256 userShares = _getUserShares(msg.sender, playerAddresses[i]);
            require(userShares >= shareAmounts[i], "Insufficient shares");
        }
        
        // Create weekly entry
        userWeeklyEntries[msg.sender] = WeeklyEntry({
            user: msg.sender,
            players: playerAddresses,
            shareAmounts: shareAmounts,
            totalScore: 0,
            rewardTier: 0,
            isActive: true,
            entryTime: block.timestamp
        });
        
        // Update competition stats
        if (!weeklyCompetitions[currentWeek].isActive) {
            weeklyCompetitions[currentWeek] = WeeklyCompetition({
                weekNumber: currentWeek,
                totalEntries: 0,
                totalRewardPool: 0,
                leagueAverageScore: 0,
                isActive: true,
                rewardsDistributed: false
            });
        }
        weeklyCompetitions[currentWeek].totalEntries++;
        
        emit WeeklyEntrySubmitted(msg.sender, playerAddresses, shareAmounts);
    }
    
    function updatePlayerPerformance(address playerAddress, uint256 performance) external onlyOwner {
        Player storage player = players[playerAddress];
        require(player.isActive, "Player not active");
        
        // Update performance history
        player.performanceHistory[player.historyIndex] = performance;
        player.historyIndex = (player.historyIndex + 1) % 4;
        
        // Calculate rolling average
        uint256 total = 0;
        uint256 count = 0;
        for (uint256 i = 0; i < 4; i++) {
            if (player.performanceHistory[i] > 0) {
                total += player.performanceHistory[i];
                count++;
            }
        }
        player.rollingAverage = count > 0 ? total / count : 0;
        
        // Update current week performance
        player.weeklyPerformance = performance;
        
        emit PerformanceUpdated(playerAddress, performance, player.rollingAverage);
    }
    
    function calculateWeeklyScores() external onlyOwner {
        uint256 leagueTotal = 0;
        uint256 activeCount = 0;
        
        // Calculate league average
        for (uint256 i = 0; i < activePlayers.length; i++) {
            Player storage player = players[activePlayers[i]];
            if (player.weeklyPerformance > 0) {
                leagueTotal += player.weeklyPerformance;
                activeCount++;
            }
        }
        
        uint256 leagueAverage = activeCount > 0 ? leagueTotal / activeCount : 0;
        weeklyCompetitions[currentWeek].leagueAverageScore = leagueAverage;
        
        // Calculate user scores
        for (uint256 i = 0; i < activePlayers.length; i++) {
            address playerAddress = activePlayers[i];
            Player storage player = players[playerAddress];
            
            if (player.weeklyPerformance > 0 && leagueAverage > 0) {
                // Calculate adjusted score with position weight
                uint256 adjustedScore = (player.weeklyPerformance * player.positionWeight) / 1000;
                uint256 performanceRatio = (adjustedScore * 100) / leagueAverage;
                
                // Update player's performance ratio for the week
                player.weeklyPerformance = performanceRatio;
            }
        }
    }
    
    function distributeWeeklyRewards() external onlyOwner {
        WeeklyCompetition storage competition = weeklyCompetitions[currentWeek];
        require(competition.isActive, "Competition not active");
        require(!competition.rewardsDistributed, "Rewards already distributed");
        
        uint256 totalRewardPool = totalTradingFees + bondingCurveRevenue;
        competition.totalRewardPool = totalRewardPool;
        
        // Simple reward distribution (can be enhanced)
        // For now, distribute equally among all participants
        if (competition.totalEntries > 0) {
            uint256 rewardPerEntry = totalRewardPool / competition.totalEntries;
            
            // This would need to be implemented with a more sophisticated
            // system to track all participants and distribute rewards
        }
        
        competition.rewardsDistributed = true;
        
        // Reset for next week
        currentWeek++;
        totalTradingFees = 0;
        bondingCurveRevenue = 0;
    }
    
    // ============ HELPER FUNCTIONS ============
    
    function _getUserShares(address user, address playerAddress) internal view returns (uint256) {
        uint256 totalShares = 0;
        for (uint256 i = 0; i < userTokenIds[user].length; i++) {
            uint256 tokenId = userTokenIds[user][i];
            if (tokenToPlayer[tokenId] == playerAddress) {
                totalShares += tokenToShareAmount[tokenId];
            }
        }
        return totalShares;
    }
    
    function _burnUserShares(address user, address playerAddress, uint256 amount) internal {
        uint256 sharesToBurn = amount;
        uint256[] storage userTokens = userTokenIds[user];
        
        for (uint256 i = userTokens.length; i > 0; i--) {
            if (sharesToBurn == 0) break;
            
            uint256 tokenId = userTokens[i - 1];
            if (tokenToPlayer[tokenId] == playerAddress) {
                uint256 tokenShares = tokenToShareAmount[tokenId];
                if (tokenShares <= sharesToBurn) {
                    _burn(tokenId);
                    sharesToBurn -= tokenShares;
                    userTokens[i - 1] = userTokens[userTokens.length - 1];
                    userTokens.pop();
                } else {
                    tokenToShareAmount[tokenId] -= sharesToBurn;
                    sharesToBurn = 0;
                }
            }
        }
    }
    
    function _calculateLeagueAverage() internal view returns (uint256) {
        uint256 total = 0;
        uint256 count = 0;
        
        for (uint256 i = 0; i < activePlayers.length; i++) {
            Player storage player = players[activePlayers[i]];
            if (player.rollingAverage > 0) {
                total += player.rollingAverage;
                count++;
            }
        }
        
        return count > 0 ? total / count : 0;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getPlayerInfo(address playerAddress) external view returns (
        string memory name,
        string memory position,
        uint256 totalSupply,
        uint256 circulatingSupply,
        uint256 reservedSupply,
        uint256 currentPrice,
        uint256 weeklyPerformance,
        uint256 rollingAverage,
        uint256 positionWeight,
        bool isActive
    ) {
        Player storage player = players[playerAddress];
        return (
            player.name,
            player.position,
            player.totalSupply,
            player.circulatingSupply,
            player.reservedSupply,
            player.currentPrice,
            player.weeklyPerformance,
            player.rollingAverage,
            player.positionWeight,
            player.isActive
        );
    }
    
    function getUserShares(address user, address playerAddress) external view returns (uint256) {
        return _getUserShares(user, playerAddress);
    }
    
    function getWeeklyEntry(address user) external view returns (
        address[] memory playerAddresses,
        uint256[] memory shareAmounts,
        uint256 totalScore,
        uint256 rewardTier,
        bool isActive
    ) {
        WeeklyEntry storage entry = userWeeklyEntries[user];
        return (
            entry.players,
            entry.shareAmounts,
            entry.totalScore,
            entry.rewardTier,
            entry.isActive
        );
    }
    
    function getCompetitionInfo(uint256 week) external view returns (
        uint256 totalEntries,
        uint256 totalRewardPool,
        uint256 leagueAverageScore,
        bool isActive,
        bool rewardsDistributed
    ) {
        WeeklyCompetition storage competition = weeklyCompetitions[week];
        return (
            competition.totalEntries,
            competition.totalRewardPool,
            competition.leagueAverageScore,
            competition.isActive,
            competition.rewardsDistributed
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdrawFees() external onlyOwner {
        uint256 amount = address(this).balance;
        payable(owner()).transfer(amount);
    }
    
    // ============ OVERRIDE FUNCTIONS ============
    
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Prevent transfers during weekly competition
        if (userWeeklyEntries[from].isActive || userWeeklyEntries[to].isActive) {
            revert("Transfers not allowed during active competition");
        }
        
        return super._update(to, tokenId, auth);
    }
} 