let fs = require('fs');
let https = require('https');
let pat = process.env.INPUT_TOKEN;

let text = fs.readFileSync('README.md', {encoding:'utf8'}).split('\n')[0];
text += '\n---\n'

function call(url) {
    let options = {
        'headers': {
            'Authorization': `token ${pat}`,
            'User-Agent': 'runner.js',
        },
        'host': 'api.github.com',
        'path': url,
        'method': 'GET'
    }
    return new Promise((resolve, reject) => {
        let data = ''
        let get = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                console.log(`${res}`)
                console.log(`Got an error: ${res.statusCode}`)
                process.exit(1);
            }
            res.on('data', (d) => {
                data += d;
            });
            res.on('end', function () {
                resolve(data);
            });
            res.on('error', (error) => {
                reject(error);
            })
        });
        get.end();
    });
}

call(`/repos/andymckay/test-self-hosted/actions/runners`)
.then((res) => {
    let data = JSON.parse(res);
    text += 'Runners for repository: [andymckay/test-self-hosted](https://github.com/andymckay/test-self-hosted/)\n\n'
    text += '|Runner|Online|\n'
    text += '|-|-|\n'
    for (let runner of data.runners) {
        let status = ':question:';
        if (runner.status == 'offline') {
            status = ':stop_sign:'
        }
        if (runner.status == 'online') {
            status = ':white_check_mark:'
        }
        text += `|${runner.name}|${status}|`
    }
    fs.writeFileSync('README.md', text, {encoding:'utf8'})
})