// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../interfaces/ISlotAdapter.sol";
import "../interfaces/IDeposit.sol";

contract SlotAdapterMock is ISlotAdapter ,OwnableUpgradeable {
    address public zkEvmContract;
    error OnlyZkEvmContract();
    function initialize() external virtual initializer {

        // Initialize OZ contracts
        __Ownable_init_unchained();
    }

    modifier onlyZkEvmContract() {
        if (zkEvmContract != msg.sender) {
            revert OnlyZkEvmContract();
        }
        _;
    }

    function setZKEvmContract(address _zkEvmContract) external onlyOwner {
        zkEvmContract = _zkEvmContract;
    }

    function distributeRewards(address _recipient, uint64 _initNumBatch, uint64 _finalNewBatch, IDeposit _iDeposit) external onlyZkEvmContract {

    }
    function calcSlotRewatd(uint64 _batchNum) external onlyZkEvmContract {

    }
    function punish(address _recipient, IDeposit _iDeposit) external onlyZkEvmContract {

    }
}