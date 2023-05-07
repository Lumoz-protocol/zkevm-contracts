/* eslint-disable no-await-in-loop, no-use-before-define, no-lonely-if, import/no-dynamic-require, global-require */
/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved, no-restricted-syntax */
const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const deployParameters = require('./deploy_parameters.json');


async function main() {
    const IDEDepositAddress = "0xf56E5Cb4C27a321482E988D61976F63F48803D03";
    const polygonZkEVMAddress = "0x1846189713eD9C710c78a1D1F6a1A50EC39fecce";
    const adapter = '0xF0365f1ae8929eA8bBd5C558179A4aD5686061B4';

    // Load provider
    let currentProvider = new ethers.providers.FallbackProvider([ethers.provider], 1);
    if (deployParameters.multiplierGas || deployParameters.maxFeePerGas) {
        if (process.env.HARDHAT_NETWORK !== 'hardhat') {
            if (deployParameters.maxPriorityFeePerGas && deployParameters.maxFeePerGas) {
                console.log(`Hardcoded gas used: MaxPriority${deployParameters.maxPriorityFeePerGas} gwei, MaxFee${deployParameters.maxFeePerGas} gwei`);
                const FEE_DATA = {
                    maxFeePerGas: ethers.utils.parseUnits(deployParameters.maxFeePerGas, 'gwei'),
                    maxPriorityFeePerGas: ethers.utils.parseUnits(deployParameters.maxPriorityFeePerGas, 'gwei'),
                };
                currentProvider.getFeeData = async () => FEE_DATA;
            } else {
                console.log('Multiplier gas used: ', deployParameters.multiplierGas);
                async function overrideFeeData() {
                    const feedata = await ethers.provider.getFeeData();
                    return {
                        maxFeePerGas: feedata.maxFeePerGas.mul(deployParameters.multiplierGas).div(1000),
                        maxPriorityFeePerGas: feedata.maxPriorityFeePerGas.mul(deployParameters.multiplierGas).div(1000),
                    };
                }
                currentProvider.getFeeData = overrideFeeData;
            }
        }
    }

    // Load deployer
    let deployer;
    if (deployParameters.deployerPvtKey) {
        deployer = new ethers.Wallet(deployParameters.deployerPvtKey, currentProvider);
        console.log('Using pvtKey deployer with address: ', deployer.address);
    } else if (process.env.MNEMONIC) {
        deployer = ethers.Wallet.fromMnemonic(process.env.MNEMONIC, 'm/44\'/60\'/0\'/0/0').connect(currentProvider);
        console.log('Using MNEMONIC deployer with address: ', deployer.address);
    } else {
        [deployer] = (await ethers.getSigners());
    }

    const PolygonZkEVMFactory = await ethers.getContractFactory('PolygonZkEVM', deployer);

    polygonZkEVMContract = PolygonZkEVMFactory.attach(polygonZkEVMAddress);

    console.log('#######################\n');
    console.log('polygonZkEVMContract already deployed on: ', polygonZkEVMAddress);

    // Import OZ manifest the deployed contracts, its enough to import just the proyx, the rest are imported automatically ( admin/impl)
    // await upgrades.forceImport(polygonZkEVMAddress, PolygonZkEVMFactory, 'transparent');


    // await polygonZkEVMContract.connect(deployer).setSlotAdapter(adapter);
    // await polygonZkEVMContract.connect(deployer).setDeposit(IDEDepositAddress);
    await polygonZkEVMContract.connect(deployer).setTrustedSequencer("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
    await polygonZkEVMContract.connect(deployer).setTrustedAggregator("0x70997970c51812dc3a010c7d01b50e0d17dc79c8");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

