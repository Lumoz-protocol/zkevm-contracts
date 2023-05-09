/* eslint-disable no-await-in-loop, no-use-before-define, no-continue, no-lonely-if, import/no-dynamic-require, global-require */
/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved, no-restricted-syntax, camelcase */
const hre = require('hardhat');
const { ethers } = require('hardhat');
const { spawn: _spawn } = require('child_process');

const fs = require('fs');
const path = require('path');
const pg = require('./utils/pg');
const { createGenesis } = require('../createGenesis');
const { deployDeployer } = require('../deployPolygonZKEVMDeployer');
const { deployContracts } = require('../deployContracts');

if (process.env.PG_URL === undefined || process.env.PG_URL === '') {
    throw new Error('PG_URL is empty');
}

const adapterABI = '[ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "OnlyManager", "type": "error" }, { "inputs": [], "name": "OnlyOpenRegistrar", "type": "error" }, { "inputs": [], "name": "OnlyOpsideSlots", "type": "error" }, { "inputs": [], "name": "OnlySlotAdapter", "type": "error" }, { "inputs": [], "name": "OnlyZkEvmContract", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "_slotId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "_caller", "type": "address" }, { "indexed": true, "internalType": "address", "name": "_recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "DistributeRewards", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "_manager", "type": "address" }, { "indexed": false, "internalType": "address", "name": "_opsideSlots", "type": "address" }, { "indexed": false, "internalType": "address", "name": "_globalPool", "type": "address" }, { "indexed": false, "internalType": "enum RewardDistributionType", "name": "_rewardDistribution", "type": "uint8" } ], "name": "Initialize", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint8", "name": "version", "type": "uint8" } ], "name": "Initialized", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_account", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "PunishAmount", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "_slotId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "_to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "indexed": false, "internalType": "enum RewardType", "name": "_rewardType", "type": "uint8" } ], "name": "RewardFromGlobalPool", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "_slotId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "_caller", "type": "address" }, { "indexed": true, "internalType": "address", "name": "_recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "Withdrawal", "type": "event" }, { "inputs": [ { "internalType": "uint64", "name": "_batchNum", "type": "uint64" } ], "name": "calcSlotRewatd", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_manager", "type": "address" } ], "name": "changeSlotManager", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_recipient", "type": "address" }, { "internalType": "uint64", "name": "_initNumBatch", "type": "uint64" }, { "internalType": "uint64", "name": "_finalNewBatch", "type": "uint64" }, { "internalType": "contract IDeposit", "name": "_iDeposit", "type": "address" } ], "name": "distributeRewards", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getSlotId", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "globalPool", "outputs": [ { "internalType": "contract IGlobalPool", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "globalReward", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_manager", "type": "address" }, { "internalType": "address", "name": "_opsideSlots", "type": "address" }, { "internalType": "address", "name": "_globalPool", "type": "address" }, { "internalType": "enum RewardDistributionType", "name": "_rewardDistribution", "type": "uint8" } ], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "opsideSlots", "outputs": [ { "internalType": "contract IOpsideSlots", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint64", "name": "", "type": "uint64" } ], "name": "proverReward", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_recipient", "type": "address" }, { "internalType": "contract IDeposit", "name": "_iDeposit", "type": "address" } ], "name": "punish", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "punishAmount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "rewardDistribution", "outputs": [ { "internalType": "enum RewardDistributionType", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "rewards", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "setPunishAmount", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "enum RewardDistributionType", "name": "_rewardDistribution", "type": "uint8" } ], "name": "setRewardDistribution", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_slotId", "type": "uint256" } ], "name": "setSlotId", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_zkEvmContract", "type": "address" } ], "name": "setZKEvmContract", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "slotId", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "slotManager", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "slotReward", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "start", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "status", "outputs": [ { "internalType": "enum SlotStatus", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "stop", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "zkEvmContract", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" } ]';

