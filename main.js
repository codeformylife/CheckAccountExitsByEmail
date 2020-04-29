const { StaticPool } = require("node-worker-threads-pool");
const fs = require('fs');
const filePath = "./worker.js";

const pool = new StaticPool({
    size: 20,
    task: filePath,
    workerData: "workerData!",
});

async function loadProxy() {
    if (await fs.existsSync('proxy.txt')) {
        listProxy = [];
        const data = await fs.readFileSync('proxy.txt', 'UTF-8');
        const lines = data.split(/\r?\n/);
        lines.forEach((line) => {
            const temp = line.split(':');
            listProxy.push({ host: temp[0], port: temp[1] });
        });
    }

}

let listProxy = [];
let indexResult = 0;
let proxyIndex = 0;
async function main() {
    if (fs.existsSync('proxyok.txt')) {
        fs.unlink('proxyok.txt', function (err) {
            if (err) throw err;
            console.log('File deleted!');
        });
    }
    await loadProxy();
    for (let i = 0; i < 20; i++) {
        (async () => {
            await pool.exec({ listProxy, proxyIndex });
        })();
        proxyIndex += 5;
    }
}
main();