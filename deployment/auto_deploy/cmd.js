/* eslint-disable no-await-in-loop, no-use-before-define, no-continue, no-lonely-if, import/no-dynamic-require, global-require */
/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved, no-restricted-syntax */
const hre = require('hardhat');
const { ethers } = require('hardhat');
const { spawn: _spawn } = require('child_process');

const fs = require('fs');
const path = require('path');
const pg = require('./utils/pg');
const { createGenesis } = require('../1_createGenesis');
const { deployDeployer } = require('../2_deployPolygonZKEVMDeployer');
const { deployContracts } = require('../3_deployContracts');

if (process.env.PG_URL === undefined || process.env.PG_URL === '') {
    throw new Error('PG_URL is empty');
}

async function main() {
    const pgClient = await pg.pgConnect(process.env.PG_URL);
    try {
        const openzeppelin = path.join(__dirname, '../../.openzeppelin');
        console.log(openzeppelin)
        await spawn(`rm -rf ${openzeppelin}`);
        const transaction_hash = process.env.transaction_hash;
        const reg_id = process.env.reg_id;
        const chain_id = process.env.chain_id;
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
        if (!fs.existsSync(regisDataDir)) {
            fs.mkdirSync(regisDataDir);
            fs.copyFileSync(
                path.join(__dirname, './deploy_parameters.json.example'),
                path.join(regisDataDir, './deploy_parameters.json'),
            );

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
            outputJson =  require(path.join(regisDataDir, './deploy_output.json'));
            sequencer = await createRandomWallet(regisDataDir, 'sequencer');
            aggregator = await createRandomWallet(regisDataDir, 'aggregator');
            const genesisFile = JSON.parse(fs.readFileSync(path.join(regisDataDir, './genesis.json')).toString());
            bridgeAddrL2 = genesisFile.genesis[3].address;
        }

        console.log(outputJson)
        const depoly_zkrollup = path.join(__dirname, 'build/depoly_zkrollup');
        const depoly_zkrollup_config = path.join(__dirname, 'build/config.json');
        const cmd = `${depoly_zkrollup} -c ${depoly_zkrollup_config} --id ${reg_id} --poe_addr ${outputJson.polygonZkEVMAddress} --exit_mana_addr ${outputJson.polygonZkEVMGlobalExitRootAddress} --gen_blocknumber ${outputJson.deploymentBlockNumber} --sequencer ${sequencer.address}  --aggregator ${aggregator.address} --bridge_addr ${outputJson.polygonZkEVMBridgeAddress} --l2bridge_addrs ${bridgeAddrL2}`;
        console.log('cmd: ', cmd)
        await spawn(cmd);
    } catch (error) {
        throw new Error(error);
    }

    pgClient.end();
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
