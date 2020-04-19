const { parentPort, workerData } = require("worker_threads");
const jsdom = require("jsdom");
const fs = require('fs');
const qs = require('querystring')
const { JSDOM } = jsdom;
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function writeSource(pageSource, email) {
    // fs.writeFile('index.html', pageSource, function (err, result) {
    fs.writeFile(process.cwd() + '\\temp\\' + email + '.html', pageSource, function (err, result) {
        if (err) console.log('error', err);
    });
}
var request = require('request');

function buildCookie(cookie) {
    let result = '';
    for (const iterator of cookie) {
        const temp = iterator.substring(0, iterator.indexOf(';'));
        result += temp + '; '
    }
    return result;
}

async function checkAccount(email, proxy, agent) {
    let options = {
        followAllRedirects: true,
        'method': 'get',
        'url': 'https://m.facebook.com/login/identify',
        'headers': {
            'User-Agent': agent
        }

    };
    await request(options, function (error, response) {

        if (error) throw new Error(error);
        if (response.body) {
            writeSource(response.body, email); //debug
            setTimeout(async () => {
                let document = new JSDOM(response.body).window.document;
                const formData = {
                    lsd: document.getElementsByName('lsd')[0].value,
                    jazoest: document.getElementsByName('jazoest')[0].value,
                    did_submit: document.getElementsByName('did_submit')[0].value,
                    email: qs.stringify({ email: email })
                }
                options = {
                    followAllRedirects: true,
                    'method': 'POST',
                    'url': 'https://m.facebook.com/login/identify/?ctx=recover&search_attempts=1&alternate_search=0',
                    'headers': {
                        Host: 'm.facebook.com',
                        'Referer': ' https://m.facebook.com/login/identify',
                        'User-Agent': agent,
                        'Cookie': buildCookie(response.headers['set-cookie']),
                        'Content-Type': [' application/x-www-form-urlencoded', 'text/plain']
                    },

                    body: 'lsd=' + formData.lsd + '&jazoest=' + formData.jazoest + '&' + formData.email + '&did_submit=' + formData.did_submit,
                };
                await request(options, function (error, response) {
                    if (error) throw new Error(error);
                    writeSource(response.body, email); //debug
                    if (response.body !== '') {
                        document = new JSDOM(response.body).window.document;
                        if (!document.getElementById('login_identify_search_error_msg')) {
                            parentPort.postMessage({ email, success: true });
                        }
                    }
                });
            }, 1000);
        }
    });

}


function loopCheck(email, agent, listProxy) {
    const proxy = listProxy[getRndInteger(0, listProxy.length)];
    checkAccount(email, proxy, agent);
}

parentPort.on("message", async (param) => {
    const email = param.email;
    const agent = param.agent;
    console.log('checking mail : ' + email)
    loopCheck(email, agent, param.listProxy, 1);

});