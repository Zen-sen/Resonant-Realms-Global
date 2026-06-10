const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Diamond Proxy", function () {
  async function deployDiamond() {
    const accounts = await ethers.getSigners();
    const contractOwner = accounts[0];

    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    const diamondCutFacet = await DiamondCutFacet.deploy();
    await diamondCutFacet.waitForDeployment();

    const DiamondLoupeFacet = await ethers.getContractFactory("DiamondLoupeFacet");
    const diamondLoupeFacet = await DiamondLoupeFacet.deploy();
    await diamondLoupeFacet.waitForDeployment();

    const cutSelectors = diamondCutFacet.interface.fragments
      .filter((f) => f.type === "function")
      .map((f) => f.selector);
    const loupeSelectors = diamondLoupeFacet.interface.fragments
      .filter((f) => f.type === "function")
      .map((f) => f.selector);

    // Also get sighash for specific test
    diamondCutFacet._sighash = diamondCutFacet.interface.fragments
      .find((f) => f.name === "diamondCut")
      ?.selector;

    const diamondCuts = [
      { facetAddress: diamondCutFacet.target, action: 0, functionSelectors: cutSelectors },
      { facetAddress: diamondLoupeFacet.target, action: 0, functionSelectors: loupeSelectors },
    ];

    const DiamondStone = await ethers.getContractFactory("DiamondStone");
    const diamondStone = await DiamondStone.deploy(contractOwner.address, diamondCuts);
    await diamondStone.waitForDeployment();

    return { diamondStone, diamondCutFacet, diamondLoupeFacet, contractOwner };
  }

  it("should deploy and return 2 facets", async function () {
    const { diamondStone, diamondLoupeFacet } = await deployDiamond();
    const loupe = diamondLoupeFacet.attach(diamondStone.target);
    const facets = await loupe.facets();
    expect(facets.length).to.equal(2);
  });

  it("should map diamondCut to DiamondCutFacet", async function () {
    const { diamondStone, diamondCutFacet, diamondLoupeFacet } = await deployDiamond();
    const loupe = diamondLoupeFacet.attach(diamondStone.target);
    const sighash = diamondCutFacet._sighash;
    const addr = await loupe.facetAddress(sighash);
    expect(addr).to.equal(diamondCutFacet.target);
  });

  it("should revert on nonexistent function", async function () {
    const { diamondStone, contractOwner } = await deployDiamond();
    const sig = ethers.id("nonexistent()").slice(0, 10);
    await expect(
      contractOwner.sendTransaction({ to: diamondStone.target, data: sig })
    ).to.be.reverted;
  });

  it("should list all facet addresses", async function () {
    const { diamondStone, diamondLoupeFacet, diamondCutFacet } = await deployDiamond();
    const loupe = diamondLoupeFacet.attach(diamondStone.target);
    const addrs = await loupe.facetAddresses();
    expect(addrs).to.include(diamondCutFacet.target);
    expect(addrs).to.include(diamondLoupeFacet.target);
  });
});
