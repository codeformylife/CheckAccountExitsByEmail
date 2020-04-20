
const { StaticPool } = require("node-worker-threads-pool");
const worker = "./worker.js";
const worker2 = "./worker2.js";
const UserAgent = require("./User-Agent");
const fs = require('fs');
const listProxy = [];
const pool = new StaticPool({
    size: 30,
    task: worker,
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
        'lam.phantungww.7',
        '100008834020356',
        'thientongthong1@gmail.com',
        'vu.tienanh.1209',
        'mocchouslao',
        'asala@live.de',
        'lorenzo05@live.ca',
        'rene21@live.de',
        'nakar@live.de',
        'gina70@live.de',
        'eleonora93@live.de',
        'anny62@live.de',
        'sandy26@live.de',
        'cristian09@live.de',
        'hoangphuc@live.de',
        'james45@live.de',
        'marinko99@live.de',
        'mavis19@live.de',
        'ebru82@live.de',
        'amina31@live.de',
        'khane@live.de',
        'lucaslopez@live.de',
        'peric@live.de',
        'alyssa87@live.de',
        'noah23@hotmail.fr',
        'noah23@hotmail.fr',
        'cookjack@hotmail.fr',
        'cookjack@hotmail.fr',
        'tonymatthews@hotmail.fr',
        'tonymatthews@hotmail.fr',
        'mario79@hotmail.fr'
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