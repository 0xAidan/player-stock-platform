import { ethers } from 'ethers';
import { createHash } from 'crypto';

export interface CustodialUser {
  address: string;
  email: string;
  usdcBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ShareHolding {
  playerAddress: string;
  amount: number;
  averagePrice: number;
  currentValue: number;
}

export interface Portfolio {
  totalValue: number;
  totalCost: number;
  profitLoss: number;
  holdings: ShareHolding[];
}

export class CustodialService {
  private provider: ethers.Provider;
  private contract: ethers.Contract;
  private protocolWallet: ethers.Wallet;
  private contractAddress: string;

  constructor(
    contractAddress: string,
    protocolPrivateKey: string,
    rpcUrl: string
  ) {
    this.contractAddress = contractAddress;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.protocolWallet = new ethers.Wallet(protocolPrivateKey, this.provider);
    
    // Contract ABI would be imported from compiled artifacts
    this.contract = new ethers.Contract(
      contractAddress,
      [], // ABI would go here
      this.protocolWallet
    );
  }

  // ============ USER MANAGEMENT ============

  /**
   * Register a new user with email
   * Creates a custodial wallet for the user
   */
  async registerUser(email: string): Promise<{ address: string; success: boolean }> {
    try {
      // Generate a deterministic wallet from email
      const emailHash = this.hashEmail(email);
      const wallet = ethers.Wallet.createRandom();
      
      // Register user on-chain
      const tx = await this.contract.registerUser(emailHash);
      await tx.wait();
      
      // Store user data (in production, use secure database)
      await this.storeUserData({
        address: wallet.address,
        email: email,
        emailHash: emailHash,
        privateKey: wallet.privateKey, // Encrypted in production
      });
      
      return { address: wallet.address, success: true };
    } catch (error) {
      console.error('Error registering user:', error);
      return { address: '', success: false };
    }
  }

  /**
   * Authenticate user and return their custodial address
   */
  async authenticateUser(email: string, password?: string): Promise<string | null> {
    try {
      // In production, verify password/2FA
      const userData = await this.getUserData(email);
      return userData?.address || null;
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  }

  // ============ BALANCE MANAGEMENT ============

  /**
   * Deposit USDC to user's custodial account
   * In production, this would integrate with payment processors
   */
  async depositFunds(userAddress: string, amount: number): Promise<boolean> {
    try {
      // Convert to 6 decimals (USDC)
      const amountWei = Math.floor(amount * 1000000);
      
      const tx = await this.contract.depositFunds(userAddress, amountWei);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Error depositing funds:', error);
      return false;
    }
  }

  /**
   * Withdraw USDC from user's custodial account
   * In production, this would transfer to external wallet/bank
   */
  async withdrawFunds(userAddress: string, amount: number): Promise<boolean> {
    try {
      // Convert to 6 decimals (USDC)
      const amountWei = Math.floor(amount * 1000000);
      
      const tx = await this.contract.withdrawFunds(userAddress, amountWei);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      return false;
    }
  }

  /**
   * Get user's USDC balance
   */
  async getUserBalance(userAddress: string): Promise<number> {
    try {
      const balance = await this.contract.getUserBalance(userAddress);
      return Number(balance) / 1000000; // Convert from 6 decimals
    } catch (error) {
      console.error('Error getting user balance:', error);
      return 0;
    }
  }

  // ============ SHARE TRADING ============

  /**
   * Buy shares for user (gasless)
   */
  async buyShares(
    userAddress: string, 
    playerAddress: string, 
    amount: number
  ): Promise<boolean> {
    try {
      const tx = await this.contract.buyShares(userAddress, playerAddress, amount);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Error buying shares:', error);
      return false;
    }
  }

  /**
   * Sell shares for user (gasless)
   */
  async sellShares(
    userAddress: string, 
    playerAddress: string, 
    amount: number
  ): Promise<boolean> {
    try {
      const tx = await this.contract.sellShares(userAddress, playerAddress, amount);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Error selling shares:', error);
      return false;
    }
  }

  /**
   * Get user's share holdings for a specific player
   */
  async getUserShares(userAddress: string, playerAddress: string): Promise<ShareHolding> {
    try {
      const [amount, averagePrice] = await this.contract.getUserShares(userAddress, playerAddress);
      const playerInfo = await this.contract.getPlayerInfo(playerAddress);
      const currentPrice = Number(playerInfo.currentPrice) / 1000000;
      
      return {
        playerAddress,
        amount: Number(amount),
        averagePrice: Number(averagePrice) / 1000000,
        currentValue: Number(amount) * currentPrice
      };
    } catch (error) {
      console.error('Error getting user shares:', error);
      return {
        playerAddress,
        amount: 0,
        averagePrice: 0,
        currentValue: 0
      };
    }
  }

  /**
   * Get user's complete portfolio
   */
  async getUserPortfolio(userAddress: string): Promise<Portfolio> {
    try {
      const portfolioData = await this.contract.getUserPortfolio(userAddress);
      
      const holdings: ShareHolding[] = [];
      let totalValue = 0;
      let totalCost = 0;
      
      for (let i = 0; i < portfolioData.playerAddresses.length; i++) {
        const holding: ShareHolding = {
          playerAddress: portfolioData.playerAddresses[i],
          amount: Number(portfolioData.shareAmounts[i]),
          averagePrice: Number(portfolioData.averagePrices[i]) / 1000000,
          currentValue: Number(portfolioData.currentValues[i]) / 1000000
        };
        
        holdings.push(holding);
        totalValue += holding.currentValue;
        totalCost += holding.amount * holding.averagePrice;
      }
      
      return {
        totalValue,
        totalCost,
        profitLoss: totalValue - totalCost,
        holdings
      };
    } catch (error) {
      console.error('Error getting user portfolio:', error);
      return {
        totalValue: 0,
        totalCost: 0,
        profitLoss: 0,
        holdings: []
      };
    }
  }

  // ============ WEEKLY COMPETITION ============

  /**
   * Submit weekly lineup for user
   */
  async submitWeeklyEntry(
    userAddress: string,
    players: string[],
    shareAmounts: number[]
  ): Promise<boolean> {
    try {
      const tx = await this.contract.submitWeeklyEntry(userAddress, players, shareAmounts);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Error submitting weekly entry:', error);
      return false;
    }
  }

  // ============ META-TRANSACTIONS ============

  /**
   * Execute a meta-transaction on behalf of user
   * This allows gasless transactions
   */
  async executeMetaTransaction(
    userAddress: string,
    functionSignature: string,
    signature: string
  ): Promise<boolean> {
    try {
      // Parse signature
      const sig = ethers.Signature.from(signature);
      
      const tx = await this.contract.executeMetaTransaction(
        userAddress,
        functionSignature,
        sig.r,
        sig.s,
        sig.v
      );
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Error executing meta-transaction:', error);
      return false;
    }
  }

  // ============ HELPER FUNCTIONS ============

  private hashEmail(email: string): string {
    return createHash('sha256').update(email.toLowerCase()).digest('hex');
  }

  private async storeUserData(userData: any): Promise<void> {
    // In production, store in secure database with encryption
    // For demo purposes, this could use local storage or memory
    console.log('Storing user data:', userData.address);
  }

  private async getUserData(email: string): Promise<any> {
    // In production, retrieve from secure database
    // For demo purposes, return mock data
    return {
      address: '0x' + this.hashEmail(email).substring(0, 40),
      email: email
    };
  }

  // ============ ADMIN FUNCTIONS ============

  /**
   * Add a new player (admin only)
   */
  async addPlayer(
    playerAddress: string,
    name: string,
    position: string
  ): Promise<boolean> {
    try {
      const tx = await this.contract.addPlayer(playerAddress, name, position);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Error adding player:', error);
      return false;
    }
  }

  /**
   * Update player performance (admin only)
   */
  async updatePlayerPerformance(
    playerAddress: string,
    performance: number
  ): Promise<boolean> {
    try {
      const tx = await this.contract.updatePlayerPerformance(playerAddress, performance);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Error updating player performance:', error);
      return false;
    }
  }
}

// ============ FRONTEND INTEGRATION ============

/**
 * Frontend service that provides a simple API for the UI
 */
export class PlayerStockService {
  private custodialService: CustodialService;
  private currentUser: string | null = null;

