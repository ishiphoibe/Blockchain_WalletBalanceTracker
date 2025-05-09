const hre = require("hardhat");

async function main() {
  try {
    // Deploy the WalletTracker contract
    console.log("Deploying WalletTracker...");
    const WalletTracker = await hre.ethers.deployContract("WalletTracker");
    
    console.log("Waiting for deployment...");
    await WalletTracker.waitForDeployment();

    const address = WalletTracker.target;
    console.log(`WalletTracker deployed to: ${address}`);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });