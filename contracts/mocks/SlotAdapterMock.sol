// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.17;

import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import { ISlotAdapter } from "../interfaces/ISlotAdapter.sol";


contract SlotAdapterMock is ISlotAdapter, OwnableUpgradeable {
    error OnlyZkEvmContract();
    event DistributeRewards(uint256 _slotId, address indexed _caller, address indexed _to, uint256 _amount, uint64 _batchNum); 

    address public zkEvmContract;

    uint256 public slotId;

    mapping(uint64 => uint256) public proverReward;

    function initialize() external initializer {
        __Ownable_init_unchained();
    }

    modifier onlyZkEvmContract() {
        if (zkEvmContract != msg.sender) {
            revert OnlyZkEvmContract();
        }
        _;
    }

    function setZkevmContract(address _zkEvmContract) external onlyOwner {
        zkEvmContract = _zkEvmContract;
    }

    function distributeRewards(address _recipient, uint64 _batchNum) external onlyZkEvmContract {
       uint256 _amount = 1;
       emit DistributeRewards(slotId, address(this), _recipient, _amount, _batchNum); 
    }

    function calcSlotRewatd(uint64 _batchNum) external onlyZkEvmContract {
        if (proverReward[_batchNum] == 0) {
            proverReward[_batchNum] = 1 ether;
        }
    }

    function punish(address _recipient) external onlyZkEvmContract {

    }
}
