// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AncestralUtils
/// @author The Resonant Realms Global
/// @notice Pure math library for bitwise DNA crossovers and ancestral lineage operations
/// @dev All functions are pure, operating only on input data with no storage reads/writes
library AncestralUtils {
    uint256 constant DNA_BITS = 256;
    uint256 constant CRADLE_BITS = 8;
    uint256 constant CRADLE_MASK = 0xFF;
    uint256 constant GENERATION_MASK = 0xFFFF;

    function crossoverDNA(uint256 _dna1, uint256 _dna2, uint256 _mask) internal pure returns (uint256 childDna) {
        childDna = (_dna1 & _mask) | (_dna2 & ~_mask);
    }

    function mutateDNA(uint256 _dna, uint256 _mutationMask) internal pure returns (uint256 mutatedDna) {
        mutatedDna = _dna ^ _mutationMask;
    }

    function extractCradleLineage(uint256 _dna, uint256 _cradleIndex) internal pure returns (uint256 lineage) {
        require(_cradleIndex < 11, "AncestralUtils: Cradle index out of range");
        uint256 shift = _cradleIndex * CRADLE_BITS;
        lineage = (_dna >> shift) & CRADLE_MASK;
    }

    function extractGeneration(uint256 _dna) internal pure returns (uint256 generation) {
        generation = _dna & GENERATION_MASK;
    }

    function setCradleLineage(uint256 _dna, uint256 _cradleIndex, uint256 _lineage) internal pure returns (uint256) {
        require(_cradleIndex < 11, "AncestralUtils: Cradle index out of range");
        require(_lineage <= CRADLE_MASK, "AncestralUtils: Lineage exceeds 8 bits");
        uint256 shift = _cradleIndex * CRADLE_BITS;
        uint256 clearMask = ~(CRADLE_MASK << shift);
        return (_dna & clearMask) | (_lineage << shift);
    }

    function combineAncestralTraits(uint256[11] memory _cradleTraits) internal pure returns (uint256 combinedDna) {
        for (uint256 i = 0; i < 11; i++) {
            uint256 trait = _cradleTraits[i] & CRADLE_MASK;
            combinedDna |= trait << (i * CRADLE_BITS);
        }
    }

    function hashLineage(uint256 _dna) internal pure returns (uint256 lineageHash) {
        lineageHash = uint256(keccak256(abi.encode(_dna)));
    }

    function isDescendantOf(uint256 _childDna, uint256 _parentDna, uint256 _mask) internal pure returns (bool) {
        return (_childDna & _mask) == (_parentDna & _mask);
    }

    function computeVitality(uint256 _dna, uint256 _cradleCount) internal pure returns (uint256 vitality) {
        uint256 activeBits;
        uint256 temp = _dna;
        for (uint256 i = 0; i < DNA_BITS; i++) {
            if (temp & 1 == 1) {
                activeBits++;
            }
            temp >>= 1;
        }
        vitality = (activeBits * _cradleCount) % 100;
    }
}
