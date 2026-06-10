// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IDiamondLoupe
/// @author The Resonant Realms Global
/// @notice This interface defines the functions for the Diamond Loupe, as per EIP-2535.
/// @dev It allows for introspection of the diamond's facets and their functions.
interface IDiamondLoupe {
    // Diamond Loupe Interface
    // These functions are used to query the diamond's facets and their selectors.

    struct Facet {
        address facetAddress;
        bytes4[] functionSelectors;
    }

    /// @notice Gets all facet addresses and their selectors in the Diamond.
    /// @return facetAddresses_ An array of Facet struct, each containing a facet's address and its selectors.
    function facets() external view returns (Facet[] memory facetAddresses_);

    /// @notice Gets the facet address that a specific function selector belongs to.
    /// @param _functionSelector The function selector to check.
    /// @return facetAddress_ The address of the facet that implements the function, or zero if not found.
    function facetAddress(bytes4 _functionSelector) external view returns (address facetAddress_);

    /// @notice Gets all the function selectors for a given facet address.
    /// @param _facetAddress The address of the facet.
    /// @return functionSelectors_ An array of bytes4 function selectors implemented by the facet.
    function facetFunctionSelectors(address _facetAddress) external view returns (bytes4[] memory functionSelectors_);

    /// @notice Gets all the facet addresses that exist in the Diamond.
    /// @return facetAddresses_ An array of all unique facet addresses.
    function facetAddresses() external view returns (address[] memory facetAddresses_);
}
