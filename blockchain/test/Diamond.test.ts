import { expect } from "chai";
import { ethers } from "hardhat";

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

        const cutFacetSelectors = Object.keys(diamondCutFacet.interface.functions).map(
            (key) => diamondCutFacet.interface.getSighash(key)
        );
        const loupeSelectors = Object.keys(diamondLoupeFacet.interface.functions).map(
            (key) => diamondLoupeFacet.interface.getSighash(key)
        );

        const diamondCuts = [
            { facetAddress: diamondCutFacet.target, action: 0, functionSelectors: cutFacetSelectors },
            { facetAddress: diamondLoupeFacet.target, action: 0, functionSelectors: loupeSelectors },
        ];

        const DiamondStone = await ethers.getContractFactory("DiamondStone");
        const diamondStone = await DiamondStone.deploy(contractOwner.address, diamondCuts);
        await diamondStone.waitForDeployment();

        return { diamondStone, diamondCutFacet, diamondLoupeFacet, contractOwner, accounts };
    }

    it("should deploy diamond and return facets", async function () {
        const { diamondStone, diamondLoupeFacet } = await deployDiamond();
        const loupe = diamondLoupeFacet.attach(diamondStone.target);

        const facets = await loupe.facets();
        expect(facets.length).to.be.greaterThan(0);
    });

    it("should return correct facet address for known selectors", async function () {
        const { diamondStone, diamondCutFacet, diamondLoupeFacet } = await deployDiamond();
        const loupe = diamondLoupeFacet.attach(diamondStone.target);

        const facetAddr = await loupe.facetAddress(diamondCutFacet.interface.getSighash("diamondCut"));
        expect(facetAddr).to.equal(diamondCutFacet.target);
    });

    it("should return all facet addresses", async function () {
        const { diamondStone, diamondLoupeFacet, diamondCutFacet } = await deployDiamond();
        const loupe = diamondLoupeFacet.attach(diamondStone.target);

        const addresses = await loupe.facetAddresses();
        expect(addresses).to.include(diamondCutFacet.target);
        expect(addresses).to.include(diamondLoupeFacet.target);
    });

    it("should return function selectors per facet", async function () {
        const { diamondStone, diamondLoupeFacet, diamondCutFacet } = await deployDiamond();
        const loupe = diamondLoupeFacet.attach(diamondStone.target);

        const selectors = await loupe.facetFunctionSelectors(diamondCutFacet.target);
        expect(selectors.length).to.be.greaterThan(0);
    });

    it("should revert calling non-existent function", async function () {
        const { diamondStone, contractOwner } = await deployDiamond();
        const randomSig = ethers.id("nonexistent()").slice(0, 10);

        await expect(
            contractOwner.sendTransaction({
                to: diamondStone.target,
                data: randomSig,
            })
        ).to.be.reverted;
    });
});
