/* eslint-disable no-await-in-loop, no-use-before-define, no-continue, no-lonely-if, import/no-dynamic-require, global-require */
/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved, no-restricted-syntax */
// const hre = require('hardhat');
// const { ethers } = require('hardhat');
const { spawn: _spawn } = require('child_process');

const fs = require('fs');
const path = require('path');
const pg = require('./utils/pg');
// const { createGenesis } = require('../1_createGenesis');
// const { deployDeployer } = require('../2_deployPolygonZKEVMDeployer');
// const { deployContracts } = require('../3_deployContracts');
require('dotenv').config({ path: `${__dirname}/../../.env` });

if (process.env.PG_URL === undefined || process.env.PG_URL === '') {
    throw new Error('PG_URL is empty');
}

async function main() {
    const pgClient = await pg.pgConnect(process.env.PG_URL);
    while (true) {
        try {
            const cmd = path.join(__dirname, 'cmd.js');
            const openzeppelin = path.join(__dirname, '../../.openzeppelin');
            console.log(openzeppelin)
            await spawn(`rm -rf ${openzeppelin}`);
            // await spawn(`rm -rf /Users/marius/work/opside/zkevm-contracts/cache`);
            const regisResponse = await pgClient.query(
                'select id, reg_id, chain_id, transaction_hash, adapter, deposit '
                + 'from registration '
                + 'where status = 3 order by id',
            );

            if (regisResponse.rowCount > 0) {
                for (let i = 0; i < regisResponse.rowCount; i++) {
                    await spawn(`transaction_hash=${regisResponse.rows[i].transaction_hash} reg_id=${regisResponse.rows[i].reg_id} chain_id=${regisResponse.rows[i].chain_id} adapter=${regisResponse.rows[i].adapter} deposit=${regisResponse.rows[i].deposit} npx hardhat run ${cmd}`);
                    // TODO: update status in registration table when child process normally exits
                    await pgClient.query(
                        'update registration set status = 4 '
                        + `where id = ${regisResponse.rows[i].id} `,
                    );
                }
            }
        } catch (error) {
            throw new Error(error);
        }
        // sleep
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}

// async function createRandomWallet(regisDataDir, role) {
//     let keystoreDir;
//     switch (role) {
//     case 'sequencer':
//         keystoreDir = path.join(regisDataDir, './sequencer.keystore');
//         break;
//     case 'aggregator':
//         keystoreDir = path.join(regisDataDir, './aggregator.keystore');
//         break;
//     case 'deployer':
//         keystoreDir = path.join(regisDataDir, './deployer.keystore');
//         break;
//     default:
//         throw new Error('Invalid role');
//     }

//     let wallet;
//     if (!fs.existsSync(keystoreDir)) {
//         wallet = await ethers.Wallet.createRandom();
//         await wallet.encrypt('testonly').then((json) => {
//             fs.writeFileSync(keystoreDir, json);
//         });
//     } else {
//         const keystoreJson = fs.readFileSync(keystoreDir);
//         wallet = ethers.Wallet.fromEncryptedJsonSync(keystoreJson, 'testonly');
//     }
//     return wallet;
// }

// async function fundWallet(funder, receiver, provider) {
//     const currBalance = await receiver.connect(provider).getBalance();
//     const minBalance = ethers.utils.parseEther('1');
//     if (currBalance.lt(minBalance)) {
//         const params = {
//             to: receiver.address,
//             value: ethers.utils.parseEther('2'),
//             gasPrice: ethers.utils.parseUnits('200', 'gwei'),
//         };
//         const tx = await funder.connect(provider).sendTransaction(params);
//         await tx.wait();
//     }
// }

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
