/* eslint-disable no-await-in-loop, no-use-before-define, no-lonely-if, import/no-dynamic-require, global-require */
/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved, no-restricted-syntax */
const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const deployParameters = require('./deploy_parameters.json');


async function main() {
    const polygonZkEVMAddress = "0xCC3BD9Bd9A9B5d559Dd6FAAa4fc68D485FA26a88";

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
    const polygonZkEVMContract = PolygonZkEVMFactory.attach(polygonZkEVMAddress);

    const ret = await polygonZkEVMContract.trustedSequencer();
    console.log(await polygonZkEVMContract.slotAdapter());
    console.log(await polygonZkEVMContract.ideDeposit());
    const keystoreDir = path.join(__dirname, `./aggregator.keystore`);
    const keystoreJson = fs.readFileSync(keystoreDir);
    const wallet = ethers.Wallet.fromEncryptedJsonSync(keystoreJson, 'testonly');

    if (wallet.address == ret) {
        console.log(wallet.privateKey)
    }
    
    for ( let a in polygonZkEVMContract.interface.errors ){
        console.log(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(a)), a)
    }
/*
    function implementation() external ifAdmin returns (address implementation_) {
        implementation_ = _implementation();
    }
*/

    // console.log(await polygonZkEVMContract.submitProofHash(100,1,'0x63030e424ac6a662040f9365616fed34b6179acd37c44d48c05c6c1e657f7817'));

