import { ethers } from "hardhat";

async function deployDiamond() {
    const accounts = await ethers.getSigners();
    const contractOwner = accounts[0];

    // Deploy DiamondCutFacet
    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    const diamondCutFacet = await DiamondCutFacet.deploy();
    await diamondCutFacet.waitForDeployment();
    console.log("DiamondCutFacet deployed:", diamondCutFacet.target);

    // Deploy DiamondLoupeFacet
    const DiamondLoupeFacet = await ethers.getContractFactory("DiamondLoupeFacet");
    const diamondLoupeFacet = await DiamondLoupeFacet.deploy();
    await diamondLoupeFacet.waitForDeployment();
    console.log("DiamondLoupeFacet deployed:", diamondLoupeFacet.target);

    // Deploy AncestralHeritageFacet
    const AncestralHeritageFacet = await ethers.getContractFactory("AncestralHeritageFacet");
    const ancestralHeritageFacet = await AncestralHeritageFacet.deploy();
    await ancestralHeritageFacet.waitForDeployment();
    console.log("AncestralHeritageFacet deployed:", ancestralHeritageFacet.target);

    // Deploy HumanFactoryFacet
    const HumanFactoryFacet = await ethers.getContractFactory("HumanFactoryFacet");
    const humanFactoryFacet = await HumanFactoryFacet.deploy();
    await humanFactoryFacet.waitForDeployment();
    console.log("HumanFactoryFacet deployed:", humanFactoryFacet.target);

    // Deploy MirrorAdversaryFacet
    const MirrorAdversaryFacet = await ethers.getContractFactory("MirrorAdversaryFacet");
    const mirrorAdversaryFacet = await MirrorAdversaryFacet.deploy();
    await mirrorAdversaryFacet.waitForDeployment();
    console.log("MirrorAdversaryFacet deployed:", mirrorAdversaryFacet.target);

    // Prepare initial cuts: add all facets to DiamondStone
    const cutFacetSelectors = getSelectors(DiamondCutFacet);
    const loupeFacetSelectors = getSelectors(DiamondLoupeFacet);
    const heritageSelectors = getSelectors(AncestralHeritageFacet);
    const factorySelectors = getSelectors(HumanFactoryFacet);
    const adversarySelectors = getSelectors(MirrorAdversaryFacet);

    const diamondCuts = [
        {
            facetAddress: diamondCutFacet.target,
            action: 0, // Add
            functionSelectors: cutFacetSelectors,
        },
        {
            facetAddress: diamondLoupeFacet.target,
            action: 0, // Add
            functionSelectors: loupeFacetSelectors,
        },
        {
            facetAddress: ancestralHeritageFacet.target,
            action: 0, // Add
            functionSelectors: heritageSelectors,
        },
        {
            facetAddress: humanFactoryFacet.target,
            action: 0, // Add
            functionSelectors: factorySelectors,
        },
        {
            facetAddress: mirrorAdversaryFacet.target,
            action: 0, // Add
            functionSelectors: adversarySelectors,
        },
    ];

    // Deploy DiamondStone
    const DiamondStone = await ethers.getContractFactory("DiamondStone");
    const diamondStone = await DiamondStone.deploy(contractOwner.address, diamondCuts);
    await diamondStone.waitForDeployment();
    console.log("DiamondStone deployed:", diamondStone.target);

    return diamondStone.target;
}

// Helper function to get function selectors from a contract factory
function getSelectors(factory: any) {
    const selectors: string[] = [];
    for (const fragment of factory.interface.fragments) {
        if (fragment.type === "function") {
            selectors.push(fragment.selector);
        }
    }
    return selectors;
}

deployDiamond()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
