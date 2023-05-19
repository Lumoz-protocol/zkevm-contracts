// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../interfaces/IDeposit.sol";

contract DepositMock is IDeposit {
    function depositOf(address _account) external pure returns(uint256) {
        return 100000 ether;
    }
}