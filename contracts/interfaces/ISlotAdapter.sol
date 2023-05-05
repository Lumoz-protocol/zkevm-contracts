// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.17;


interface ISlotAdapter {
    function distributeRewards(address _recipient, uint64 _initNumBatch, uint64 _finalNewBatch) external;
    function calcSlotRewatd(uint64 _batchNum) external;
    function punish(address _recipient) external;
}
