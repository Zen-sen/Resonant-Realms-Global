// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IDiamondCut
/// @author The Resonant Realms Global
/// @notice This interface defines the function for the Diamond Cut (EIP-2535), which allows for adding/replacing/removing facets.
/// @dev It provides a standardized way to upgrade the Diamond proxy.
interface IDiamondCut {
    // FacetCutAction enum defines the action to take:
    // - Add: Add a new facet with its selectors
    // - Replace: Replace an existing facet with a new one
    // - Remove: Remove an existing facet with its selectors
    enum FacetCutAction {Add, Replace, Remove}

    // FacetCut struct defines a single cut operation:
    // - facetAddress: The address of the facet to add/replace/remove
    // - action: The action to take (Add, Replace, Remove)
    // - functionSelectors: The function selectors associated with the facet
    struct FacetCut {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }

    /// @notice Adds/replaces/removes facets to/from the Diamond proxy.
    /// @param _diamondCut The array of FacetCut structs defining the cuts.
    /// @param _init The address of the contract or facet to execute _calldata after the cuts.
    /// @param _calldata The initialization function call data to be executed after the cuts.
    function diamondCut(FacetCut[] calldata _diamondCut, address _init, bytes calldata _calldata) external;
}
