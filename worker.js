const { parentPort, workerData } = require("worker_threads");
const axios = require('axios');
const jsdom = require("jsdom");
const fs = require('fs');
const qs = require('querystring')
const { JSDOM } = jsdom;
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function writeSource(pageSource, email) {
    fs.writeFile('index.html', pageSource, function (err, result) {
        // fs.writeFile(process.cwd() + '\\temp\\' +email+ '.html', pageSource, function (err, result) {
        if (err) console.log('error', err);
    });
}
function buildCookie(cookie) {
    let result = '';
    for (const iterator of cookie) {
        const temp = iterator.substring(0, iterator.indexOf(';'));
        result += temp + '; '
    }
    return result;
}

async function checkAccount(email, proxy, agent) {
    let document = null;
    let flag;
    let cookie = '';
    await axios({
        method: 'get',
        url: 'https://m.facebook.com/login/identify',
        headers: {
            'Host': 'm.facebook.com',
            'User-Agent': agent
        },
        proxy
    }).then((response) => {
        document = new JSDOM(response.data).window.document;
        cookie = buildCookie(response.headers['set-cookie']);
    }).then(async () => {
        const formData = {
            lsd: document.getElementsByName('lsd')[0].value,
            jazoest: document.getElementsByName('jazoest')[0].value,
            did_submit: document.getElementsByName('did_submit')[0].value,
            email: email
        }
        await axios({
            method: 'post',
            url: 'https://m.facebook.com/login/identify/?ctx=recover&search_attempts=1&alternate_search=0',
            data: 'lsd=' + formData.lsd + '&jazoest=' + formData.jazoest + '&email=' + formData.email + '&did_submit=' + formData.did_submit,
            headers: {
                'Host': 'm.facebook.com',
                'User-Agent': agent,
                'Referer': 'https://m.facebook.com/login/identify',
                'Cookie': cookie,
            },
            proxy
        }).then(async response => {
            document = new JSDOM(response.data).window.document;
            writeSource(response.data, email); //debug
            // if (!document.getElementById('login_identify_search_error_msg') && document.getElementById('contact_point_selector_form')) {
            while (!document) { }
            flag = false;
            let error = '';
            let check2 = true;
            try {
                error = document.querySelector('div[data-sigil="marea"]').textContent;
            } catch{
                check2 = false;
                error = document.querySelector('div span').textContent;
            }
            if (check2 && !document.getElementById('login_identify_search_error_msg')) {
                // console.log(' Founded : ' + formData.email);
                flag = true;
            } else {
                console.log(formData.email + ' error :', error);
            }
        });
    }).catch(error => {
        // console.log(email + ' connect to proxy ' + proxy.host + ':' + proxy.port + ' Failed', error);
        flag = "Proxy error";
    });
    return flag;
};

async function checkMail(email, agent, proxy) {

    return await checkAccount(email, proxy, agent);
}

parentPort.on("message", async (param) => {
    const email = param.email;
    const agent = param.agent;
    let check = [];
    for (let i = 0; i < 10; i++) {
    const proxy = param.listProxy[getRndInteger(0, param.listProxy.length)];
    check.push(checkMail(email, agent, proxy));
    }
    const result = await Promise.all(check);
    if (!result.includes(true) && !result.includes(false)) {
        console.log(email + ' can\'t connect to 10 proxies');
    }
    if (result.includes(true)) {
        parentPort.postMessage({ email, success: true });
    }

});