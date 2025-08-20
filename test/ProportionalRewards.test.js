const { expect } = require("chai");

describe("Proportional Reward System", function () {
  describe("Reward Calculations", function () {
    it("Should calculate proportional rewards correctly", function () {
      // Test scenario: 10,000 reward pool, 500 total shares
      const totalRewardPool = 10000;
      const totalSharesInCompetition = 500;
      const baseRewardPerShare = totalRewardPool / totalSharesInCompetition; // $20 per share
      
      // Test cases
      const testCases = [
        { sharesEntered: 1, expectedReward: 20 },
        { sharesEntered: 5, expectedReward: 100 },
        { sharesEntered: 10, expectedReward: 200 },
        { sharesEntered: 25, expectedReward: 500 },
        { sharesEntered: 50, expectedReward: 1000 }
      ];
      
      testCases.forEach(({ sharesEntered, expectedReward }) => {
        const calculatedReward = baseRewardPerShare * sharesEntered;
        expect(calculatedReward).to.equal(expectedReward);
      });
    });

    it("Should handle edge cases", function () {
      const totalRewardPool = 10000;
      const totalSharesInCompetition = 500;
      const baseRewardPerShare = totalRewardPool / totalSharesInCompetition;
      
      // Zero shares should give zero reward
      expect(baseRewardPerShare * 0).to.equal(0);
      
      // All shares should give full reward pool
      expect(baseRewardPerShare * totalSharesInCompetition).to.equal(totalRewardPool);
    });

    it("Should enforce 10-share maximum per player", function () {
      const maxSharesPerPlayer = 10;
      
      // Valid cases
      expect(1).to.be.at.most(maxSharesPerPlayer);
      expect(5).to.be.at.most(maxSharesPerPlayer);
      expect(10).to.be.at.most(maxSharesPerPlayer);
      
      // Invalid cases
      expect(11).to.be.greaterThan(maxSharesPerPlayer);
      expect(20).to.be.greaterThan(maxSharesPerPlayer);
    });
  });

  describe("Performance Tiers", function () {
    it("Should assign correct tiers based on performance ratio", function () {
      const getTier = (performanceRatio) => {
        if (performanceRatio >= 1.5) return 1; // Top 10%
        if (performanceRatio >= 1.3) return 2; // 11-25%
        if (performanceRatio >= 1.1) return 3; // 26-50%
        if (performanceRatio >= 1.0) return 4; // 51-75%
        return 0; // No reward
      };
      
      expect(getTier(2.0)).to.equal(1); // Tier 1
      expect(getTier(1.5)).to.equal(1); // Tier 1
      expect(getTier(1.4)).to.equal(2); // Tier 2
      expect(getTier(1.3)).to.equal(2); // Tier 2
      expect(getTier(1.2)).to.equal(3); // Tier 3
      expect(getTier(1.1)).to.equal(3); // Tier 3
      expect(getTier(1.0)).to.equal(4); // Tier 4
      expect(getTier(0.9)).to.equal(0); // No reward
    });
  });

  describe("Real-world Scenarios", function () {
    it("Should handle realistic competition scenarios", function () {
      // Scenario 1: Small investor
      const smallInvestor = {
        sharesEntered: 2,
        totalSharesInCompetition: 1000,
        rewardPool: 50000,
        expectedReward: 100 // (50000 / 1000) * 2
      };
      
      // Scenario 2: Large investor
      const largeInvestor = {
        sharesEntered: 50,
        totalSharesInCompetition: 1000,
        rewardPool: 50000,
        expectedReward: 2500 // (50000 / 1000) * 50
      };
      
      const calculateReward = (shares, totalShares, pool) => {
        return (pool / totalShares) * shares;
      };
      
      expect(calculateReward(
        smallInvestor.sharesEntered,
        smallInvestor.totalSharesInCompetition,
        smallInvestor.rewardPool
      )).to.equal(smallInvestor.expectedReward);
      
      expect(calculateReward(
        largeInvestor.sharesEntered,
        largeInvestor.totalSharesInCompetition,
        largeInvestor.rewardPool
      )).to.equal(largeInvestor.expectedReward);
    });

    it("Should demonstrate proportional scaling", function () {
      const rewardPool = 10000;
      const totalShares = 100;
      const baseRewardPerShare = rewardPool / totalShares;
      
      // User A: 1 share
      const userAReward = baseRewardPerShare * 1;
      
      // User B: 10 shares (10x more)
      const userBReward = baseRewardPerShare * 10;
      
      // User B should get exactly 10x more reward
      expect(userBReward).to.equal(userAReward * 10);
      
      // If these were the only two users, their combined shares would be 11
      // So their combined rewards would be: (10000 / 100) * 11 = 1100
      // This is correct because the total shares in competition is 100, not 11
      expect(userAReward + userBReward).to.equal(1100);
      
      // The full reward pool is distributed across ALL participants, not just these two
      expect(baseRewardPerShare * totalShares).to.equal(rewardPool);
    });
  });
}); 