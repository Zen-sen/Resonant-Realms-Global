import { ethers } from "ethers";
import AncestralHeritageABI from "./abis/AncestralHeritageFacet.json";
import HumanFactoryABI from "./abis/HumanFactoryFacet.json";
import MirrorAdversaryABI from "./abis/MirrorAdversaryFacet.json";

const DIAMOND_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

export function getDiamondContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(DIAMOND_ADDRESS, AncestralHeritageABI.abi, signerOrProvider);
}

export function getHumanFactoryContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(DIAMOND_ADDRESS, HumanFactoryABI.abi, signerOrProvider);
}

export function getMirrorAdversaryContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(DIAMOND_ADDRESS, MirrorAdversaryABI.abi, signerOrProvider);
}

export async function awakenTribeOnChain(
  provider: ethers.BrowserProvider,
  tribeId: number,
  passiveSelection: number
) {
  const signer = await provider.getSigner();
  const diamond = getDiamondContract(signer);
  const tx = await diamond.awakenCradleIdentity(tribeId, passiveSelection);
  return await tx.wait();
}

export async function getPlayerProfileOnChain(
  provider: ethers.Provider,
  address: string
) {
  const diamond = getDiamondContract(provider);
  return await diamond.getPlayerProfile(address);
}

export async function triggerGenesisBreath(provider: ethers.BrowserProvider) {
  const signer = await provider.getSigner();
  const factory = getHumanFactoryContract(signer);
  const tx = await factory.genesisBreath();
  return await tx.wait();
}

export async function createHumanOnChain(
  provider: ethers.BrowserProvider,
  dna: bigint,
  cradleOrigin: number
) {
  const signer = await provider.getSigner();
  const factory = getHumanFactoryContract(signer);
  const tx = await factory.createHuman(dna, cradleOrigin);
  return await tx.wait();
}

export async function reportAnomalyOnChain(
  provider: ethers.BrowserProvider,
  speedMs: number
) {
  const signer = await provider.getSigner();
  const adversary = getMirrorAdversaryContract(signer);
  const tx = await adversary.reportAnomaly(speedMs);
  return await tx.wait();
}

export async function getPlayerStateOnChain(
  provider: ethers.Provider,
  address: string
) {
  const adversary = getMirrorAdversaryContract(provider);
  return await adversary.getPlayerState(address);
}

export type { ethers };
