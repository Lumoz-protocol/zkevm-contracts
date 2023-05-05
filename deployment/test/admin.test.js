const path = require('path');
const { spawn: _spawn } = require('child_process');

async function main() {
    const cmd = path.join(__dirname, 'cmd.js');
    for (let i = 0; i < 5; i++) {
        await spawn(`reg_id=${i} npx hardhat run ${cmd}`);
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
