
const axios = require('axios');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const pathPageSource = 'page.html';

let document;

function writeSource(pageSource) {
    fs.writeFile(pathPageSource, pageSource, function (err, result) {
        if (err) console.log('error', err);
    });
}



async function checkEmailFacebook(email) {
    console.time('Perfomance for ' + email);
    let flag = false;
    axios.get('https://m.facebook.com/login/identify')
        .then((response) => {
            document = new JSDOM(response.data).window.document;
        })
        .then(async () => {
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
                    'Content-Type': 'application/x-www-form-urlencoded',
                    referer: 'https://m.facebook.com/login/identify'
                },
            }).then(response => {
                document = new JSDOM(response.data).window.document;
                // writeSource(response.data); //debug
                if (!document.getElementById('login_identify_search_error_msg')) {
                    console.log('Founded : ' + formData.email);
                    console.timeEnd('Perfomance for ' + email);
                    console.log('\n');
                    return true;
                }
                console.log(formData.email + ' does not exits!');
                console.timeEnd('Perfomance for ' + email);
                console.log('\n');

            });
        })
        .catch(error => {
            console.log('Something error!');
        });

    return flag;
}

function main() {
    checkEmailFacebook('pamela99@live.it');
    checkEmailFacebook('jacqueline32@outlook.com');
    checkEmailFacebook('jacqueline32@live.it');
    checkEmailFacebook('jacqueline32@gmail.com');
    checkEmailFacebook('jacqueline32@yahoo.com');
}

main();