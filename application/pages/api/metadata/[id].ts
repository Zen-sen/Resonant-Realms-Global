import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// The 11 Universal Cradles of Civilization Palette & Symbol Mapping
const CRADLE_MATRIX: Record<number, { name: string; symbol: string; color: string; trait: string }> = {
  1: { name: "Plains Tribes", symbol: "PLN", color: "#FFD700", trait: "Animist Resource Attunement" },
  2: { name: "Mesoamerican Cradle", symbol: "MESO", color: "#50C878", trait: "Astro-Mathematical Time Distortion" },
  3: { name: "Andean Cradle", symbol: "AND", color: "#4A90D9", trait: "Quipu Ledger Compression" },
  4: { name: "Nile Valley Kemet", symbol: "NIL", color: "#E74C3C", trait: "Alchemical Geometric Transition" },
  5: { name: "West African Nok", symbol: "NOK", color: "#9B59B6", trait: "Griot Oral Resonance" },
  6: { name: "Indus Valley", symbol: "IND", color: "#F39C12", trait: "Hydraulic Structural Grid-Defense" },
  7: { name: "Vedic Matrix", symbol: "VED", color: "#1ABC9C", trait: "Meditative Layer Synchronization" },
  8: { name: "Yellow River Cradle", symbol: "YEL", color: "#E67E22", trait: "Dynamic Character Flow Logic" },
  9: { name: "Aboriginal Dreamtime", symbol: "DRM", color: "#3498DB", trait: "Songline Auditory Cartography" },
  10: { name: "Mesopotamian Sumer", symbol: "MES", color: "#2ECC71", trait: "Cuneiform Code Enforcement" },
  11: { name: "Nordic/Celtic Clans", symbol: "NORD", color: "#E91E63", trait: "Elemental Runestave Acceleration" }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const avatarId = parseInt(id as string, 10);

  if (isNaN(avatarId)) {
    return res.status(400).json({ error: "Invalid Lineage ID" });
  }

  // Deterministic DNA derivation for consistent asset generation
  const deterministicHash = crypto.createHash('sha256').update(avatarId.toString()).digest('hex');
  const primaryCradleIndex = (avatarId === 0) ? 0 : (avatarId % 11) + 1;

  // SYSTEM ANCHOR: Avatar #0 (The Primordial Root)
  if (avatarId === 0) {
    return res.status(200).json({
      id: 0,
      name: "Avatar #0: The Primordial Root",
      symbol: "ROOT",
      description: "The absolute motherboard of human consciousness and DNA. Awakened at the geographic cradle of humanity in Southern Africa, this avatar carries the pristine, unfragmented frequency from before the Great Forgetting. It anchors the entire multi-facet proxy state.",
      attributes: [
        { trait_type: "Cradle Lineage", value: "The First Peoples" },
        { trait_type: "Core Frequency", value: "Absolute Anchor" },
        { trait_type: "Vitality", value: "999" },
        { trait_type: "System Role", value: "Foundation Layout" },
        { trait_type: "DNA Marker", value: `0x${deterministicHash}` }
      ],
      background_color: "000000",
      image_style: "Core Primal Luminescence"
    });
  }

  // LORE ENFORCEMENT: System handling for Index 12 (The Global Nomad)
  // This executes the "Balanced Bridge / Expert Mode" narrative parameters
  const isGlobalNomad = (avatarId % 13 === 12);
  
  if (isGlobalNomad) {
    return res.status(200).json({
      id: avatarId,
      name: `Lineage #${avatarId}: The Global Nomad`,
      symbol: "NOMAD",
      description: "The Anti-Pattern Archetype. Born of the diaspora, migration routes, and blended borders, the Global Nomad carries no pre-packaged tribal frequency. This asset represents the Integration Layer. It is highly volatile to the Mirror-Adversary's predictions because it can dynamically bridge unrelated cultures together, crashing the Mimic's predictive loops.",
      attributes: [
        { trait_type: "Cradle Lineage", value: "The Diaspora (Index 12)" },
        { trait_type: "Operational Mode", value: "Balanced Bridge (Expert Mode)" },
        { trait_type: "Passive Profile", value: "User Selectable Options (1-11)" },
        { trait_type: "AI Vulnerability", value: "0% (Un-replicable)" },
        { trait_type: "DNA Marker", value: `0x${deterministicHash}` }
      ],
      background_color: "PRISMATIC",
      image_style: "Shifting Multi-Color Particle Cascade"
    });
  }

  // Default Lineage Construction (Indices 1 to 11)
  const cradle = CRADLE_MATRIX[primaryCradleIndex];
  return res.status(200).json({
    id: avatarId,
    name: `Lineage #${avatarId}: Awakened Soul of ${cradle.name}`,
    symbol: cradle.symbol,
    description: `A human avatar awakened from the deep sleep of the Great Forgetting. Having broken through the static noise of modern digital manipulation via the match-3 resonance matrix, this avatar restores a pure stream of historical human consciousness to the global network ledger.`,
    attributes: [
      { trait_type: "Cradle Lineage", value: cradle.name },
      { trait_type: "Historical Mastery", value: cradle.trait },
      { trait_type: "Neon Color Signifier", value: cradle.color },
      { trait_type: "Lineage Stage", value: `Generation ${Math.floor(avatarId / 100) + 1}` },
      { trait_type: "DNA Marker", value: `0x${deterministicHash}` }
    ],
    background_color: cradle.color.replace("#", ""),
    image_style: "Neon Vector Glow"
  });
}
