const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Custodial PlayerShares Contract...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the contract with protocol signer
  const CustodialPlayerShares = await hre.ethers.getContractFactory("CustodialPlayerShares");
  const custodialPlayerShares = await CustodialPlayerShares.deploy(deployer.address);
  
  // Wait for deployment to finish
  await custodialPlayerShares.waitForDeployment();
  
  const address = await custodialPlayerShares.getAddress();
  console.log("✅ CustodialPlayerShares deployed to:", address);

  // Add some sample players
  console.log("📝 Adding sample players...");
  
  const samplePlayers = [
    {
      address: "0x1111111111111111111111111111111111111111",
      name: "Patrick Mahomes",
      position: "QB"
    },
    {
      address: "0x2222222222222222222222222222222222222222", 
      name: "Christian McCaffrey",
      position: "RB"
    },
    {
      address: "0x3333333333333333333333333333333333333333",
      name: "Tyreek Hill", 
      position: "WR"
    },
    {
      address: "0x4444444444444444444444444444444444444444",
      name: "Travis Kelce",
      position: "TE"
    },
    {
      address: "0x5555555555555555555555555555555555555555",
      name: "Justin Tucker",
      position: "K"
    }
  ];

  for (const player of samplePlayers) {
    try {
      const tx = await custodialPlayerShares.addPlayer(player.address, player.name, player.position);
      await tx.wait();
      console.log(`✅ Added player: ${player.name} (${player.position})`);
    } catch (error) {
      console.log(`❌ Failed to add player ${player.name}:`, error.message);
    }
  }

  // Create some test users
  console.log("👥 Creating test users...");
  
  const testUsers = [
    {
      address: "0xaaa1111111111111111111111111111111111111",
      email: "test1@playerstock.com"
    },
    {
      address: "0xaaa2222222222222222222222222222222222222",
      email: "test2@playerstock.com"
    }
  ];

  for (const user of testUsers) {
    try {
      // Register user
      const emailHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(user.email));
      const tx1 = await custodialPlayerShares.registerUser(emailHash);
      await tx1.wait();
      console.log(`✅ Registered user: ${user.email}`);

      // Deposit some test funds
      const depositAmount = 100 * 1000000; // $100 in 6 decimals
      const tx2 = await custodialPlayerShares.depositFunds(user.address, depositAmount);
      await tx2.wait();
      console.log(`✅ Deposited $100 for user: ${user.email}`);

      // Buy some shares
      const tx3 = await custodialPlayerShares.buyShares(user.address, samplePlayers[0].address, 10);
      await tx3.wait();
      console.log(`✅ Bought 10 shares of ${samplePlayers[0].name} for user: ${user.email}`);

    } catch (error) {
      console.log(`❌ Failed to setup user ${user.email}:`, error.message);
    }
  }

  // Display contract info
  console.log("\n📊 Contract Information:");
  console.log("Contract Address:", address);
  console.log("Network:", hre.network.name);
  console.log("Protocol Signer:", deployer.address);
  console.log("Base Share Supply:", await custodialPlayerShares.BASE_SHARE_SUPPLY());
  console.log("Max Lineup Size:", await custodialPlayerShares.MAX_LINEUP_SIZE());
  console.log("Weekly Issuance Base:", await custodialPlayerShares.WEEKLY_ISSUANCE_BASE());
  console.log("AMM Discount BPS:", await custodialPlayerShares.AMM_DISCOUNT_BPS());
  console.log("Trading Fee BPS:", await custodialPlayerShares.TRADING_FEE_BPS());

  // Display position weights
  console.log("\n⚖️ Position Weights:");
  console.log("QB Weight:", await custodialPlayerShares.QB_WEIGHT());
  console.log("RB Weight:", await custodialPlayerShares.RB_WEIGHT());
  console.log("WR Weight:", await custodialPlayerShares.WR_WEIGHT());
  console.log("TE Weight:", await custodialPlayerShares.TE_WEIGHT());
  console.log("K Weight:", await custodialPlayerShares.K_WEIGHT());

  // Display test user balances
  console.log("\n👥 Test User Balances:");
  for (const user of testUsers) {
    try {
      const balance = await custodialPlayerShares.getUserBalance(user.address);
      const shares = await custodialPlayerShares.getUserShares(user.address, samplePlayers[0].address);
      console.log(`${user.email}: $${Number(balance) / 1000000} USDC, ${shares[0]} ${samplePlayers[0].name} shares`);
    } catch (error) {
      console.log(`❌ Failed to get balance for ${user.email}:`, error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    contractAddress: address,
    network: hre.network.name,
    protocolSigner: deployer.address,
    players: samplePlayers,
    testUsers: testUsers,
    deploymentTime: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    'custodial-deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Verify contract on Etherscan (if not local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [deployer.address],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("❌ Contract verification failed:", error.message);
    }
  }

  console.log("\n🎉 Custodial deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Update frontend with contract address:", address);
  console.log("2. Test user registration and deposits");
  console.log("3. Test buying/selling shares (gasless)");
  console.log("4. Test weekly competition submissions");
  console.log("5. Integrate with payment processor for real deposits");
  
  console.log("\n🔧 Integration Details:");
  console.log("- Contract Address:", address);
  console.log("- Protocol Signer:", deployer.address);
  console.log("- Network:", hre.network.name);
  console.log("- Deployment saved to: custodial-deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });