import { expect } from "chai";
import { ethers } from "hardhat";

describe("AncestralHeritage", function () {
    async function deployDiamond() {
        const accounts = await ethers.getSigners();
        const contractOwner = accounts[0];

        const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
        const diamondCutFacet = await DiamondCutFacet.deploy();
        await diamondCutFacet.waitForDeployment();

        const DiamondLoupeFacet = await ethers.getContractFactory("DiamondLoupeFacet");
        const diamondLoupeFacet = await DiamondLoupeFacet.deploy();
        await diamondLoupeFacet.waitForDeployment();

        const AncestralHeritageFacet = await ethers.getContractFactory("AncestralHeritageFacet");
        const ancestralHeritageFacet = await AncestralHeritageFacet.deploy();
        await ancestralHeritageFacet.waitForDeployment();

        const HumanFactoryFacet = await ethers.getContractFactory("HumanFactoryFacet");
        const humanFactoryFacet = await HumanFactoryFacet.deploy();
        await humanFactoryFacet.waitForDeployment();

        const cutFacetSelectors = Object.keys(diamondCutFacet.interface.functions).map(
            (key) => diamondCutFacet.interface.getSighash(key)
        );
        const loupeSelectors = Object.keys(diamondLoupeFacet.interface.functions).map(
            (key) => diamondLoupeFacet.interface.getSighash(key)
        );
        const heritageSelectors = Object.keys(ancestralHeritageFacet.interface.functions).map(
            (key) => ancestralHeritageFacet.interface.getSighash(key)
        );
        const factorySelectors = Object.keys(humanFactoryFacet.interface.functions).map(
            (key) => humanFactoryFacet.interface.getSighash(key)
        );

        const diamondCuts = [
            { facetAddress: diamondCutFacet.target, action: 0, functionSelectors: cutFacetSelectors },
            { facetAddress: diamondLoupeFacet.target, action: 0, functionSelectors: loupeSelectors },
            { facetAddress: ancestralHeritageFacet.target, action: 0, functionSelectors: heritageSelectors },
            { facetAddress: humanFactoryFacet.target, action: 0, functionSelectors: factorySelectors },
        ];

        const DiamondStone = await ethers.getContractFactory("DiamondStone");
        const diamondStone = await DiamondStone.deploy(contractOwner.address, diamondCuts);
        await diamondStone.waitForDeployment();

        return { diamondStone, ancestralHeritageFacet, humanFactoryFacet, contractOwner };
    }

    it("should allow awakening a cradle", async function () {
        const { diamondStone, ancestralHeritageFacet } = await deployDiamond();
        const heritage = ancestralHeritageFacet.attach(diamondStone.target);

        await heritage.awakenCradle(0, "Mesopotamia", "MES");
        const cradle = await heritage.getCradle(0);
        expect(cradle.name).to.equal("Mesopotamia");
        expect(cradle.symbol).to.equal("MES");
        expect(cradle.awakened).to.be.true;
        expect(cradle.totalAncestors).to.equal(0);
    });

    it("should not allow awakening same cradle twice", async function () {
        const { diamondStone, ancestralHeritageFacet } = await deployDiamond();
        const heritage = ancestralHeritageFacet.attach(diamondStone.target);

        await heritage.awakenCradle(0, "Mesopotamia", "MES");
        await expect(heritage.awakenCradle(0, "Mesopotamia", "MES"))
            .to.be.revertedWith("AncestralHeritage: Cradle already awakened");
    });

    it("should not allow awakening cradle with invalid index", async function () {
        const { diamondStone, ancestralHeritageFacet } = await deployDiamond();
        const heritage = ancestralHeritageFacet.attach(diamondStone.target);

        await expect(heritage.awakenCradle(11, "Invalid", "INV"))
            .to.be.revertedWith("AncestralHeritage: Invalid cradle index");
    });

    it("should activate bridge between two cradles", async function () {
        const { diamondStone, ancestralHeritageFacet, humanFactoryFacet } = await deployDiamond();
        const heritage = ancestralHeritageFacet.attach(diamondStone.target);
        const factory = humanFactoryFacet.attach(diamondStone.target);

        await heritage.awakenCradle(0, "Mesopotamia", "MES");
        await heritage.awakenCradle(1, "Indus", "IND");

        await heritage.activateBridge(0, 1);
        const bridge = await heritage.getBridge();
        expect(bridge.active).to.be.true;
        expect(bridge.fromCradle).to.equal(0);
        expect(bridge.toCradle).to.equal(1);
    });

    it("should cross bridge transferring lineage", async function () {
        const { diamondStone, ancestralHeritageFacet, humanFactoryFacet } = await deployDiamond();
        const heritage = ancestralHeritageFacet.attach(diamondStone.target);
        const factory = humanFactoryFacet.attach(diamondStone.target);

        await heritage.awakenCradle(0, "Mesopotamia", "MES");
        await heritage.awakenCradle(1, "Indus", "IND");
        await factory.genesisBreath();

        await heritage.activateBridge(0, 1);
        await heritage.crossBridge(0);

        const human = await factory.getHuman(0);
        expect(human.cradleOrigin).to.equal(1);
    });

    it("should return all 11 cradles", async function () {
        const { diamondStone, ancestralHeritageFacet } = await deployDiamond();
        const heritage = ancestralHeritageFacet.attach(diamondStone.target);

        const cradles = await heritage.getAllCradles();
        expect(cradles.length).to.equal(11);
    });
});
