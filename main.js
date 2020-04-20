
const Worker = require("./worker");
const fs = require('fs');
const listProxy = [];


function loadProxy() {
    fs.readFileSync('listProxy.txt', 'utf-8').split(/\r?\n/).forEach(function (line) {
        const temp = line.split(':');
        listProxy.push({
            host: temp[0],
            port: temp[1]
        })
    })
    console.log('loaded proxy');

}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function main() {
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
    loadProxy();
        for (const iterator of email) {
            const proxy = listProxy[getRndInteger(0, listProxy.length)];
            const res = await Worker.checkAccount(iterator, proxy);
            console.log(`result: `, res);
        }

}
main();