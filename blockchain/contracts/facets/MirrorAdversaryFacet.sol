// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibAppStorage} from "../libraries/LibAppStorage.sol";

/// @title MirrorAdversaryFacet
/// @author The Resonant Realms Global
/// @notice The Mimic combat & adversaryBuffer — replay protection, speed anomaly detection, and state lock
/// @dev Maintains player nonces to prevent replay attacks. The adversaryBuffer acts as a state filter:
///      when the off-chain client detects speed anomalies, The Static score rises, locking state updates
///      until an on-chain ancestral alignment proof resets the barrier.
contract MirrorAdversaryFacet {
    event NonceConsumed(address indexed player, uint256 nonce);
    event StaticScoreIncreased(address indexed player, uint256 newScore);
    event PlayerLocked(address indexed player);
    event PlayerUnlocked(address indexed player, uint256 resetNonce);
    event AdversaryBufferFlushed(address indexed player);

    uint256 constant STATIC_THRESHOLD_DEFAULT = 100;
    uint256 constant ADVERSARY_BUFFER_LIMIT = 25;
    uint256 constant HUMAN_MATCH_SPEED_FLOOR = 300; // minimum ms between human-possible matches

    function initializePlayer() external {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        require(s.playerStates[msg.sender].nonce == 0, "MirrorAdversary: Player already initialized");

        s.playerStates[msg.sender] = LibAppStorage.PlayerState({
            nonce: 1,
            adversaryBuffer: 0,
            staticScore: 0,
            lastMatchTimestamp: block.timestamp,
            locked: false
        });
    }

    /// @notice Verify a signed match payload hasn't been replayed
    function consumeNonce(uint256 _nonce) external {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        LibAppStorage.PlayerState storage ps = s.playerStates[msg.sender];
        require(ps.nonce > 0, "MirrorAdversary: Player not initialized");
        require(_nonce == ps.nonce, "MirrorAdversary: Invalid nonce");
        require(!ps.locked, "MirrorAdversary: Player is locked");

        ps.nonce++;
        emit NonceConsumed(msg.sender, _nonce);
    }

    /// @notice Called by the validateMatch edge engine proxy to report speed anomalies.
    ///         Increases The Static score. When the score exceeds threshold, the player locks.
    function reportAnomaly(uint256 _speedMs) external {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        LibAppStorage.PlayerState storage ps = s.playerStates[msg.sender];
        require(ps.nonce > 0, "MirrorAdversary: Player not initialized");

        if (_speedMs < HUMAN_MATCH_SPEED_FLOOR) {
            ps.staticScore += 10;
            ps.adversaryBuffer += 1;
        } else {
            if (ps.staticScore > 0) ps.staticScore -= 1;
            if (ps.adversaryBuffer > 0) ps.adversaryBuffer -= 1;
        }

        if (ps.adversaryBuffer >= ADVERSARY_BUFFER_LIMIT || ps.staticScore >= s.staticThreshold) {
            ps.locked = true;
            emit PlayerLocked(msg.sender);
        }

        emit StaticScoreIncreased(msg.sender, ps.staticScore);
    }

    /// @notice Reset the state barrier by proving ancestral alignment on-chain.
    ///         Consumes the current nonce and resets adversaryBuffer and staticScore.
    function proveAncestralAlignment(uint256 _avatarId) external {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        LibAppStorage.PlayerState storage ps = s.playerStates[msg.sender];
        require(ps.locked, "MirrorAdversary: Player not locked");
        require(s.humans[_avatarId].awakened, "MirrorAdversary: Avatar not awakened");

        ps.locked = false;
        ps.adversaryBuffer = 0;
        ps.staticScore = 0;
        ps.nonce++;
        s.staticThreshold = STATIC_THRESHOLD_DEFAULT;

        emit PlayerUnlocked(msg.sender, ps.nonce);
        emit AdversaryBufferFlushed(msg.sender);
    }

    /// @notice Set the static threshold (governance-capable)
    function setStaticThreshold(uint256 _threshold) external {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        s.staticThreshold = _threshold;
    }

    function getPlayerState(address _player) external view returns (LibAppStorage.PlayerState memory) {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        return s.playerStates[_player];
    }

    function getAdversaryBuffer(address _player) external view returns (uint256) {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        return s.playerStates[_player].adversaryBuffer;
    }

    function isLocked(address _player) external view returns (bool) {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        return s.playerStates[_player].locked;
    }

    function getValidNonce(address _player) external view returns (uint256) {
        LibAppStorage.AppStorage storage s = LibAppStorage.appStorage();
        return s.playerStates[_player].nonce;
    }
}
