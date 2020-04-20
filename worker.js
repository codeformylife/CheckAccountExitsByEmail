const jsdom = require("jsdom");
const fs = require('fs');
const UserAgent = require("./User-Agent");
const { JSDOM } = jsdom;
var request = require('request-promise');

function writeSource(pageSource, email) {
    if (!email) {
        fs.writeFile('index.html', pageSource, function (err, result) {
            if (err) console.log('error', err);
        });
    } else {
        fs.writeFile(process.cwd() + '\\temp\\' + email + '.html', pageSource, function (err, result) {
            if (err) console.log('error', err);
        });
    }
}

function buildCookie(cookie) {
    let result = '';
    for (const iterator of cookie) {
        const temp = iterator.substring(0, iterator.indexOf(';'));
        result += temp + '; '
    }
    return result;
}


async function getLoginPage(userAgent, proxy) {
    let result = {};
    const option = {
        method: 'GET',
        url: 'https://m.facebook.com/login',
        timeout: 2000,
        headers: {
            'Host': 'm.facebook.com',
            'User-Agent': userAgent
        },
        resolveWithFullResponse: true
        // proxy
    }
    await request(option)
        .then((response) => {
            // writeSource(response.body);
            const document = new JSDOM(response.body).window.document;
            const actionForm = document.getElementById('login_form').action;
            const paramList = document.querySelectorAll('#login_form > input[type="hidden"]');
            if (paramList && paramList.length !== 0) {
                result['formData'] = {};
                for (const iterator of paramList) {
                    if (!iterator.id) {
                        result['formData'][iterator.name] = iterator.value;
                    }
                }
                let login = document.querySelector('#login_form button[type="submit"]');
                if (login) {
                    result['formData'][login.name] = login.value;
                }
            }
            result['url'] = 'https://m.facebook.com' + actionForm;
            if (response.headers['set-cookie']) {
                result['cookie'] = buildCookie(response.headers['set-cookie']);
            }
        });

    return result;
}
async function postLogin(resultGetLoginPage, userAgent, email, proxy) {
    let result = { success: false, code: '000000' };
    const option = {
        method: 'POST',
        url: resultGetLoginPage.url,
        headers: {
            'Host': 'm.facebook.com',
            'User-Agent': userAgent,
            Connection: 'keep-alive',
            Referer: 'https://m.facebook.com/login'
        },
        resolveWithFullResponse: true,
        formData: resultGetLoginPage.formData
        // proxy
    };
    option.formData['email'] = email;
    option.formData['pass'] = email;
    if (resultGetLoginPage.cookie) {
        option.headers['Cookie'] = resultGetLoginPage.cookie;
    }
    await request(option)
        .catch(function (error) {
            const resLocation = error.response.headers.location;
            let start = resLocation.indexOf('&e=') + 3;
            let end = resLocation.indexOf('&', start);
            let code = resLocation.slice(start, end);
            if (code == '1348092') {
                result = { success: true, code: code };
            } else {
                result = { success: false, code: code };
            }
        })
    return result;
}
const checkAccount = async (email, proxy) => {
    const userAgent = UserAgent.getRandomUserAgentMobile();
    const resultGetLoginPage = await getLoginPage(userAgent);
    if (resultGetLoginPage.url) {
        const resulrPostLogin = await postLogin(resultGetLoginPage, userAgent, email);
        return { email, info: resulrPostLogin };
    }
}

exports.checkAccount = checkAccount;
