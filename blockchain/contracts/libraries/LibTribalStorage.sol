// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title Resonant Realms Tribal Storage Layout
 * @notice Secured namespace pattern mapping to eliminate multi-facet collision.
 * @dev Hashed storage slot derived from keccak256("resonantrealms.storage.triballogic");
 */
library LibTribalStorage {
    bytes32 constant STORAGE_SLOT = keccak256("resonantrealms.storage.triballogic");

    struct PlayerProfile {
        uint256 chosenTribeId;       // 0 = Khoe-San, 1-11 = Ancient Cradles, 12 = Global Nomad
        uint256 selectedPassiveBuff; // Tracks the borrowed ancestral trait for Index 12
        uint256 ancestralAwakeningTime;
        uint256 ubuntuPointsBalance;
        bool isInitiated;
    }

    struct TribeConfig {
        string name;
        string symbol;
        bytes4 intrinsicPassiveSelector; // Function selector mapping to the unique trait logic
        bool isSeeded;
    }

    struct StorageLayout {
        mapping(address => PlayerProfile) players;
        mapping(uint256 => TribeConfig) tribes;
        uint256 totalAwakenedSouls;
        bool matrixInitialized;
    }

    function layout() internal pure returns (StorageLayout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
