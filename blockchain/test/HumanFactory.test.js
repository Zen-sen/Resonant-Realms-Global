const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HumanFactory - Genesis Breath", function () {
  async function deployFullDiamond() {
    const accounts = await ethers.getSigners();
    const owner = accounts[0];

    const DiamondCut = await ethers.getContractFactory("DiamondCutFacet");
    const cut = await DiamondCut.deploy();
    await cut.waitForDeployment();

    const Loupe = await ethers.getContractFactory("DiamondLoupeFacet");
    const loupe = await Loupe.deploy();
    await loupe.waitForDeployment();

    const Heritage = await ethers.getContractFactory("AncestralHeritageFacet");
    const heritage = await Heritage.deploy();
    await heritage.waitForDeployment();

    const Factory = await ethers.getContractFactory("HumanFactoryFacet");
    const factory = await Factory.deploy();
    await factory.waitForDeployment();

    const getSel = (c) => c.interface.fragments.filter((f) => f.type === "function").map((f) => f.selector);

    const diamondCuts = [
      { facetAddress: cut.target, action: 0, functionSelectors: getSel(cut) },
      { facetAddress: loupe.target, action: 0, functionSelectors: getSel(loupe) },
      { facetAddress: heritage.target, action: 0, functionSelectors: getSel(heritage) },
      { facetAddress: factory.target, action: 0, functionSelectors: getSel(factory) },
    ];

    const Diamond = await ethers.getContractFactory("DiamondStone");
    const diamond = await Diamond.deploy(owner.address, diamondCuts);
    await diamond.waitForDeployment();

    return { diamond, cut, loupe, heritage, factory, owner };
  }

  it("should perform genesis breath and create Avatar #0", async function () {
    const { diamond, factory } = await deployFullDiamond();
    const f = factory.attach(diamond.target);

    await f.genesisBreath();
    expect(await f.isGenesisComplete()).to.be.true;
    expect(await f.getGenesisAvatarId()).to.equal(0);

    const avatar = await f.getHuman(0);
    expect(avatar.id).to.equal(0);
    expect(avatar.awakened).to.be.true;
    expect(avatar.vitality).to.equal(100);
    expect(avatar.generation).to.equal(0);
  });

  it("should emit GenesisBreath event", async function () {
    const { diamond, factory } = await deployFullDiamond();
    const f = factory.attach(diamond.target);

    const tx = await f.genesisBreath();
    const receipt = await tx.wait();

    const event = receipt.logs.find(
      (log) => log.fragment?.name === "GenesisBreath"
    );
    expect(event).to.not.be.undefined;
  });

  it("should reject double genesis", async function () {
    const { diamond, factory } = await deployFullDiamond();
    const f = factory.attach(diamond.target);

    await f.genesisBreath();
    await expect(f.genesisBreath()).to.be.revertedWith("HumanFactory: Genesis already complete");
  });

  it("should allow creating additional humans after genesis", async function () {
    const { diamond, factory } = await deployFullDiamond();
    const f = factory.attach(diamond.target);

    await f.genesisBreath();

    await f.createHuman("0x0000000000000000000000000000000000000000000000000000000000000001", 0);

    const human1 = await f.getHuman(1);
    expect(human1.id).to.equal(1);
    expect(human1.awakened).to.be.true;
  });
});
