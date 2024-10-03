var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var log = require('fancy-log');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var babelify = require('babelify');
var browserifyCss = require('browserify-css');
var shim = require('browserify-shim');
var _ = require("lodash");
var path = require("path");
var fse = require('fs-extra');
var less = require('gulp-less');

function transformChain(b) {
    return b
        .transform(shim)
        .transform(
            browserifyCss,
            {
                stripComments: true,
                global: true,
                processRelativeUrl: function(relativeUrl) {
                    var stripQueryStringAndHashFromPath = function(url) {
                        return url.split('?')[0].split('#')[0];
                    };
                    var rootDir = path.resolve(process.cwd());
                    var relativePath = stripQueryStringAndHashFromPath(relativeUrl);
                    var queryStringAndHash = relativeUrl.substring(relativePath.length);

                    //
                    // Copying files from '../node_modules/bootstrap/' to 'public/vendor/bootstrap/'
                    //
                    var prefix = 'node_modules/';
                    if(_.startsWith(relativePath, prefix)) {
                        if(fse.pathExistsSync(relativePath)) {
                            var vendorPath = 'vendor/' + relativePath.substring(prefix.length);
                            var sourcepath = path.join(rootDir, relativePath);
                            var target = path.join(rootDir, "public/", vendorPath);

                            log.info('Copying file from ' + JSON.stringify(sourcepath) + ' to ' + JSON.stringify(target));
                            fse.copySync(sourcepath, target);

                            // Returns a new path string with original query string and hash fragments
                            return path.join("/portal/", vendorPath + queryStringAndHash);
                        } else {
                            log.error("Missing file" + JSON.stringify(relativePath));
                        }
                    }
                    return relativeUrl;
                }
            }
        )
        .transform(babelify, {
                "presets": [
                    ["@babel/preset-env", {
                        "targets": {
                            "browsers": "last 2 versions"
                        }
                    }],
                    "@babel/preset-react"
                ],
                "plugins": [
                    [
                        "module-resolver",
                        {
                            "root": [
                                "./"
                            ],
                            "alias": {}
                        }
                    ],
                    "transform-promise-to-bluebird",
                    "@babel/plugin-proposal-class-properties"
                ]
            }
        );
}

gulp.task('build', function() {
    return gulp.src('./public/client/js/react/src/**/*.js')
        // Don't use browserify for the backend files
        .pipe(babel({"presets": ["@babel/env", "@babel/preset-react"]}))
        // transform streaming contents into buffer contents (because gulp-sourcemaps does not support streaming contents)
        .pipe(buffer())
        // load and init sourcemaps
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        // write sourcemaps
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./public/client/js/react/build'));

});

gulp.task('libs', function() {
    // set up the browserify instance on a task basis
    var b = transformChain(browserify({
        entries: './public/client/libs.js',
        debug: true,
    }));

    return b.bundle()
        .pipe(source('libs.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', log.error)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('mapper', function() {
    // set up the browserify instance on a task basis
    var b = transformChain(browserify({
        entries: './public/client/idbmap.js',
        debug: true,
    }));

    return b.bundle()
        .pipe(source('idbmap.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', log.error)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('client', function() {
    // set up the browserify instance on a task basis
    var b = transformChain(browserify({
        entries: './public/client/js/main.js',
        debug: true
    }));

    return b.bundle()
        .pipe(source('client.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', log.error)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('buildLess', function() {
    return gulp.src('./public/client/less/**/*.less')
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('leaflet-extra', function() {
    // this leaflet resource is handled through js only so our browserifyCss methods do not recognize it.
    var rootDir = path.resolve(process.cwd());
    var filesource = path.join(rootDir, "/node_modules/leaflet/dist/images/marker-icon-2x.png");
    var filetarget = path.join(rootDir, "/public/vendor/leaflet/dist/images/marker-icon-2x.png");
    log.info('Copying file from ' + JSON.stringify(filesource) + ' to ' + JSON.stringify(filetarget));
    fse.copySync(filesource, filetarget);

});

gulp.task('default', ["buildLess", "client", "mapper", "libs", "leaflet-extra"]);