  constructor(custodialService: CustodialService) {
    this.custodialService = custodialService;
  }

  // ============ AUTHENTICATION ============

  async signUp(email: string, password: string): Promise<boolean> {
    const result = await this.custodialService.registerUser(email);
    if (result.success) {
      this.currentUser = result.address;
      localStorage.setItem('playerstock_user', result.address);
      return true;
    }
    return false;
  }

  async signIn(email: string, password: string): Promise<boolean> {
    const userAddress = await this.custodialService.authenticateUser(email, password);
    if (userAddress) {
      this.currentUser = userAddress;
      localStorage.setItem('playerstock_user', userAddress);
      return true;
    }
    return false;
  }

  signOut(): void {
    this.currentUser = null;
    localStorage.removeItem('playerstock_user');
  }

  getCurrentUser(): string | null {
    if (!this.currentUser) {
      this.currentUser = localStorage.getItem('playerstock_user');
    }
    return this.currentUser;
  }

  // ============ ACCOUNT MANAGEMENT ============

  async getBalance(): Promise<number> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    return await this.custodialService.getUserBalance(user);
  }

  async deposit(amount: number): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // In production, this would integrate with Stripe/payment processor
    return await this.custodialService.depositFunds(user, amount);
  }

  async withdraw(amount: number): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    return await this.custodialService.withdrawFunds(user, amount);
  }

  // ============ TRADING ============

  async buyShares(playerAddress: string, amount: number): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    return await this.custodialService.buyShares(user, playerAddress, amount);
  }

  async sellShares(playerAddress: string, amount: number): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    return await this.custodialService.sellShares(user, playerAddress, amount);
  }

  async getPortfolio(): Promise<Portfolio> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    return await this.custodialService.getUserPortfolio(user);
  }

  // ============ COMPETITION ============

  async submitLineup(players: string[], shareAmounts: number[]): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    return await this.custodialService.submitWeeklyEntry(user, players, shareAmounts);
  }
}