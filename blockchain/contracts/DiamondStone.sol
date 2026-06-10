// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibDiamond} from "./libraries/LibDiamond.sol";
import {LibAppStorage} from "./libraries/LibAppStorage.sol";
import {IDiamondCut} from "./libraries/IDiamondCut.sol";

/// @title DiamondStone
/// @author The Resonant Realms Global
/// @notice This is the core Diamond proxy contract, implementing EIP-2535.
/// @dev It delegates all calls to registered facets, allowing for modular and upgradeable smart contract functionality.
contract DiamondStone {
    constructor(address _contractOwner, IDiamondCut.FacetCut[] memory _diamondCut) payable {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        ds.contractOwner = uint256(uint160(_contractOwner));

        // Add initial facets during construction
        for (uint256 i = 0; i < _diamondCut.length; i++) {
            IDiamondCut.FacetCut memory cut = _diamondCut[i];
            if (cut.action == IDiamondCut.FacetCutAction.Add) {
                LibDiamond.addFacet(cut.functionSelectors, cut.facetAddress);
            }
        }
    }

    // Diamond Loupe and Diamond Cut functions are typically added as facets.
    // The fallback function is crucial for delegating calls to the facets.
    fallback() external payable {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        bytes32 position = LibDiamond.DiamondStoragePosition;
        // Get the contract owner from the shared DiamondStorage
        address contractOwner;
        assembly {
            contractOwner := shr(96, sload(add(position, 0))) // s.contractOwner is the first slot
        }

        // Default to a zero address if not set, or retrieve the actual owner
        if (contractOwner == address(0)) {
            contractOwner = address(uint160(ds.contractOwner));
        }

        address facet = ds.facetAddress[msg.sig];
        require(facet != address(0), "DiamondStone: Function does not exist");

        assembly {
            // Copy function selector and calldata into memory
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())

            // Execute the function call
            let result := delegatecall(gas(), facet, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)

            switch result
            case 0 {
                revert(ptr, size)
            }
            default {
                return(ptr, size)
            }
        }
    }

    // Receive function to accept Ether
    receive() external payable {}
}
