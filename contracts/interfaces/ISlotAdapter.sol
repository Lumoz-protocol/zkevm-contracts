// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.17;


interface ISlotAdapter {
    function distributeRewards(address _recipient, uint256 _amount) external;
}
