const hre = require("hardhat");

async function main() {
  const accounts = await hre.ethers.getSigners();
  const contractOwner = accounts[0];
  console.log("Deployer:", contractOwner.address);

  // Deploy DiamondStone
  const DiamondStone = await hre.ethers.getContractFactory("DiamondStone");
  const diamondStone = await DiamondStone.deploy(contractOwner.address, []);
  await diamondStone.waitForDeployment();
  console.log("DiamondStone deployed:", await diamondStone.getAddress());

  // Deploy a few facets
  const MirrorAdversaryFacet = await hre.ethers.getContractFactory("MirrorAdversaryFacet");
  const mirror = await MirrorAdversaryFacet.deploy();
  await mirror.waitForDeployment();
  console.log("MirrorAdversaryFacet deployed:", await mirror.getAddress());

  const AncentralHeritageFacet = await hre.ethers.getContractFactory("AncestralHeritageFacet");
  const heritage = await AncentralHeritageFacet.deploy();
  await heritage.waitForDeployment();
  console.log("AncestralHeritageFacet deployed:", await heritage.getAddress());

  const HumanFactoryFacet = await hre.ethers.getContractFactory("HumanFactoryFacet");
  const factory = await HumanFactoryFacet.deploy();
  await factory.waitForDeployment();
  console.log("HumanFactoryFacet deployed:", await factory.getAddress());

  console.log("\n✓ All contracts deployed successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
