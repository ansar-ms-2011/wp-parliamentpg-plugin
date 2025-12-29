const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
try {
    const files = [
        'favicon.ico',
        'index.html',
        'logo192.png',
        'logo512.png',
        'manifest.json',
        'robots.txt',
    ];
    const assetsPath = path.resolve(__dirname, "../public/assets/");
    for (const x of files) {
        fs.unlinkSync(path.resolve(assetsPath, x));
    }
    const parentFolderPath = path.resolve(__dirname, "../");
    exec(`find "${parentFolderPath}" -name ".DS_Store" -type f -delete`, (err, stdout, stderr) => {
        if (err) {
            console.log(`stderr: ${stderr}`);
            return;
        }
    });
    const publicAssetStaticJsPath = path.resolve(__dirname, "../public/assets/static/js/");
    exec(`find "${publicAssetStaticJsPath}" -name "*.js.map" -type f -delete`, (err, stdout, stderr) => {
        if (err) {
            console.log(`stderr: ${stderr}`);
            return;
        }
    });
    console.log("Post Build Scripts successully executed.");
} catch (error) {
    console.log(error);
    console.log("Error executing Post Build Scripts.");
}