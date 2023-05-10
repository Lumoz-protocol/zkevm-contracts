const { ethers } = require('hardhat');
const { rpcTransactionReceipt } = require('hardhat/internal/core/jsonrpc/types/output/receipt');
const deployParameters = require('./deploy_parameters.json');
async function main() {
    const bridgeAddr = '0xDa99b77Df6631d5695E86e00e62aeBE53A673f57';
    const bridgeAddrl2 = '0x335635e69658c5A20e8282211519828867A7C11b';

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



    const bridgeContract = await ethers.getContractAt('PolygonZkEVMBridge', bridgeAddr, deployer);
    // const maticAddr = '0xF86ecb132222e1b2F1656F5a6d2Eeb8d8CB97d5a';
    const defaultAddr = '0x0000000000000000000000000000000000000000';
    // const usdtAddr = '0xDEd24358C0d7C96BC419F479771D1da3443Fe52d'
    // const usdcAddr = '0x407d6E2bF44A1B70eBd51CcF0aFCFBbD5F0b6d15'
    // const weth = '0xCaf98e60f1148BB4DE3CebfB0d27021EEE54Bdff'
    // const qtum = '0x0E59C9c5caC90bAb4dA7CC2D0272e528DB490a16'
    // const wide ='0x3ee0a336e8cefc8a9ce7f008d864bdf2c22609ab'

    const tokenAddr = defaultAddr;
    //const tokenContract = await ethers.getContractAt('ERC20PermitMock', tokenAddr);
    const amount = ethers.utils.parseEther('10000');

    if (tokenAddr === defaultAddr) {
        const tx = await bridgeContract.bridgeAsset(1, '0x645D0658f02D1B00c18E15B145e64067301cC4bC', amount, tokenAddr, true, '0x', { value: amount });
        console.log(tx);
    } else {
        //await tokenContract.approve(bridgeAddr, amount);
        await bridgeContract.bridgeAsset(tokenAddr, 1, '0x645D0658f02D1B00c18E15B145e64067301cC4bC', amount, '0x');
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
