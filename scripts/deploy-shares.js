const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PlayerShares NFT Contract...");

  // Get the contract factory
  const PlayerShares = await hre.ethers.getContractFactory("PlayerShares");
  
  // Deploy the contract
  const playerShares = await PlayerShares.deploy();
  
  // Wait for deployment to finish
  await playerShares.waitForDeployment();
  
  const address = await playerShares.getAddress();
  console.log("✅ PlayerShares deployed to:", address);

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
      const tx = await playerShares.addPlayer(player.address, player.name, player.position);
      await tx.wait();
      console.log(`✅ Added player: ${player.name} (${player.position})`);
    } catch (error) {
      console.log(`❌ Failed to add player ${player.name}:`, error.message);
    }
  }

  // Issue initial shares for each player
  console.log("🎯 Issuing initial shares...");
  
  for (const player of samplePlayers) {
    try {
      const tx = await playerShares.issueWeeklyShares(player.address);
      await tx.wait();
      console.log(`✅ Issued shares for: ${player.name}`);
    } catch (error) {
      console.log(`❌ Failed to issue shares for ${player.name}:`, error.message);
    }
  }

  // Display contract info
  console.log("\n📊 Contract Information:");
  console.log("Contract Address:", address);
  console.log("Network:", hre.network.name);
  console.log("Base Share Supply:", await playerShares.BASE_SHARE_SUPPLY());
  console.log("Max Lineup Size:", await playerShares.MAX_LINEUP_SIZE());
  console.log("Weekly Issuance Base:", await playerShares.WEEKLY_ISSUANCE_BASE());
  console.log("AMM Discount BPS:", await playerShares.AMM_DISCOUNT_BPS());
  console.log("Trading Fee BPS:", await playerShares.TRADING_FEE_BPS());

  // Display position weights
  console.log("\n⚖️ Position Weights:");
  console.log("QB Weight:", await playerShares.QB_WEIGHT());
  console.log("RB Weight:", await playerShares.RB_WEIGHT());
  console.log("WR Weight:", await playerShares.WR_WEIGHT());
  console.log("TE Weight:", await playerShares.TE_WEIGHT());
  console.log("K Weight:", await playerShares.K_WEIGHT());

  // Verify contract on Etherscan (if not local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("❌ Contract verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Update frontend with contract address:", address);
  console.log("2. Test buying/selling shares");
  console.log("3. Test weekly competition submissions");
  console.log("4. Test performance updates and scoring");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 