//    const selector = ethers.utils.hexDataSlice(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`submitProofHash(uint64, uint64, bytes32)`)), 0, 4);

    // console.log(polygonZkEVMContract.interface.encodeFunctionData('submitProofHash'))
    const l2txData = '0x123456';
    // const maticAmount = await polygonZkEVMContract.batchFee();
    const currentTimestamp = (await currentProvider.getBlock()).timestamp;

    const sequence = {
        transactions: l2txData,
        globalExitRoot: ethers.constants.HashZero,
        timestamp: ethers.BigNumber.from(currentTimestamp),
        minForcedTimestamp: 0,
    };

    deployer = new ethers.Wallet(wallet.privateKey, currentProvider);
    
    // const r = await polygonZkEVMContract.batchNumToStateRoot(0);
    // console.log(await polygonZkEVMContract.getLastVerifiedBatch())
    // console.log(await polygonZkEVMContract.getInputSnarkBytes(0,1,'0x0000000000000000000000000000000000000000000000000000000000000000', r, '0x2bc4dd5389ad50a3f16c6f09426c6d8e74ae29f027688b45ea6d9d2b6ae69c2a'))
    
    // console.log(await polygonZkEVMContract.connect(deployer).verifyBatchesTrustedAggregator(0,0,1,'0x0000000000000000000000000000000000000000000000000000000000000000', '0x2bc4dd5389ad50a3f16c6f09426c6d8e74ae29f027688b45ea6d9d2b6ae69c2a', '0x20227cbcef731b6cbdc0edd5850c63dc7fbc27fb58d12cd4d08298799cf66a0512c230867d3375a1f4669e7267dad2c31ebcddbaccea6abd67798ceae35ae7611c665b6069339e6812d015e239594aa71c4e217288e374448c358f6459e057c91ad2ef514570b5dea21508e214430daadabdd23433820000fe98b1c6fa81d5c512b86fbf87bd7102775f8ef1da7e8014dc7aab225503237c7927c032e589e9a01a0eab9fda82ffe834c2a4977f36cc9bcb1f2327bdac5fb48ffbeb9656efcdf70d2656c328903e9fb96e4e3f470c447b3053cc68d68cf0ad317fe10aa7f254222e47ea07f3c1c3aacb74e5926a67262f261c1ed3120576ab877b49a81fb8aac51431858662af6b1a8138a44e9d0812d032340369459ccc98b109347cc874c7202dceecc3dbb09d7f9e5658f1ca3a92d22be1fa28f9945205d853e2c866d9b649301ac9857b07b92e4865283d3d5e2b711ea5f85cb2da71965382ece050508d3d008bbe4df5458f70bd3e1bfcc50b34222b43cd28cbe39a3bab6e464664a742161df99c607638e415ced49d0cd719518539ed5f561f81d07fe40d3ce85508e0332465313e60ad9ae271d580022ffca4fbe4d72d38d18e7a6e20d020a1d1e5a8f411291ab95521386fa538ddfe6a391d4a3669cc64c40f07895f031550b32f7d73205a69c214a8ef3cdf996c495e3fd24c00873f30ea6b2bfabfd38de1c3da357d1fefe203573fdad22f675cb5cfabbec0a041b1b31274f70193da8e90cfc4d6dc054c7cd26d09c1dadd064ec52b6ddcfa0cb144d65d9e131c0c88f8004f90d363034d839aa7760167b5302c36d2c2f6714b41782070b10c51c178bd923182d28502f36e19b079b190008c46d19c399331fd60b6b6bde898bd1dd0a71ee7ec7ff7124cc3d374846614389e7b5975b77c4059bc42b810673dbb6f8b951e5b636bdf24afd2a3cbe96ce8600e8a79731b4a56c697596e0bff7b73f413bdbc75069b002b00d713fae8d6450428246f1b794d56717050fdb77bbe094ac2ee6af54a153e2fb8ce1d31a86c4fdd523783b910bedf7db58a46ba6ce48ac3ca194f3cf2275e'));
    // deployer.estimateGas
    // const tx = await polygonZkEVMContract.connect(deployer).sequenceBatches([sequence], "0x1fDC47E4b017d990C1e0dD64e353745Cbf8c2C62", { gasLimit: 500000  });
    // console.log(await deployer.estimateGas({
    //     from: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    //     to: "0x6bE5e34dbb4e11fb1adc104A38d2d96764faa147",
    //     value: 0,
    //     gasLimit: 5000000,
    //     gasPrice: ethers.utils.parseUnits(deployParameters.maxFeePerGas, 'gwei'),
    //     data: "0x5e9145c90000000000000000000000000000000000000000000000000000000000000040000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000760000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000064571d41000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080afb33f980173157f8170a33c3de57a49a9f8a7f9cb20d98175f0306e6800e0bd00000000000000000000000000000000000000000000000000000000645747e3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005acf90568088083021cb694526f339dddab8242f22e39be75dc2b0f2f6416a680b905442cffd02e0000000000000000000000000000000000000000000000000000000000000000ad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5b4c11951957c6f8f642c4af61cd6b24640fec6dc7fc607ee8206a99e92410d3021ddb9a356815c3fac1026b6dec5df3124afbadb485c9ba5a3e3398a04b7ba85e58769b32a1beaf1ea27375a44095a0d1fb664ce2dd358e7fcbfb78c26a193440eb01ebfc9ed27500cd4dfc979272d1f0913cc9f66540d7e8005811109e1cf2d887c22bd8750d34016ac3c66b5ff102dacdd73f6b014e710b51e8022af9a1968ffd70157e48063fc33c97a050f7f640233bf646cc98d9524c6b92bcf3ab56f839867cc5f7f196b93bae1e27e6320742445d290f2263827498b54fec539f756afcefad4e508c098b9a7e1d8feb19955fb02ba9675585078710969d3440f5054e0f9dc3e7fe016e050eff260334f18a5d4fe391d82092319f5964f2e2eb7c1c3a5f8b13a49e282f609c317a833fb8d976d11517c571d1221a265d25af778ecf8923490c6ceeb450aecdc82e28293031d10c7d73bf85e57bf041a97360aa2c5d99cc1df82d9c4b87413eae2ef048f94b4d3554cea73d92b0f7af96e0271c691e2bb5c67add7c6caf302256adedf7ab114da0acfe870d449a3a489f781d659e8beccda7bce9f4e8618b6bd2f4132ce798cdc7a60e7e1460a7299e3c6342a579626d22733e50f526ec2fa19a22b31e8ed50f23cd1fdf94c9154ed3a7609a2f1ff981fe1d3b5c807b281e4683cc6d6315cf95b9ade8641defcb32372f1c126e398ef7a5a2dce0a8a7f68bb74560f8f71837c2c2ebbcbf7fffb42ae1896f13f7c7479a0b46a28b6f55540f89444f63de0378e3d121be09e06cc9ded1c20e65876d36aa0c65e9645644786b620e2dd2ad648ddfcbf4a7e5b1a3a4ecfe7f64667a3f0b7e2f4418588ed35a2458cffeb39b93d26f18d2ab13bdce6aee58e7b99359ec2dfd95a9c16dc00d6ef18b7933a6f8dc65ccb55667138776f7dea101070dc8796e3774df84f40ae0c8229d0d6069e5c8f39a7c299677a09d367fc7b05e3bc380ee652cdc72595f74c7b1043d0e1ffbab734648c838dfb0527d971b602bc216c9619ef0abf5ac974a1ed57f4050aa510dd9c74f508277b39d7973bb2dfccc5eeb0618db8cd74046ff337f0a7bf2c8e03e10f642c1886798d71806ab1e888d9e5ee87d0838c5655cb21c6cb83313b5a631175dff4963772cce9108188b34ac87c81c41e662ee4dd2dd7b2bc707961b1e646c4047669dcb6584f0d8d770daf5d7e7deb2e388ab20e2573d171a88108e79d820e98f26c0b84aa8b2f4aa4968dbb818ea32293237c50ba75ee485f4c22adf2f741400bdf8d6a9cc7df7ecae576221665d7358448818bb4ae4562849e949e17ac16e0be16688e156b5cf15e098c627c0056a90000000000000000000000000000000000000000000000000000000000000000de44ed85698d7904d27ae80469c905e43778c5346a61c8ccfc5f2d1d0ebfc7280000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000df45563d6e2cd4ae90881664736bc5a9029fffa60000000000000000000000000000000000000000000000056bc75e2d63100000000000000000000000000000000000000000000000000000000000000000052000000000000000000000000000000000000000000000000000000000000000008203e980809ff94752a693d55aa3a9c128613d7777b36a532950da088f9c3a80c3c7aafcb32fe2b722654e3850e64c2f5c356c8011595a0a7429645ddad332984d38212d2a1c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080afb33f980173157f8170a33c3de57a49a9f8a7f9cb20d98175f0306e6800e0bd0000000000000000000000000000000000000000000000000000000064574b7500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000071ef80853a35294400825208941fdc47e4b017d990c1e0dd64e353745cbf8c2c628904563918244f400000808203e98080b775a8f109ebe030bdf4273daee2b9139a36d8f4caf7d33acf8048ff2f50b2db2711856d6b4129d6423c73848adf1775e7925c975a0901cb21918ea8fd581c011b000000000000000000000000000000"
    // }));
    // console.log(deployer.address)
    // console.log(await deployer.sendTransaction({
    //     from: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    //     to: "0xCC3BD9Bd9A9B5d559Dd6FAAa4fc68D485FA26a88",
    //     value: 0,
    //     gasLimit: 5000000,
    //     gasPrice: ethers.utils.parseUnits(deployParameters.maxFeePerGas, 'gwei'),
    //     data: "0xa50a164b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000002bc4dd5389ad50a3f16c6f09426c6d8e74ae29f027688b45ea6d9d2b6ae69c2a00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000030020227cbcef731b6cbdc0edd5850c63dc7fbc27fb58d12cd4d08298799cf66a0512c230867d3375a1f4669e7267dad2c31ebcddbaccea6abd67798ceae35ae7611c665b6069339e6812d015e239594aa71c4e217288e374448c358f6459e057c91ad2ef514570b5dea21508e214430daadabdd23433820000fe98b1c6fa81d5c512b86fbf87bd7102775f8ef1da7e8014dc7aab225503237c7927c032e589e9a01a0eab9fda82ffe834c2a4977f36cc9bcb1f2327bdac5fb48ffbeb9656efcdf70d2656c328903e9fb96e4e3f470c447b3053cc68d68cf0ad317fe10aa7f254222e47ea07f3c1c3aacb74e5926a67262f261c1ed3120576ab877b49a81fb8aac51431858662af6b1a8138a44e9d0812d032340369459ccc98b109347cc874c7202dceecc3dbb09d7f9e5658f1ca3a92d22be1fa28f9945205d853e2c866d9b649301ac9857b07b92e4865283d3d5e2b711ea5f85cb2da71965382ece050508d3d008bbe4df5458f70bd3e1bfcc50b34222b43cd28cbe39a3bab6e464664a742161df99c607638e415ced49d0cd719518539ed5f561f81d07fe40d3ce85508e0332465313e60ad9ae271d580022ffca4fbe4d72d38d18e7a6e20d020a1d1e5a8f411291ab95521386fa538ddfe6a391d4a3669cc64c40f07895f031550b32f7d73205a69c214a8ef3cdf996c495e3fd24c00873f30ea6b2bfabfd38de1c3da357d1fefe203573fdad22f675cb5cfabbec0a041b1b31274f70193da8e90cfc4d6dc054c7cd26d09c1dadd064ec52b6ddcfa0cb144d65d9e131c0c88f8004f90d363034d839aa7760167b5302c36d2c2f6714b41782070b10c51c178bd923182d28502f36e19b079b190008c46d19c399331fd60b6b6bde898bd1dd0a71ee7ec7ff7124cc3d374846614389e7b5975b77c4059bc42b810673dbb6f8b951e5b636bdf24afd2a3cbe96ce8600e8a79731b4a56c697596e0bff7b73f413bdbc75069b002b00d713fae8d6450428246f1b794d56717050fdb77bbe094ac2ee6af54a153e2fb8ce1d31a86c4fdd523783b910bedf7db58a46ba6ce48ac3ca194f3cf2275e"
    // }));
    // console.log(await currentProvider.getTransactionReceipt('0x0c1ee6b326b369006e80dbbaed20adbf94a4efdd499a9aef9fe8b3e945a820ae'));
    // console.log(await currentProvider.getLogs('0x86959719b823a7033a839e86a7319544e5a2c665e2a8d14faad898aac12fefc8'));
    // const ret1  = await currentProvider.getTransactionReceipt('0x702b705540ab764dae908ea9cc10a3063a0faa53bc0a58c533dd41182ad1632f');

    // console.log(ret1.logs[0].topics)
}   

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

