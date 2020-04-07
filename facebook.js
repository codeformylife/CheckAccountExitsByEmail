
const axios = require('axios');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const pathPageSource = 'page.html';
const baseURL = 'https://m.facebook.com/';

let dom;

async function writeSource(pageSource) {
    await fs.writeFile(pathPageSource, pageSource, function (err, result) {
        if (err) console.log('error', err);
    });
}



async function openIdentify() {
    let data = {};
    axios.get(baseURL + 'login/identify')
        .then(async (response) => {
            console.log(response.headers);
            await writeSource(response.data);
            dom = new JSDOM(response.data);
            if (dom) {
                data['search'] = dom.window.document.getElementById('identify_search_toggle_button').search;
            }
        })
        .catch(error => {
            console.log(error);
        });
    return data;
}

async function main() {
    await openIdentify();

}


main();