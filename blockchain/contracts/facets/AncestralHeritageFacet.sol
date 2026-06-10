// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { LibTribalStorage } from "../libraries/LibTribalStorage.sol";

error LayerAlreadyInitiated();
error InvalidTribeConfiguration();
error ModifierBoundsViolated();
error PrimordialRootImmutable();
error SystemNotInitialized();

contract AncestralHeritageFacet {
    
    event CradleAwakened(address indexed pioneer, uint256 indexed tribeId, uint256 passiveBuff);
    event MatrixSynchronized();

    /**
     * @notice Seeds the 11 Ancient Cradles of human civilization and binds Index 0.
     * @dev Can only be executed once during the genesis setup sequence.
     */
    function initializeTribalMatrix() external {
        LibTribalStorage.StorageLayout storage s = LibTribalStorage.layout();
        if (s.matrixInitialized) revert LayerAlreadyInitiated();

        // System Anchor: Seed Index 0 (The Khoe-San Foundation)
        s.tribes[0] = LibTribalStorage.TribeConfig({
            name: "Khoe-San First Nations",
            symbol: "KHOE",
            intrinsicPassiveSelector: 0x00000000, // Primordial baseline anchor
            isSeeded: true
        });

        s.matrixInitialized = true;
        emit MatrixSynchronized();
    }

    /**
     * @notice Executes the strategic Tribal Alignment sequence for a Pioneer profile.
     * @param _tribeId The target identity node (0 to 12).
     * @param _passiveSelection The targeted passive trait borrow (only evaluated if _tribeId == 12).
     */
    function awakenCradleIdentity(uint256 _tribeId, uint256 _passiveSelection) external {
        LibTribalStorage.StorageLayout storage s = LibTribalStorage.layout();
        if (!s.matrixInitialized) revert SystemNotInitialized();
        
        LibTribalStorage.PlayerProfile storage profile = s.players[msg.sender];
        if (profile.isInitiated) revert LayerAlreadyInitiated();
        if (_tribeId > 12) revert InvalidTribeConfiguration();

        // Philosophy Enforcement: Managing Index 12 (The Balanced Bridge / Expert Mode)
        if (_tribeId == 12) {
            // A Global Nomad must select an active passive trait from within the first 11 tribes
            if (_passiveSelection == 0 || _passiveSelection > 11) revert ModifierBoundsViolated();
            profile.selectedPassiveBuff = _passiveSelection;
        } else {
            // Standard lineages inherit their native cradle traits directly
            if (_tribeId > 0 && !s.tribes[_tribeId].isSeeded) revert InvalidTribeConfiguration();
            profile.selectedPassiveBuff = _tribeId;
        }

        profile.chosenTribeId = _tribeId;
        profile.ancestralAwakeningTime = block.timestamp;
        profile.isInitiated = true;
        s.totalAwakenedSouls++;

        emit CradleAwakened(msg.sender, _tribeId, profile.selectedPassiveBuff);
    }

    /**
     * @notice Read-only view query returning the full internal matrix tracking for a player.
     */
    function getPlayerProfile(address _pioneer) external view returns (LibTribalStorage.PlayerProfile memory) {
        return LibTribalStorage.layout().players[_pioneer];
    }
}
