import { expect } from "chai";
import { ethers } from "hardhat";

describe("HumanFactory - Genesis Breathing Test", function () {
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

        return {
            diamondStone,
            diamondCutFacet,
            diamondLoupeFacet,
            ancestralHeritageFacet,
            humanFactoryFacet,
            contractOwner,
            accounts,
        };
    }

    it("should deploy the Diamond with all facets", async function () {
        const { diamondStone } = await deployDiamond();
        expect(await diamondStone.target).to.be.properAddress;
    });

    it("should perform Genesis Breath and create Avatar #0", async function () {
        const { diamondStone, humanFactoryFacet, contractOwner } = await deployDiamond();
        const factory = humanFactoryFacet.attach(diamondStone.target);

        // Genesis Breath creates Avatar #0 (The Primordial Root)
        const tx = await factory.genesisBreath();
        const receipt = await tx.wait();

        expect(await factory.isGenesisComplete()).to.be.true;
        expect(await factory.getGenesisAvatarId()).to.equal(0);

        const avatar0 = await factory.getHuman(0);
        expect(avatar0.id).to.equal(0);
        expect(avatar0.awakened).to.be.true;
        expect(avatar0.vitality).to.equal(100);
        expect(avatar0.generation).to.equal(0);

        expect(await factory.getTotalHumans()).to.equal(1);
    });

    it("should emit GenesisBreath event with correct avatarId", async function () {
        const { diamondStone, humanFactoryFacet } = await deployDiamond();
        const factory = humanFactoryFacet.attach(diamondStone.target);

        await expect(factory.genesisBreath())
            .to.emit(factory, "GenesisBreath")
            .withArgs(0, ethers.anyValue);
    });

    it("should not allow Genesis Breath twice", async function () {
        const { diamondStone, humanFactoryFacet } = await deployDiamond();
        const factory = humanFactoryFacet.attach(diamondStone.target);

        await factory.genesisBreath();
        await expect(factory.genesisBreath()).to.be.revertedWith("HumanFactory: Genesis already complete");
    });

    it("should awaken all 11 cradles after Genesis Breath", async function () {
        const { diamondStone, ancestralHeritageFacet } = await deployDiamond();
        const heritage = ancestralHeritageFacet.attach(diamondStone.target);
        const factory = await ethers.getContractFactory("HumanFactoryFacet");
        const humanFactory = factory.attach(diamondStone.target);

        await humanFactory.genesisBreath();

        for (let i = 0; i < 11; i++) {
            expect(await heritage.isCradleAwakened(i)).to.be.true;
        }
    });

    it("should allow creating additional humans after genesis", async function () {
        const { diamondStone, humanFactoryFacet, ancestralHeritageFacet } = await deployDiamond();
        const factory = humanFactoryFacet.attach(diamondStone.target);
        const heritage = ancestralHeritageFacet.attach(diamondStone.target);

        await factory.genesisBreath();

        const cradleDna = "0x0000000000000000000000000000000000000000000000000000000000000001";
        const tx = await factory.createHuman(cradleDna, 0);
        await tx.wait();

        expect(await factory.getTotalHumans()).to.equal(2);

        const human1 = await factory.getHuman(1);
        expect(human1.id).to.equal(1);
        expect(human1.awakened).to.be.true;
    });

    it("should revert creating human with unawakened cradle", async function () {
        const { diamondStone, humanFactoryFacet } = await deployDiamond();
        const factory = humanFactoryFacet.attach(diamondStone.target);

        await factory.genesisBreath();

        const cradleDna = "0x0000000000000000000000000000000000000000000000000000000000000001";
        await expect(factory.createHuman(cradleDna, 99)).to.be.reverted;
    });
});
