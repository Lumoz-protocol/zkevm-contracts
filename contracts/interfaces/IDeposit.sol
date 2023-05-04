// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.17;

interface IDeposit {
    function depositOf(address account) external view returns(uint256);
}
