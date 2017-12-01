/*
*Default task requires Chrome LiveReload plugin for livereload development.
*otherwise this can be run just for browserify bundleing.
*/
var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    source = require('vinyl-source-stream'),
    gutil = require('gulp-util'),
    watchify = require('watchify'),
    gulpbrowserify = require('gulp-browserify'),
    browserify = require('browserify'),
    less = require('gulp-less'),
    uglify = require('gulp-uglify'),
    path = require('path'),
    rename = require('gulp-rename'),
    babel = require('gulp-babel'),
    babelify = require('babelify'),
    buffer = require('vinyl-buffer'),
    browserifyCss = require('browserify-css');

/*
Task: default
runs Live Reload server for doing active development. Watches files for updates and 
builds all react and less files and client files that are part of standard development cycle.
see  /public/client/js /public/client/less dirs for which files are included
*/
gulp.task('default',function(){

    //build js changes 

    buildReact();

    gulp.watch(['public/client/js/react/src/**']).on('change',function(){
        buildReact();
    })

    var bundle = watchify(browserify({ cache: {}, packageCache: {}, entries:['./public/client/js/main.js'], plugin: [watchify]}));
    bundle.transform(babelify.configure({presets: ["es2015", "react"]})).transform(browserifyCss, {
        global: true,
        processRelativeUrl: function(relativeUrl) {
            if (_.contains(['.jpg','.png','.gif', "ttf", "woff", "woff2", "svg"], path.extname(relativeUrl))) {
                // Embed image and font data with data URI
                var DataUri = require('datauri');
                var dUri = new DataUri(relativeUrl);
                return dUri.content;
            }
            return relativeUrl;
        }
    });
    bundle.on('update',rebundle);

    //live reload of compiled files
    livereload.listen();
    gulp.watch(['app/views/*','public/js/client.js','public/css/*']).on('change',livereload.changed);

    //build less css changes*/
    gulp.watch('public/client/less/**').on('change', function(){
        return buildLess();
    })

    function buildReact(){
      return  gulp.src("./public/client/js/react/src/**/*.js")
        .pipe(babel({presets: ["es2015", "react"]}))
        .pipe(gulp.dest('./public/client/js/react/build'));
    }
    
    function rebundle(){
        return bundle.bundle()
        .on('error',function(e){
            gutil.log('Browserify Error:', e);
        })
        .pipe(source('client.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./public/js'));
    }

    function buildLess(){
        return gulp.src('./public/client/less/**/*.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('./public/css'));        
    }

    return rebundle();

});

/*
Task: libs
builds file of global libs
see  /public/client/libs file for which files are included
*/
gulp.task('libs', function(){
     return gulp.src('./public/client/libs.js')
    .pipe(gulpbrowserify({
        insertGlobals: true
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'))
});

/*
Task: mapper
builds globablized mapper module for standalone use
see  /public/client/mapper
*/
gulp.task('mapper', function(){
    return gulp.src('./public/client/idbmap.js')
    .pipe(gulpbrowserify({
        insertGlobals: true
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'))
})

/*
Task: buildLess  [THIS IS USED FOR RELEASE BUILD PROCESSES]
build public/client/less files to public/css files
*/
gulp.task('buildLess',function(){
    return gulp.src('./public/client/less/**/*.less')
    .pipe(less({
        paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./public/css'));
});