const { parentPort, workerData } = require("worker_threads");
const axios = require('axios');
const jsdom = require("jsdom");
const fs = require('fs');
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
async function postData(document, email, agent, proxy) {
    const formData = {
        lsd: document.getElementsByName('lsd')[0].value,
        jazoest: document.getElementsByName('jazoest')[0].value,
        did_submit: document.getElementsByName('did_submit')[0].value,
        email: email
    }
    return await axios({
        method: 'post',
        url: 'https://m.facebook.com/login/identify/?ctx=recover&search_attempts=1&alternate_search=0',
        data: 'lsd=' + formData.lsd + '&jazoest=' + formData.jazoest + '&email=' + formData.email + '&did_submit=' + formData.did_submit,
        headers: {
            'Host': 'm.facebook.com',
            'User-Agent': agent,
            'Referer': 'https://m.facebook.com/login/identify'
        },
        proxy
    }).then(response => {
        document = new JSDOM(response.data).window.document;
        writeSource(response.data, email); //debug
        // if (!document.getElementById('login_identify_search_error_msg') && document.getElementById('contact_point_selector_form')) {

        if (document.getElementById('contact_point_selector_form')) {
            console.log(' Founded : ' + formData.email);
            return true;
        }
        console.log(formData.email + ' does not exits!');
        return false;
    });
}
async function checkAccount(email, proxy, agent) {
    let document = null;

    return await axios({
        method: 'get',
        url: 'https://m.facebook.com/login/identify',
        headers: {
            'Host': 'm.facebook.com',
            'User-Agent': agent
        },
        proxy
    }).then((response) => {
        document = new JSDOM(response.data).window.document;
    }).then(async () => {
        return await postData(document, email, agent, proxy);
    }).catch(error => {
        console.log(email + ' connect to proxy ' + proxy.host + ':' + proxy.port + ' Failed');
        return false;
    });
};

function checkMail(email, agent, listProxy) {
    const proxy = listProxy[getRndInteger(0, listProxy.length)];
    checkAccount(email, proxy, agent).then((res) => {
        if (res) {
            console.log('->>>>>>>>>>>>>>>>>>>>>>res :' + email, res);
            parentPort.postMessage({ email, success: true });
        }
    })
}

parentPort.on("message", async (param) => {
    const email = param.email;
    const agent = param.agent;
    console.log('checking mail : ' + email)
    checkMail(email, agent, param.listProxy, 1);
    checkMail(email, agent, param.listProxy, 1);
    checkMail(email, agent, param.listProxy, 1);
    checkMail(email, agent, param.listProxy, 1);
});