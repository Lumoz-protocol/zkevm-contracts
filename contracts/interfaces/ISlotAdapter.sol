// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.17;

import { IDeposit } from "./IDeposit.sol";

interface ISlotAdapter {
    function distributeRewards(address _recipient, uint64 _initNumBatch, uint64 _finalNewBatch, IDeposit _iDeposit) external;
    function calcSlotReward(uint64 _batchNum, IDeposit _iDeposit) external;
    function punish(address _recipient, IDeposit _iDeposit) external;
}
