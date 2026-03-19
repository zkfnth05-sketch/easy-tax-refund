const http = require('http');

const languages = ['ko', 'en', 'vi', 'zh', 'ne', 'km', 'th', 'id', 'my', 'uz', 'si'];

async function checkLang(lang) {
    return new Promise((resolve) => {
        const start = Date.now();
        console.log(`Checking ${lang}...`);
        const req = http.get(`http://localhost:9002/api/translations/${lang}`, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const duration = Date.now() - start;
                console.log(`[OK] ${lang} responded in ${duration}ms (Size: ${data.length})`);
                console.log(`     Content: ${data.substring(0, 100)}...`);
                resolve(true);
            });
        });
        
        req.on('error', (e) => {
            console.log(`[ERROR] ${lang}: ${e.message}`);
            resolve(false);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
            req.destroy();
            console.log(`[TIMEOUT] ${lang} failed to respond within 5s`);
            resolve(false);
        }, 5000);
    });
}

async function run() {
    for (const lang of languages) {
        await checkLang(lang);
    }
}

run();