async function main() {
    const pgClient = await pg.pgConnect(process.env.PG_URL);
    try {
        const openzeppelin = path.join(__dirname, '../../.openzeppelin');
        console.log(openzeppelin);
        await spawn(`rm -rf ${openzeppelin}`);
        const { transaction_hash } = process.env;
        const { reg_id } = process.env;
        const { chain_id } = process.env;
        const requestRecordResp = await pgClient.query(
            'select admin_address, network_url '
            + 'from request_record '
            + `where transaction_hash = '${transaction_hash}'`,
        );
        if (!(requestRecordResp.rowCount > 0)) {
            // no record, skip
            return;
        }

        const regisDataDir = path.join(__dirname, './', `reg_id_${reg_id}`);
        let outputJson;
        let sequencer;
        let aggregator;
        let bridgeAddrL2;
        if (!fs.existsSync(path.join(regisDataDir, './deploy_output.json'))) {
            fs.mkdirSync(regisDataDir);
            fs.copyFileSync(
                path.join(__dirname, './deploy_parameters.json.example'),
                path.join(regisDataDir, './deploy_parameters.json'),
            );

            // load claimTxManager Account
            const claimTxManager = new ethers.Wallet(process.env.CLAIM_TX_MANAGER_PRIVKEY);
            await claimTxManager.encrypt('testonly').then((json) => {
                fs.writeFileSync(path.join(regisDataDir, './claimtxmanager.keystore'), json);
            });

            const deployer = await createRandomWallet(regisDataDir, 'deployer');
            const paramsDir = path.join(regisDataDir, './deploy_parameters.json');
            const deployParams = JSON.parse(fs.readFileSync(paramsDir).toString());
            deployParams.chainID = chain_id;
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
            deployParams.claimTxManager = claimTxManager.address;

            fs.writeFileSync(paramsDir, JSON.stringify(deployParams, null, 1));

            hre.changeNetwork('hardhat');
            await pgClient.query(
                'update request_record set zkrollup_contract_status = 1 '
                + `where transaction_hash = '${transaction_hash}'`,
            );
            console.log('--------------------------------------------');
            console.log('*** start createGenesis ***');
            if (!fs.existsSync(path.join(regisDataDir, './genesis.json'))) {
                await createGenesis(regisDataDir, deployParams);
            } else {
                console.log('genesis.json exist');
            }
            const genesisFile = JSON.parse(fs.readFileSync(path.join(regisDataDir, './genesis.json')).toString());
            bridgeAddrL2 = genesisFile.genesis[3].address;

            console.log('*** createGenesis done ***');
            console.log('--------------------------------------------');
            // hre.changeNetwork(process.env.HARDHAT_NETWORK);
            hre.changeNetwork('opside');
            const funder = new ethers.Wallet(process.env.FUNDER_PRIVKEY);
            console.log('*** start deploy zkEVM deployer ***');
            const currProvider = ethers.provider;
            console.log('fund deployer...');
            await fundWallet(funder, deployer, currProvider);
            console.log('deploy contracts...');
            await deployDeployer(regisDataDir, deployParams);
            console.log('*** deploy deployer done ***');
            console.log('--------------------------------------------');

            console.log('*** start deploy zkEVM contracts ***');
            outputJson = await deployContracts(regisDataDir, deployParams);
            await pgClient.query(
                'update request_record set zkrollup_contract_status = 2, '
                + `bridge_contract_address = array['${outputJson.polygonZkEVMBridgeAddress}', '${bridgeAddrL2}'] `
                + `where transaction_hash = '${transaction_hash}'`,
            );
            console.log('*** deploy contracts done ***');
            console.log('--------------------------------------------');

            console.log('*** start fund sequencer & aggregator ***');
            await fundWallet(funder, sequencer, currProvider);
            await fundWallet(funder, aggregator, currProvider);
            console.log('*** funding done ***');
            console.log('--------------------------------------------');
        } else {
            outputJson = require(path.join(regisDataDir, './deploy_output.json'));
            sequencer = await createRandomWallet(regisDataDir, 'sequencer');
            aggregator = await createRandomWallet(regisDataDir, 'aggregator');
            const genesisFile = JSON.parse(fs.readFileSync(path.join(regisDataDir, './genesis.json')).toString());
            bridgeAddrL2 = genesisFile.genesis[3].address;
        }

        console.log(outputJson);

        // set zkEVM contract addr for adapter
        const adapterContract = await ethers.getContractAt(adapterABI, process.env.adapter);
        const adapterOwner = new ethers.Wallet(process.env.ADAPTER_OWNER_PRIVKEY);
        await adapterContract.connect(adapterOwner).setZKEvmContract(outputJson.polygonZkEVMAddress);

        const depoly_zkrollup = path.join(__dirname, 'build/depoly_zkrollup');
        const depoly_zkrollup_config = path.join(__dirname, 'build/config.json');
        const cmd = `${depoly_zkrollup} -c ${depoly_zkrollup_config} --id ${reg_id} --poe_addr ${outputJson.polygonZkEVMAddress} --exit_mana_addr ${outputJson.polygonZkEVMGlobalExitRootAddress} --gen_blocknumber ${outputJson.deploymentBlockNumber} --sequencer ${sequencer.address}  --aggregator ${aggregator.address} --bridge_addr ${outputJson.polygonZkEVMBridgeAddress} --l2bridge_addrs ${bridgeAddrL2}`;
        console.log('cmd: ', cmd);
        await spawn(cmd);
    } catch (error) {
        throw new Error(error);
    }

    pgClient.end();
}

async function createRandomWallet(regisDataDir, role) {
    const keystoreDir = path.join(regisDataDir, `./${role}.keystore`);

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

function spawn(command) {
    command = command.replace(/\n/g, ' ');
    const child = _spawn(command, { stdio: 'inherit', shell: true });
    return new Promise((resolve, reject) => {
        child.on('error', reject);
        child.on('close', (code) => {
            code === 0 ? resolve(code) : reject(`Child process exited with code ${code}`);
        });
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
