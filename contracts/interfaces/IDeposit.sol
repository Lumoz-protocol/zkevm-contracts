// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.17;

interface IDeposit {
    function deposit() external;
    function withdraw(uint256 amount) external;
    function balanceOf(address account) external view returns(uint256);
}
