import { ethers } from "hardhat";
import { Interface } from "ethers";

const DIAMOND_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

async function main() {
    const [deployer, player] = await ethers.getSigners();
    console.log("=== RESONANT REALMS GENESIS VERIFICATION ===\n");
    console.log("Deployer:", deployer.address);
    console.log("Player:", player.address);
    console.log("Diamond:", DIAMOND_ADDRESS, "\n");

    // Get facet ABIs for calling through Diamond proxy
    const AncestralHeritage = await ethers.getContractFactory("AncestralHeritageFacet");
    const HumanFactory = await ethers.getContractFactory("HumanFactoryFacet");
    const MirrorAdversary = await ethers.getContractFactory("MirrorAdversaryFacet");
    const DiamondLoupe = await ethers.getContractFactory("DiamondLoupeFacet");

    // Attach to Diamond proxy
    const heritage = AncestralHeritage.attach(DIAMOND_ADDRESS);
    const factory = HumanFactory.attach(DIAMOND_ADDRESS);
    const adversary = MirrorAdversary.attach(DIAMOND_ADDRESS);
    const loupe = DiamondLoupe.attach(DIAMOND_ADDRESS);

    // Step 1: Initialize Tribal Matrix
    console.log("[1/5] Initializing Tribal Matrix (seeds Khoe-San at Index 0)...");
    const initTx = await heritage.connect(deployer).initializeTribalMatrix();
    await initTx.wait();
    console.log("  ✓ Matrix initialized. Tx:", initTx.hash);
    console.log("  ✓ Khoe-San First Nations seeded at Index 0\n");

    // Step 2: Verify Matrix Initialized
    console.log("[2/5] Verifying matrix state...");
    const profile0 = await heritage.getPlayerProfile(deployer.address);
    console.log("  Deployer initiated:", profile0.isInitiated, "\n");

    // Step 3: Awaken Cradle Identity - Global Nomad (Index 12) with Nile Valley Kemet passive (Index 4)
    console.log("[3/5] Awakening Global Nomad (Index 12) with Nile Valley Kemet passive (Index 4)...");
    const awakenTx = await heritage.connect(player).awakenCradleIdentity(12, 4);
    await awakenTx.wait();
    console.log("  ✓ awakenCradleIdentity(12, 4) executed. Tx:", awakenTx.hash, "\n");

    // Step 4: Verify Player Profile
    console.log("[4/5] Verifying player profile...");
    const profile = await heritage.getPlayerProfile(player.address);
    console.log("  Chosen Tribe ID:", profile.chosenTribeId.toString());
    console.log("  Passive Buff:", profile.selectedPassiveBuff.toString());
    console.log("  Is Initiated:", profile.isInitiated);
    console.log("  Awakening Time:", new Date(Number(profile.ancestralAwakeningTime) * 1000).toISOString(), "\n");

    // Step 5: Genesis Breath
    console.log("[5/5] Executing Genesis Breath...");
    const breathTx = await factory.connect(deployer).genesisBreath();
    await breathTx.wait();
    console.log("  ✓ genesisBreath() executed. Tx:", breathTx.hash);

    const avatar0 = await factory.getHuman(0);
    console.log("  Avatar #0 created!");
    console.log("  DNA:", avatar0.dna.toString());
    console.log("  Generation:", avatar0.generation.toString());
    console.log("  Vitality:", avatar0.vitality.toString());
    console.log("  Cradle Origin:", avatar0.cradleOrigin.toString());
    console.log("  Awakened:", avatar0.awakened);
    // Step 6: Anti-Cheat - Initialize player on MirrorAdversaryFacet
    console.log("\n[6/8] Initializing MirrorAdversary for player...");
    const initPlayerTx = await adversary.connect(player).initializePlayer();
    await initPlayerTx.wait();
    console.log("  ✓ Player initialized on MirrorAdversary. Tx:", initPlayerTx.hash);

    // Step 7: Anti-Cheat - Report anomaly with speed < 300ms
    console.log("\n[7/8] Testing anti-cheat - reporting anomaly at 150ms...");
    const anomalyTx = await adversary.connect(player).reportAnomaly(150);
    await anomalyTx.wait();
    console.log("  ✓ reportAnomaly(150) executed. Tx:", anomalyTx.hash);

    const playerState = await adversary.getPlayerState(player.address);
    console.log("  Static Score:", playerState.staticScore.toString());
    console.log("  Adversary Buffer:", playerState.adversaryBuffer.toString());
    console.log("  Locked:", playerState.locked);

    // Trigger multiple anomalies to hit the lock threshold
    for (let i = 0; i < 25; i++) {
        const tx = await adversary.connect(player).reportAnomaly(50);
        await tx.wait();
    }
    const finalState = await adversary.getPlayerState(player.address);
    console.log("  After 26 anomalies - Locked:", finalState.locked);
    console.log("  Adversary Buffer:", finalState.adversaryBuffer.toString());
    console.log("  Static Score:", finalState.staticScore.toString());

    // Step 8: Unlock via proveAncestralAlignment
    console.log("\n[8/8] Testing unlock via proveAncestralAlignment(0)...");
    const unlockTx = await adversary.connect(player).proveAncestralAlignment(0);
    await unlockTx.wait();
    console.log("  ✓ proveAncestralAlignment(0) executed. Tx:", unlockTx.hash);
    const unlockedState = await adversary.getPlayerState(player.address);
    console.log("  Locked:", unlockedState.locked);
    console.log("  Buffer:", unlockedState.adversaryBuffer.toString());
    console.log("  Score:", unlockedState.staticScore.toString());
    console.log("  New Nonce:", unlockedState.nonce.toString());

    console.log("\n=== GENESIS VERIFICATION COMPLETE ===");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("VERIFICATION FAILED:", error);
        process.exit(1);
    });
