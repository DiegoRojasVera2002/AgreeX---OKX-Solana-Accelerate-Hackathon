const hre = require("hardhat");

// OKX DEX Aggregator addresses on different chains
const OKX_AGGREGATORS = {
  1: "0x1111111254EEB25477B68fb85Ed929f73A960582",     // Ethereum
  137: "0x1111111254EEB25477B68fb85Ed929f73A960582",   // Polygon
  42161: "0x1111111254EEB25477B68fb85Ed929f73A960582", // Arbitrum
  10: "0x1111111254EEB25477B68fb85Ed929f73A960582",    // Optimism
  43114: "0x1111111254EEB25477B68fb85Ed929f73A960582", // Avalanche
  56: "0x1111111254EEB25477B68fb85Ed929f73A960582",    // BSC
};

async function main() {
  console.log("🚀 Deploying AgreeX Escrow Contract with OKX DEX Integration...");
  
  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId;
  console.log(`📍 Deploying to chain ID: ${chainId}`);
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deploying contracts with account: ${deployer.address}`);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log(`💰 Account balance: ${hre.ethers.utils.formatEther(balance)} ETH`);
  
  // Get OKX aggregator for current chain
  const okxAggregator = OKX_AGGREGATORS[chainId];
  if (okxAggregator) {
    console.log(`🔄 OKX DEX Aggregator on this chain: ${okxAggregator}`);
  } else {
    console.log(`⚠️  No OKX DEX Aggregator configured for chain ${chainId}`);
  }
  
  // Deploy AgreeX Escrow Contract
  console.log("\n📝 Deploying AgreeX Escrow Contract...");
  const AgreeXEscrow = await hre.ethers.getContractFactory("AgreeXEscrow");
  const agreeXEscrow = await AgreeXEscrow.deploy();
  
  await agreeXEscrow.deployed();
  console.log(`✅ AgreeX Escrow deployed to: ${agreeXEscrow.address}`);
  
  // Wait for confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await agreeXEscrow.deployTransaction.wait(5);
  
  // Verify contract on Etherscan (if not on local network)
  if (chainId !== 31337) {
    console.log("\n🔍 Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: agreeXEscrow.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }
  
  // Display deployment summary
  console.log("\n📊 Deployment Summary:");
  console.log("====================");
  console.log(`Contract Address: ${agreeXEscrow.address}`);
  console.log(`Chain ID: ${chainId}`);
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`OKX DEX Integration: ${okxAggregator ? "✅ Enabled" : "❌ Not available"}`);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: agreeXEscrow.address,
    chainId: chainId,
    network: network.name,
    deployer: deployer.address,
    okxAggregator: okxAggregator || "Not configured",
    deploymentTime: new Date().toISOString(),
    transactionHash: agreeXEscrow.deployTransaction.hash,
  };
  
  const fs = require("fs");
  const deploymentPath = `./deployments/${chainId}-deployment.json`;
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📌 Next steps:");
  console.log("1. Fund the contract with test tokens");
  console.log("2. Create your first freelance contract");
  console.log("3. Test OKX DEX swap functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 