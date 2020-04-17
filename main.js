
const { StaticPool } = require("node-worker-threads-pool");
const filePath = "./worker.js";
const UserAgent = require("./User-Agent");
const fs = require('fs');
const listProxy = [];
const pool = new StaticPool({
    size: 30,
    task: filePath,
    workerData: 'haha'
});

function loadProxy() {
    fs.readFileSync('listProxy.txt', 'utf-8').split(/\r?\n/).forEach(function (line) {
        const temp = line.split(':');
        listProxy.push({
            host: temp[0],
            port: temp[1]
        })
    })
}

function main() {
    const email = [
        'nguyenducthien1998',
        '0566662225',
        'thientongthong1@gmail.com',
        'tienanh@gmail.com'
    ]
    if (listProxy.length == 0) {
        loadProxy();
        console.log('loaded proxy');
    }
    for (const iterator of email) {
        (async () => {
            const param = {
                email: iterator,
                agent: UserAgent.getRandomUserAgentMobile(),
                listProxy
            };
            const res = await pool.exec(param);
            console.log(`result: `, res);
        })();
    }
}
main();