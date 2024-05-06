import gulp from 'gulp';
import less from 'gulp-less';
import path, {dirname} from 'path';
import fse from 'fs-extra';
// import log from 'fancy-log';
// import browserify from 'browserify';
// import sourcemaps from 'gulp-sourcemaps';
// import source from 'vinyl-source-stream';
// import buffer from 'vinyl-buffer';
// import browserifyCss from 'browserify-css';
// import shim from 'browserify-shim';
// import babelify from 'babelify';
// import _ from 'lodash';
import { fileURLToPath } from 'url';
const dir = dirname(fileURLToPath(import.meta.url));


// function transformChain(b) {
//     return b
//         .transform(shim)
//         .transform(browserifyCss, {
//             stripComments: true,
//             global: true,
//             processRelativeUrl: function(relativeUrl) {
//                 const stripQueryStringAndHashFromPath = function(url) {
//                     return url.split('?')[0].split('#')[0];
//                 };
//                 const rootDir = path.resolve(process.cwd());
//                 const relativePath = stripQueryStringAndHashFromPath(relativeUrl);
//                 const queryStringAndHash = relativeUrl.substring(relativePath.length);
//                 const prefix = 'node_modules/';
//
//                 if (_.startsWith(relativePath, prefix)) {
//                     if (fse.pathExistsSync(relativePath)) {
//                         const vendorPath = 'vendor/' + relativePath.substring(prefix.length);
//                         const sourcepath = path.join(rootDir, relativePath);
//                         const target = path.join(rootDir, "public/", vendorPath);
//
//                         log.info(`Copying file from ${sourcepath} to ${target}`);
//                         fse.copySync(sourcepath, target);
//
//                         return path.join("/portal/", vendorPath + queryStringAndHash);
//                     } else {
//                         log.error(`Missing file ${relativePath}`);
//                     }
//                 }
//                 return relativeUrl;
//             }
//         })
//         .transform(babelify, {
//             presets: [
//                 ["@babel/preset-env", { "targets": { "browsers": "last 2 versions" } }],
//                 "@babel/preset-react"
//             ],
//             plugins: [
//                 ["module-resolver", { "root": ["./"], "alias": {} }],
//                 "@babel/plugin-proposal-class-properties"
//             ]
//         });
// }

// function mapper() {
//     // set up the browserify instance on a task basis
//     var b = transformChain(browserify({
//         entries: './public/client/idbmap.js',
//         debug: true,
//     }));
//
//     return b.bundle()
//         .pipe(source('idbmap.js'))
//         .pipe(buffer())
//         .pipe(sourcemaps.init({loadMaps: true}))
//         // Add transformation tasks to the pipeline here.
//         // .pipe(uglify())
//         .on('error', log.error)
//         .pipe(sourcemaps.write('./'))
//         .pipe(gulp.dest('./public/js/'));
// };

// function client() {
//     var b = transformChain(browserify({
//         entries: './public/client/js/main.js',
//         debug: true
//     }));
//
//     return b.bundle()
//         .pipe(source('client.js'))
//         .pipe(buffer())
//         .pipe(sourcemaps.init({loadMaps: true}))
//         .pipe(sourcemaps.write('./'))
//         .pipe(gulp.dest('./public/js/'));
// }

function buildLess() {
    return gulp.src('./public/client/less/**/*.less')
        .pipe(less({
            paths: [ path.join(dir, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('./public/css'));
}

function leafletExtra(done) {
    const rootDir = path.resolve(process.cwd());
    const filesource = path.join(rootDir, "node_modules/leaflet/dist/images/marker-icon-2x.png");
    const filetarget = path.join(rootDir, "public/vendor/leaflet/dist/images/marker-icon-2x.png");

    console.log('Copying file from ' + JSON.stringify(filesource) + ' to ' + JSON.stringify(filetarget));
    fse.copySync(filesource, filetarget);
    done();
}

gulp.task('buildLess', buildLess);
gulp.task('leafletExtra', leafletExtra);
// gulp.task('build-client', client)
export default gulp.series('buildLess', 'leafletExtra');
