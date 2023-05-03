

const hre = require('hardhat');
const { ethers } = require('hardhat');
const { spawn: _spawn } = require('child_process');

const fs = require('fs');
const path = require('path');
const { createGenesis } = require('../1_createGenesis');

async function main() {
    for (let i = 0; i < 5; i++) {
        // const i = process.env.reg_id;
        const regisDataDir = path.join(__dirname, './admin'+i);
        let sequencer;
        let aggregator;
        if (!fs.existsSync(regisDataDir)) {
            fs.mkdirSync(regisDataDir);
            fs.copyFileSync(
                path.join(__dirname, './deploy_parameters.json.example'),
                path.join(regisDataDir, './deploy_parameters.json'),
            );
        }

        const deployer = await createRandomWallet(regisDataDir, 'deployer');
        const paramsDir = path.join(regisDataDir, './deploy_parameters.json');
        const deployParams = JSON.parse(fs.readFileSync(paramsDir).toString());
        deployParams.chainID = 1;
        deployParams.trustedSequencerURL = 'http://127.0.0.1:6060';

        deployParams.admin = deployer.address;
        deployParams.zkEVMOwner = deployer.address;
        deployParams.timelockAddress = deployer.address;
        deployParams.initialZkEVMDeployerOwner = deployer.address;
        deployParams.deployerPvtKey = deployer.privateKey;

        sequencer = await createRandomWallet(regisDataDir, 'sequencer');
        aggregator = await createRandomWallet(regisDataDir, 'aggregator');

        deployParams.trustedSequencer = sequencer.address;
        deployParams.trustedAggregator = aggregator.address;

        fs.writeFileSync(paramsDir, JSON.stringify(deployParams, null, 1));
        
        hre.changeNetwork('hardhat');

        console.log('--------------------------------------------');
        console.log('*** start createGenesis ***');
        await createGenesis(regisDataDir, deployParams);
    }
}


async function createRandomWallet(regisDataDir, role) {
    let keystoreDir;
    switch (role) {
    case 'sequencer':
        keystoreDir = path.join(regisDataDir, './sequencer.keystore');
        break;
    case 'aggregator':
        keystoreDir = path.join(regisDataDir, './aggregator.keystore');
        break;
    case 'deployer':
        keystoreDir = path.join(regisDataDir, './deployer.keystore');
        break;
    default:
        throw new Error('Invalid role');
    }

    let wallet;
    if (!fs.existsSync(keystoreDir)) {
        wallet = await ethers.Wallet.createRandom();
        await wallet.encrypt('testonly').then((json) => {
            fs.writeFileSync(keystoreDir, json);
        });
    } else {
        const keystoreJson = fs.readFileSync(keystoreDir);
        wallet = ethers.Wallet.fromEncryptedJsonSync(keystoreJson, 'testonly');
    }
    return wallet;
}

async function fundWallet(funder, receiver, provider) {
    const currBalance = await receiver.connect(provider).getBalance();
    const minBalance = ethers.utils.parseEther('1');
    if (currBalance.lt(minBalance)) {
        const params = {
            to: receiver.address,
            value: ethers.utils.parseEther('2'),
            gasPrice: ethers.utils.parseUnits('200', 'gwei'),
        };
        const tx = await funder.connect(provider).sendTransaction(params);
        await tx.wait();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
