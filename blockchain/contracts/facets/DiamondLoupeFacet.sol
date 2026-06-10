// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IDiamondLoupe} from "../libraries/IDiamondLoupe.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";

/// @title DiamondLoupeFacet
/// @author The Resonant Realms Global
/// @notice This facet provides functions for inspecting the Diamond proxy, as per EIP-2535.
/// @dev It allows clients to discover which facets are installed and what functions they provide.
contract DiamondLoupeFacet is IDiamondLoupe {
    function facets() external view override returns (Facet[] memory facetAddresses_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        uint256 numFacets = 0;
        uint256 numSelectors = ds.selectors.length;

        address[] memory uniqueFacets = new address[](numSelectors);
        for (uint256 i = 0; i < numSelectors; i++) {
            address fa = ds.facetAddress[ds.selectors[i]];
            bool found = false;
            for (uint256 j = 0; j < numFacets; j++) {
                if (uniqueFacets[j] == fa) { found = true; break; }
            }
            if (!found) {
                uniqueFacets[numFacets++] = fa;
            }
        }

        facetAddresses_ = new Facet[](numFacets);
        for (uint256 i = 0; i < numFacets; i++) {
            facetAddresses_[i].facetAddress = uniqueFacets[i];
            facetAddresses_[i].functionSelectors = ds.facetFunctionSelectors[uniqueFacets[i]];
        }
    }

    function facetAddress(bytes4 _functionSelector) external view override returns (address facetAddress_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        facetAddress_ = ds.facetAddress[_functionSelector];
    }

    function facetFunctionSelectors(address _facetAddress) external view override returns (bytes4[] memory functionSelectors_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        functionSelectors_ = ds.facetFunctionSelectors[_facetAddress];
    }

    function facetAddresses() external view override returns (address[] memory facetAddresses_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        uint256 count = 0;
        for (uint256 i = 0; i < ds.selectors.length; i++) {
            address fa = ds.facetAddress[ds.selectors[i]];
            bool found = false;
            for (uint256 j = 0; j < i; j++) {
                if (ds.facetAddress[ds.selectors[j]] == fa) { found = true; break; }
            }
            if (!found) count++;
        }

        facetAddresses_ = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < ds.selectors.length; i++) {
            address fa = ds.facetAddress[ds.selectors[i]];
            bool found = false;
            for (uint256 j = 0; j < idx; j++) {
                if (facetAddresses_[j] == fa) { found = true; break; }
            }
            if (!found) {
                facetAddresses_[idx++] = fa;
            }
        }
    }
}
