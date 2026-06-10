// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title LibAppStorage
/// @author The Resonant Realms Global
/// @notice This library defines the AppStorage struct and its fixed storage slot
/// @dev The AppStorage struct is used to manage the global matrix state of the game
library LibAppStorage {
    struct Cradle {
        uint256 cradleId;
        string name;
        string symbol;
        uint256 totalAncestors;
        uint256 activePower;
        uint256 passiveBuffer;
        bool awakened;
    }

    struct NomadBridge {
        uint256 fromCradle;
        uint256 toCradle;
        uint256 bridgeEnergy;
        uint256 lastTransfer;
        bool active;
    }

    struct Human {
        uint256 id;
        uint256 dna;
        uint256 cradleOrigin;
        uint256 generation;
        uint256 genesisTimestamp;
        uint256 lineageMask;
        uint256 vitality;
        bool awakened;
    }

    struct PlayerState {
        uint256 nonce;
        uint256 adversaryBuffer;
        uint256 staticScore;
        uint256 lastMatchTimestamp;
        bool locked;
    }

    struct AppStorage {
        uint256[13] globalMatrixState;
        mapping(uint256 => Cradle) cradles;
        NomadBridge nomadBridge;
        mapping(uint256 => Human) humans;
        uint256 nextHumanId;
        bool genesisComplete;
        uint256 genesisAvatarId;
        mapping(address => PlayerState) playerStates;
        uint256 staticThreshold;
    }

    bytes32 constant AppStoragePosition = keccak256("resonant.realms.global.storage");

    function appStorage() internal pure returns (AppStorage storage s) {
        bytes32 position = AppStoragePosition;
        assembly {
            s.slot := position
        }
    }
}
