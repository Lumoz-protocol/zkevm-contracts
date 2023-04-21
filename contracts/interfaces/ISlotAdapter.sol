// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.17;


interface ISlotAdapter {
    function distributeRewards(address _recipient, uint64 _batchNum, uint8 _unclue) external;
}
