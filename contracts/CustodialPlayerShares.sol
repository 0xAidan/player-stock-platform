// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title CustodialPlayerShares
 * @dev Custodial system for player shares - users never directly interact with blockchain
 * All operations are performed by the protocol on behalf of users
 * Similar to Polymarket/DraftKings architecture
 */
contract CustodialPlayerShares is Ownable, Pausable, ReentrancyGuard {
    using Math for uint256;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    // Constants
    uint256 public constant BASE_SHARE_SUPPLY = 10000; // 10k shares per player
    uint256 public constant MAX_LINEUP_SIZE = 5; // Max 5 players per lineup
    uint256 public constant WEEKLY_ISSUANCE_BASE = 1000; // Base weekly issuance
    uint256 public constant AMM_DISCOUNT_BPS = 500; // 5% AMM discount
    uint256 public constant TRADING_FEE_BPS = 25; // 0.25% trading fee
    
    // Position weights (scaled by 1000 for precision)
    uint256 public constant QB_WEIGHT = 1200; // 1.2x
    uint256 public constant RB_WEIGHT = 1000; // 1.0x
    uint256 public constant WR_WEIGHT = 900;  // 0.9x
    uint256 public constant TE_WEIGHT = 800;  // 0.8x
    uint256 public constant K_WEIGHT = 700;   // 0.7x
    
    // Protocol state
    uint256 public totalTradingFees;
    uint256 public currentWeek;
    uint256 public bondingCurveRevenue;
    address public protocolSigner; // For meta-transactions
    
    // User account system (custodial)
    struct UserAccount {
        string email; // Hashed email for privacy
        uint256 usdcBalance; // Internal USDC balance
        uint256 totalDeposits;
        uint256 totalWithdrawals;
        bool isActive;
        uint256 createdAt;
    }
    
    // Player data structure
    struct Player {
        string name;
        string position;
        uint256 totalSupply;
        uint256 circulatingSupply;
        uint256 reservedSupply;
        uint256 currentPrice; // In USDC (6 decimals)
        uint256 weeklyPerformance;
        uint256 rollingAverage;
        uint256 positionWeight;
        uint256 lastIssuance;
        bool isActive;
        uint256[4] performanceHistory; // Last 4 weeks
        uint256 historyIndex;
    }
    
    // User share holdings (custodial)
    struct ShareHolding {
        uint256 amount;
        uint256 averagePrice;
        uint256 totalCost;
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
    
    // Meta-transaction structure
    struct MetaTransaction {
        uint256 nonce;
        address from;
        bytes functionSignature;
    }
    
    // Mappings
    mapping(address => UserAccount) public userAccounts;
    mapping(address => Player) public players;
    mapping(address => mapping(address => ShareHolding)) public userShares; // user => player => holding
    mapping(address => WeeklyEntry) public userWeeklyEntries;
    mapping(uint256 => WeeklyCompetition) public weeklyCompetitions;
    mapping(address => uint256) public userNonces; // For meta-transactions
    
    // Arrays
    address[] public activePlayers;
    address[] public activeUsers;
    
    // Events
    event UserRegistered(address indexed user, string emailHash);
    event FundsDeposited(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed user, uint256 amount);
    event PlayerAdded(address indexed player, string name, string position);
    event SharesIssued(address indexed player, uint256 amount, uint256 price);
    event SharesBought(address indexed buyer, address indexed player, uint256 amount, uint256 price);
    event SharesSold(address indexed seller, address indexed player, uint256 amount, uint256 price);
    event WeeklyEntrySubmitted(address indexed user, address[] players, uint256[] amounts);
    event WeeklyRewardsDistributed(address indexed user, uint256 amount, uint256 tier);
    event PerformanceUpdated(address indexed player, uint256 performance, uint256 rollingAverage);
    event MetaTransactionExecuted(address indexed user, bool success, bytes returnData);
    
    constructor(address _protocolSigner) Ownable(msg.sender) {
        currentWeek = 1;
        protocolSigner = _protocolSigner;
    }
    
    // ============ USER ACCOUNT MANAGEMENT ============
    
    function registerUser(string memory emailHash) external {
        require(!userAccounts[msg.sender].isActive, "User already registered");
        
        userAccounts[msg.sender] = UserAccount({
            email: emailHash,
            usdcBalance: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        activeUsers.push(msg.sender);
        emit UserRegistered(msg.sender, emailHash);
    }
    
    function depositFunds(address user, uint256 amount) external onlyOwner {
        require(userAccounts[user].isActive, "User not registered");
        
        userAccounts[user].usdcBalance += amount;
        userAccounts[user].totalDeposits += amount;
        
        emit FundsDeposited(user, amount);
    }
    
    function withdrawFunds(address user, uint256 amount) external onlyOwner {
        require(userAccounts[user].isActive, "User not registered");
        require(userAccounts[user].usdcBalance >= amount, "Insufficient balance");
        
        userAccounts[user].usdcBalance -= amount;
        userAccounts[user].totalWithdrawals += amount;
        
        emit FundsWithdrawn(user, amount);
    }
    
    // ============ META-TRANSACTION SUPPORT ============
    
    function executeMetaTransaction(
        address userAddress,
        bytes memory functionSignature,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) external returns (bytes memory) {
        MetaTransaction memory metaTx = MetaTransaction({
            nonce: userNonces[userAddress],
            from: userAddress,
            functionSignature: functionSignature
        });
        
        require(verify(userAddress, metaTx, sigR, sigS, sigV), "Signer and signature do not match");
        
        userNonces[userAddress]++;
        
        // Execute the function call
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodePacked(functionSignature, userAddress)
        );
        
        emit MetaTransactionExecuted(userAddress, success, returnData);
        return returnData;
    }
    
    function verify(
        address user,
        MetaTransaction memory metaTx,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) internal view returns (bool) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                metaTx.nonce,
                metaTx.from,
                metaTx.functionSignature
            )
        );
        
        return hash.toEthSignedMessageHash().recover(abi.encodePacked(sigR, sigS, sigV)) == protocolSigner;
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
            currentPrice: 1000000, // $1.00 in 6 decimals
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
    
    // ============ SHARE TRADING (CUSTODIAL) ============
    
    function buyShares(
        address user,
        address playerAddress, 
        uint256 amount
    ) external onlyOwner nonReentrant whenNotPaused {
        require(userAccounts[user].isActive, "User not registered");
        
        Player storage player = players[playerAddress];
        require(player.isActive, "Player not active");
        require(amount > 0, "Amount must be greater than 0");
        require(player.reservedSupply >= amount, "Insufficient reserved supply");
        
        uint256 totalCost = amount * player.currentPrice;
        require(userAccounts[user].usdcBalance >= totalCost, "Insufficient balance");
        
        // Calculate trading fee
        uint256 tradingFee = (totalCost * TRADING_FEE_BPS) / 10000;
        uint256 netCost = totalCost + tradingFee;
        
        // Update user balance
        userAccounts[user].usdcBalance -= netCost;
        
        // Update player supply
        player.reservedSupply -= amount;
        player.circulatingSupply += amount;
        
        // Update user holdings
        ShareHolding storage holding = userShares[user][playerAddress];
        uint256 newTotalAmount = holding.amount + amount;
        uint256 newTotalCost = holding.totalCost + totalCost;
        
        holding.amount = newTotalAmount;
        holding.totalCost = newTotalCost;
        holding.averagePrice = newTotalCost / newTotalAmount;
        
        // Update protocol fees
        totalTradingFees += tradingFee;
        
        emit SharesBought(user, playerAddress, amount, player.currentPrice);
    }
    
    function sellShares(
        address user,
        address playerAddress, 
        uint256 amount
    ) external onlyOwner nonReentrant whenNotPaused {
        require(userAccounts[user].isActive, "User not registered");
        
        Player storage player = players[playerAddress];
        require(player.isActive, "Player not active");
        require(amount > 0, "Amount must be greater than 0");
        
        ShareHolding storage holding = userShares[user][playerAddress];
        require(holding.amount >= amount, "Insufficient shares");
        
        // Calculate AMM price (with discount)
        uint256 ammPrice = (player.currentPrice * (10000 - AMM_DISCOUNT_BPS)) / 10000;
        uint256 totalPayment = amount * ammPrice;
        
        // Calculate trading fee
        uint256 tradingFee = (totalPayment * TRADING_FEE_BPS) / 10000;
        uint256 netPayment = totalPayment - tradingFee;
        
        // Update user balance
        userAccounts[user].usdcBalance += netPayment;
        
        // Update player supply
        player.circulatingSupply -= amount;
        player.reservedSupply += amount;
        
        // Update user holdings
        holding.amount -= amount;
        if (holding.amount > 0) {
            holding.totalCost = (holding.totalCost * (holding.amount + amount) - totalPayment * amount) / (holding.amount + amount);
            holding.averagePrice = holding.totalCost / holding.amount;
        } else {
            holding.totalCost = 0;
            holding.averagePrice = 0;
        }
        
        // Update protocol fees
        totalTradingFees += tradingFee;
        
        emit SharesSold(user, playerAddress, amount, ammPrice);
    }
    
    // ============ WEEKLY COMPETITION ============
    
    function submitWeeklyEntry(
        address user,
        address[] memory playerAddresses, 
        uint256[] memory shareAmounts
    ) external onlyOwner nonReentrant whenNotPaused {
        require(userAccounts[user].isActive, "User not registered");
        require(playerAddresses.length <= MAX_LINEUP_SIZE, "Too many players");
        require(playerAddresses.length == shareAmounts.length, "Array length mismatch");
        require(playerAddresses.length > 0, "Must submit at least one player");
        require(!userWeeklyEntries[user].isActive, "Already has active entry");
        
        // Verify user owns the shares
        for (uint256 i = 0; i < playerAddresses.length; i++) {
            ShareHolding storage holding = userShares[user][playerAddresses[i]];
            require(holding.amount >= shareAmounts[i], "Insufficient shares");
        }
        
        // Create weekly entry
        userWeeklyEntries[user] = WeeklyEntry({
            user: user,
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
        
        emit WeeklyEntrySubmitted(user, playerAddresses, shareAmounts);
    }
    
    // ============ PERFORMANCE TRACKING ============
    
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
        player.weeklyPerformance = performance;
        
        emit PerformanceUpdated(playerAddress, performance, player.rollingAverage);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getUserBalance(address user) external view returns (uint256) {
        return userAccounts[user].usdcBalance;
    }
    
    function getUserShares(address user, address playerAddress) external view returns (uint256 amount, uint256 averagePrice) {
        ShareHolding storage holding = userShares[user][playerAddress];
        return (holding.amount, holding.averagePrice);
    }
    
    function getPlayerInfo(address playerAddress) external view returns (
        string memory name,
        string memory position,
        uint256 totalSupply,
        uint256 circulatingSupply,
        uint256 currentPrice,
        uint256 weeklyPerformance,
        uint256 rollingAverage,
        bool isActive
    ) {
        Player storage player = players[playerAddress];
        return (
            player.name,
            player.position,
            player.totalSupply,
            player.circulatingSupply,
            player.currentPrice,
            player.weeklyPerformance,
            player.rollingAverage,
            player.isActive
        );
    }
    
    function getUserPortfolio(address user) external view returns (
        address[] memory playerAddresses,
        uint256[] memory shareAmounts,
        uint256[] memory averagePrices,
        uint256[] memory currentValues
    ) {
        uint256 count = 0;
        
        // Count holdings
        for (uint256 i = 0; i < activePlayers.length; i++) {
            if (userShares[user][activePlayers[i]].amount > 0) {
                count++;
            }
        }
        
        // Populate arrays
        playerAddresses = new address[](count);
        shareAmounts = new uint256[](count);
        averagePrices = new uint256[](count);
        currentValues = new uint256[](count);
        
        uint256 index = 0;
        for (uint256 i = 0; i < activePlayers.length; i++) {
            address playerAddress = activePlayers[i];
            ShareHolding storage holding = userShares[user][playerAddress];
            
            if (holding.amount > 0) {
                playerAddresses[index] = playerAddress;
                shareAmounts[index] = holding.amount;
                averagePrices[index] = holding.averagePrice;
                currentValues[index] = holding.amount * players[playerAddress].currentPrice;
                index++;
            }
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setProtocolSigner(address _protocolSigner) external onlyOwner {
        protocolSigner = _protocolSigner;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdrawProtocolFees() external onlyOwner {
        // This would transfer fees to protocol treasury
        // Implementation depends on how fees are handled
    }
}