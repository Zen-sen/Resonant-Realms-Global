const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("🛡️ Resonant Realms: Tribal Logic & Ancestral Matrix Initialization", function () {
  let AncestralHeritageFacet;
  let heritageFacet;
  let deployer, pioneer1, pioneer2, attacker;

  beforeEach(async function () {
    // 1. Setup account signatories from the local Hardhat node
    [deployer, pioneer1, pioneer2, attacker] = await ethers.getSigners();

    // 2. Deploy the AncestralHeritageFacet blueprint
    // Note: In production, this facet is linked to the core Diamond proxy via DiamondCut.
    // For unit testing localized state logic, we compile and test the facet interface directly.
    const AncestralHeritageFactory = await ethers.getContractFactory("AncestralHeritageFacet");
    heritageFacet = await AncestralHeritageFactory.deploy();
    await heritageFacet.waitForDeployment();

    // 3. Initialize the universal tribal matrix mapping (Index 0 Anchor)
    await heritageFacet.initializeTribalMatrix();
  });

  describe("📍 Matrix Setup & Initialization Rules", function () {
    it("Should reject duplicate attempts to initialize the matrix", async function () {
      await expect(
        heritageFacet.initializeTribalMatrix()
      ).to.be.revertedWithCustomError(heritageFacet, "LayerAlreadyInitiated");
    });

    it("Should verify Index 0 is correctly anchored to the Khoe-San First Nations", async function () {
      // Query player profile for address zero or clean state to verify registry visibility
      const uninitiatedProfile = await heritageFacet.getPlayerProfile(pioneer1.address);
      expect(uninitiatedProfile.isInitiated).to.equal(false);
      expect(uninitiatedProfile.chosenTribeId).to.equal(0n);
    });
  });

  describe("🧬 Path A: Standard Cradle Awakening Sequence", function () {
    it("Should allow a Pioneer to choose a valid, seeded tribal pathway", async function () {
      // Connect as Pioneer 1 and select Index 0 (Khoe-San Foundation)
      // Standard tribes pass 0 as the passive buffer selection since they inherit traits directly
      await expect(heritageFacet.connect(pioneer1).awakenCradleIdentity(0, 0))
        .to.emit(heritageFacet, "CradleAwakened")
        .withArgs(pioneer1.address, 0n, 0n);

      const profile = await heritageFacet.getPlayerProfile(pioneer1.address);
      expect(profile.isInitiated).to.equal(true);
      expect(profile.chosenTribeId).to.equal(0n);
      expect(profile.selectedPassiveBuff).to.equal(0n);
    });

    it("Should block a user from initiating their lineage a second time", async function () {
      await heritageFacet.connect(pioneer1).awakenCradleIdentity(0, 0);
      
      await expect(
        heritageFacet.connect(pioneer1).awakenCradleIdentity(0, 0)
      ).to.be.revertedWithCustomError(heritageFacet, "LayerAlreadyInitiated");
    });

    it("Should reject out-of-bounds tribe identification indices", async function () {
      // Indices above 12 do not exist in the human historical matrix mapping
      await expect(
        heritageFacet.connect(pioneer2).awakenCradleIdentity(13, 0)
      ).to.be.revertedWithCustomError(heritageFacet, "InvalidTribeConfiguration");
    });
  });

  describe("🌉 Path B: Index 12 The Balanced Bridge (Expert Mode)", function () {
    it("Should permit a Global Nomad to selectively copy a passive buff from an ancient cradle (1-11)", async function () {
      // Connect as Pioneer 2, select Index 12 (Nomad), and choose Index 4 (Nile Valley Kemet buff)
      await expect(heritageFacet.connect(pioneer2).awakenCradleIdentity(12, 4))
        .to.emit(heritageFacet, "CradleAwakened")
        .withArgs(pioneer2.address, 12n, 4n);

      const profile = await heritageFacet.getPlayerProfile(pioneer2.address);
      expect(profile.isInitiated).to.equal(true);
      expect(profile.chosenTribeId).to.equal(12n); // Authenticated Identity: Nomad
      expect(profile.selectedPassiveBuff).to.equal(4n); // Extracted Power Node: Kemet
    });

    it("Should reject Global Nomad configuration if the borrowed passive selection is out of bounds", async function () {
      // Fail Condition 1: Attempting to pass 0 as a selective buff modifier
      await expect(
        heritageFacet.connect(attacker).awakenCradleIdentity(12, 0)
      ).to.be.revertedWithCustomError(heritageFacet, "ModifierBoundsViolated");

      // Fail Condition 2: Attempting to pass an index greater than the 11 original cradles
      await expect(
        heritageFacet.connect(attacker).awakenCradleIdentity(12, 12)
      ).to.be.revertedWithCustomError(heritageFacet, "ModifierBoundsViolated");
    });
  });
});
