// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title LibDiamond
/// @author The Resonant Realms Global
/// @notice This library provides utilities for the Diamond proxy pattern (EIP-2535).
/// @dev It includes structs for facet definitions and error handling for diamond-related operations.
library LibDiamond {
    // Diamond storage is not used in this lib, but it's a common pattern
    // struct DiamondStorage {
    //     mapping(bytes4 => address) facets;
    //     bytes4[] selectors;
    //     // etc.
    // }
    // function diamondStorage() internal pure returns (DiamondStorage storage ds) {
    //     bytes32 position = keccak256("diamond.storage.diamond");
    //     assembly {
    //         ds.slot := position
    //     }
    // }

    bytes32 constant DiamondStoragePosition = keccak256("diamond.standard.diamond.storage");

    struct DiamondStorage {
        // function selector to facet address
        mapping(bytes4 => address) facetAddress;
        // facet address to selectors for that facet
        mapping(address => bytes4[]) facetFunctionSelectors;
        // facet address to function selectors
        mapping(address => bytes4[]) facetAddressAndSelectors;
        // Used to lookup facet addresses that exist in the diamond
        mapping(address => bool) facetAddresses;
        // Keeps track of the number of facets in the diamond
        bytes4[] selectors;
        uint256 contractOwner;
    }

    function diamondStorage() internal pure returns (DiamondStorage storage ds) {
        bytes32 position = DiamondStoragePosition;
        assembly {
            ds.slot := position
        }
    }

    // Add a facet along with its selectors to the diamond
    function addFacet(bytes4[] memory _functionSelectors, address _facetAddress) internal {
        DiamondStorage storage ds = diamondStorage();
        require(_functionSelectors.length > 0, "LibDiamond: No selectors in facet");
        require(_facetAddress != address(0), "LibDiamond: No facet address");
        require(ds.facetAddresses[_facetAddress] == false, "LibDiamond: Facet already exists");

        ds.facetAddresses[_facetAddress] = true;
        ds.facetAddressAndSelectors[_facetAddress] = _functionSelectors;

        for (uint256 i = 0; i < _functionSelectors.length; i++) {
            bytes4 selector = _functionSelectors[i];
            require(ds.facetAddress[selector] == address(0), "LibDiamond: Selector already exists");
            ds.facetAddress[selector] = _facetAddress;
            ds.facetFunctionSelectors[_facetAddress].push(selector);
            ds.selectors.push(selector);
        }
    }

    // Replace a facet with its selectors in the diamond
    function replaceFacet(bytes4[] memory _oldFunctionSelectors, address _oldFacetAddress, bytes4[] memory _newFunctionSelectors, address _newFacetAddress) internal {
        DiamondStorage storage ds = diamondStorage();
        require(_oldFacetAddress != address(0), "LibDiamond: No old facet address");
        require(_newFacetAddress != address(0), "LibDiamond: No new facet address");
        require(ds.facetAddresses[_oldFacetAddress] == true, "LibDiamond: Old facet does not exist");
        require(ds.facetAddresses[_newFacetAddress] == false, "LibDiamond: New facet already exists");
        require(_oldFunctionSelectors.length == _newFunctionSelectors.length, "LibDiamond: Old and new selector arrays must be same length");

        // Remove old facet and selectors
        for (uint256 i = 0; i < _oldFunctionSelectors.length; i++) {
            bytes4 selector = _oldFunctionSelectors[i];
            require(ds.facetAddress[selector] == _oldFacetAddress, "LibDiamond: Selector does not belong to old facet");
            delete ds.facetAddress[selector];
            // Remove from ds.selectors
            for (uint256 j = 0; j < ds.selectors.length; j++) {
                if (ds.selectors[j] == selector) {
                    ds.selectors[j] = ds.selectors[ds.selectors.length - 1];
                    ds.selectors.pop();
                    break;
                }
            }
        }
        delete ds.facetAddresses[_oldFacetAddress];
        delete ds.facetAddressAndSelectors[_oldFacetAddress];

        // Add new facet and selectors
        ds.facetAddresses[_newFacetAddress] = true;
        ds.facetAddressAndSelectors[_newFacetAddress] = _newFunctionSelectors;

        for (uint256 i = 0; i < _newFunctionSelectors.length; i++) {
            bytes4 selector = _newFunctionSelectors[i];
            require(ds.facetAddress[selector] == address(0), "LibDiamond: New selector already exists");
            ds.facetAddress[selector] = _newFacetAddress;
            ds.facetFunctionSelectors[_newFacetAddress].push(selector);
            ds.selectors.push(selector);
        }
    }

    // Remove a facet along with its selectors from the diamond
    function removeFacet(bytes4[] memory _functionSelectors, address _facetAddress) internal {
        DiamondStorage storage ds = diamondStorage();
        require(_functionSelectors.length > 0, "LibDiamond: No selectors in facet");
        require(_facetAddress != address(0), "LibDiamond: No facet address");
        require(ds.facetAddresses[_facetAddress] == true, "LibDiamond: Facet does not exist");

        for (uint256 i = 0; i < _functionSelectors.length; i++) {
            bytes4 selector = _functionSelectors[i];
            require(ds.facetAddress[selector] == _facetAddress, "LibDiamond: Selector does not belong to facet");
            delete ds.facetAddress[selector];
            // Remove from ds.selectors
            for (uint256 j = 0; j < ds.selectors.length; j++) {
                if (ds.selectors[j] == selector) {
                    ds.selectors[j] = ds.selectors[ds.selectors.length - 1];
                    ds.selectors.pop();
                    break;
                }
            }
        }
        delete ds.facetAddresses[_facetAddress];
        delete ds.facetAddressAndSelectors[_facetAddress];
    }

    // Replace the contract owner
    function setContractOwner(uint256 _newContractOwner) internal {
        DiamondStorage storage ds = diamondStorage();
        ds.contractOwner = _newContractOwner;
    }
}
