import { exec as _exec, spawn as _spawn } from 'child_process';

function spawn(command) {
    command = command.replace(/\n/g, ' ');
    const child = _spawn(command, { stdio: 'inherit', shell: true });
    return new Promise((resolve, reject) => {
        child.on('error', reject);
        child.on('close', (code) => {
            code == 0 ? resolve(code) : reject(`Child process exited with code ${code}`);
        });
    });
}
const id = 1
const peoAddr = 1
const exit_mana_addr = 2 
const gen_blocknumber = 1 
const sequencer = 3  
const aggregator = 4 
const bridge_addr = "aa" 
const l2bridge_addrs = "bb,cc"
;(async() => {
    await spawn(`./depoly_zkrollup -c config.json --id ${id} --poe_addr ${peoAddr} --exit_mana_addr ${exit_mana_addr} --gen_blocknumber ${gen_blocknumber} --sequencer ${sequencer}  --aggregator ${aggregator} --bridge_addr ${bridge_addr} --l2bridge_addrs ${l2bridge_addrs}`);
})()

