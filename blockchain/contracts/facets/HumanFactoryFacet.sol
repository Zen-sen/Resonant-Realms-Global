// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibAppStorage} from "../libraries/LibAppStorage.sol";
import {AncestralUtils} from "../libraries/AncestralUtils.sol";

/// @title HumanFactoryFacet
/// @author The Resonant Realms Global
/// @notice Handles Human Avatar generation and the Genesis Breath creation
/// @dev The Genesis Breath creates Avatar #0 (The Primordial Root), the first human
contract HumanFactoryFacet {
    event HumanCreated(uint256 indexed id, uint256 dna, uint256 cradleOrigin, uint256 generation);
    event GenesisBreath(uint256 indexed avatarId, uint256 dna);

    uint256 constant NUM_CRADLES = 11;
    uint256 constant INDEX_12_BRIDGE = 12;
    uint256 constant PRIMORDIAL_DNA = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
    uint256 constant PRIMORDIAL_ROOT_ID = 0;

    function createHuman(uint256 _dna, uint256 _cradleOrigin) external returns (uint256 humanId) {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();

        require(_cradleOrigin < 11, "HumanFactory: Invalid cradle origin");
        require(s.cradles[_cradleOrigin].awakened, "HumanFactory: Cradle not awakened");

        humanId = s.nextHumanId++;

        uint256 generation = AncestralUtils.extractGeneration(_dna);
        uint256 vitality = AncestralUtils.computeVitality(_dna, 1);

        s.humans[humanId] = LibAppStorage.Human({
            id: humanId,
            dna: _dna,
            cradleOrigin: _cradleOrigin,
            generation: generation,
            genesisTimestamp: block.timestamp,
            lineageMask: AncestralUtils.hashLineage(_dna),
            vitality: vitality,
            awakened: true
        });

        s.cradles[_cradleOrigin].totalAncestors++;

        emit HumanCreated(humanId, _dna, _cradleOrigin, generation);
    }

    function genesisBreath() external returns (uint256 avatarId) {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        require(!s.genesisComplete, "HumanFactory: Genesis already complete");

        avatarId = s.nextHumanId++;
        require(avatarId == PRIMORDIAL_ROOT_ID, "HumanFactory: Avatar #0 must be first");

        // The Primordial Root: a perfect blend of all 11 cradle lineages
        uint256[11] memory cradleTraits;
        for (uint256 i = 0; i < 11; i++) {
            cradleTraits[i] = uint256(keccak256(abi.encodePacked(block.timestamp, i, PRIMORDIAL_DNA))) & 0xFF;
        }
        uint256 primordialDna = AncestralUtils.combineAncestralTraits(cradleTraits);

        uint256 genesisGeneration = 0;
        uint256 vitality = 100;

        s.humans[avatarId] = LibAppStorage.Human({
            id: avatarId,
            dna: primordialDna,
            cradleOrigin: INDEX_12_BRIDGE,
            generation: genesisGeneration,
            genesisTimestamp: block.timestamp,
            lineageMask: AncestralUtils.hashLineage(primordialDna),
            vitality: vitality,
            awakened: true
        });

        // Mark genesis as complete
        s.genesisComplete = true;
        s.genesisAvatarId = avatarId;

        // All 11 cradles gain the Primordial Root as their first ancestor
        for (uint256 i = 0; i < 11; i++) {
            if (!s.cradles[i].awakened) {
                s.cradles[i] = LibAppStorage.Cradle({
                    cradleId: i,
                    name: "",
                    symbol: "",
                    totalAncestors: 1,
                    activePower: 1,
                    passiveBuffer: 0,
                    awakened: true
                });
            }
        }

        emit GenesisBreath(avatarId, primordialDna);
        emit HumanCreated(avatarId, primordialDna, INDEX_12_BRIDGE, genesisGeneration);
    }

    function getHuman(uint256 _humanId) external view returns (LibAppStorage.Human memory) {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        require(_humanId < s.nextHumanId, "HumanFactory: Human does not exist");
        return s.humans[_humanId];
    }

    function isGenesisComplete() external view returns (bool) {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        return s.genesisComplete;
    }

    function getGenesisAvatarId() external view returns (uint256) {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        require(s.genesisComplete, "HumanFactory: Genesis not complete");
        return s.genesisAvatarId;
    }

    function getTotalHumans() external view returns (uint256) {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        return s.nextHumanId;
    }
}
