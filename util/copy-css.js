const fse = require('fs-extra');
const path = require('path');
const postcss = require('postcss');
const postcssImport = require('postcss-import');
const postcssUrl = require("postcss-url")
// List of CSS files to copy
const cssFiles = [
    'node_modules/bootstrap/dist/css/bootstrap.min.css',
    'node_modules/leaflet/dist/leaflet.css',
];

const css = [
    'node_modules/@bower_components/leaflet-loading/src/Control.Loading.css',
    'node_modules/leaflet-draw/dist/leaflet.draw.css',
    'node_modules/@bower_components/leaflet.fullscreen/Control.FullScreen.css'
];


const jqcss = 'node_modules/jquery-ui/themes/base/all.css'

// Destination directory for CSS files
const outputDir = "public/css/"

// Ensure the output directory exists
fse.ensureDirSync(outputDir);

// Function to copy each CSS file to the public directory
cssFiles.forEach(file => {
    const destFile = path.join(outputDir, path.basename(file));
    fse.copy(file, destFile, err => {
        if (err) {
            console.error(`Failed to copy ${file}:`, err);
        } else {
            console.log(`Copied ${file} to ${destFile}`);
        }
    });
});

const processCss = async (file) => {
    try {
        console.log(path.dirname(file))
        const csscontent = await fse.readFile(file, 'utf8');
        const result = await postcss([
            postcssImport({
                root: path.dirname(file)
            }),
            postcssUrl({
                url: 'inline'  // Adjust URL paths to the output base
            })
        ]).process(csscontent, {from: undefined})

        fse.writeFileSync(`public/css/${path.basename(file)}`, result.css)

    }
    catch (error) {
        console.log(error)
    }
}

css.forEach(async file => {
    await processCss(file)
});



// css.forEach(async file => {
//     const csscontent = fse.readFileSync(file, 'utf8');
//     const destFile = path.join(outputDir, path.basename(file));
//     const result = await postcss([
//         postcssUrl({
//             url: 'inline'  // Adjust URL paths to the output base
//         })
//     ]).process(csscontent, {from: undefined})
//
//     fse.writeFileSync(`public/css/${path.basename(file)}`, result.css)
// });

// const processFile = async (file) => {
//     const content = fs.readFileSync(file, 'utf8');
//     const extname = path.extname(file);
//
//     if (extname === '.css' || extname === '.js') {
//         const result = await postcss([
//             postcssUrl({
//                 url: (asset) => {
//                     const relativePath = asset.url.split('?')[0].split('#')[0];
//                     const prefix = 'node_modules/';
//
//                     if (relativePath.startsWith(prefix)) {
//                         const sourcePath = path.resolve(process.cwd(), relativePath);
//                         const vendorPath = 'vendor/' + relativePath.substring(prefix.length);
//                         const targetPath = path.resolve(process.cwd(), 'public', vendorPath);
//
//                         if (fs.existsSync(sourcePath)) {
//                             fs.copyFileSync(sourcePath, targetPath);
//                             const queryStringAndHash = asset.url.substring(relativePath.length);
//                             return path.join('/portal/', vendorPath + queryStringAndHash);
//                         } else {
//                             console.error('Missing file:', relativePath);
//                         }
//                     }
//
//                     return asset.url;
//                 },
//             }),
//         ]).process(content, { from: undefined });
//
//         const outputDir = extname === '.css' ? 'public/css' : 'public/js';
//         fs.writeFileSync(`${outputDir}/${path.basename(file)}`, result.css);
//     } else {
//         console.warn(`Unsupported file type: ${extname}`);
//     }
// };
// console.log(path.dirname(jqcss))