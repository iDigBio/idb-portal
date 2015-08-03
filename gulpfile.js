/*
*Default task requires Chrome LiveReload plugin for livereload development.
*otherwise this can be run just for browserify bundleing.
*/
var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    source = require('vinyl-source-stream'),
    gutil = require('gulp-util'),
    watchify = require('watchify'),
    browserify = require('gulp-browserify'),
    react = require('gulp-react'),
    less = require('gulp-less'),
    uglify = require('gulp-uglify'),
    path = require('path'),
    rename = require('gulp-rename');

/*
Task: default
runs Live Reload server for doing active development. Watches files for updates and 
builds all react and less files and client files that are part of standard development cycle.
see  /public/client/js /public/client/less dirs for which files are included
*/
gulp.task('default',function(){
        //build js changes 
    function buildReact(){
      return  gulp.src("./public/client/js/react/src/**/*.js")
        .pipe(react())
        .pipe(gulp.dest('./public/client/js/react/build'))
    }
    buildReact();

    gulp.watch(['public/client/js/react/src/**']).on('change',function(){
        buildReact();
    })

    var bundle = watchify('./public/client/js/main.js');
    bundle.transform('reactify');
    bundle.on('update',rebundle)

    function rebundle(){
        return bundle.bundle()
        .on('error',function(e){
            gutil.log('Browserify Error:', e);
        })
        //.pipe(uglify())
        .pipe(source('client.js'))
        .pipe(gulp.dest('./public/js'))
    }
    //live reload of compiled files
    livereload.listen();
    gulp.watch(['app/views/*','public/js/client.js','public/css/*']).on('change',livereload.changed);
    //build less css changes
    gulp.watch('public/client/less/**').on('change', function(){
        return gulp.src('./public/client/less/**/*.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('./public/css'));
    })
    return rebundle();
});
/*
Task: libs
builds file of global libs
see  /public/client/libs file for which files are included
*/
gulp.task('libs', function(){
    gulp.src('./public/client/libs.js')
    .pipe(browserify({
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
    gulp.src('./public/client/idbmap.js')
    .pipe(browserify({
        insertGlobals: true
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'))
})
/*
Task: build
one run action when you just need to rebuild client files like react and less
see  /public/client/libs file for which files are included
*/
gulp.task('build',function(){
    gulp.src("./public/client/js/react/src/**/*.js")
    .pipe(react())
    .pipe(gulp.dest('./public/client/js/react/build'));

    gulp.src('./public/client/js/main.js')
    .pipe(browserify({
        insertGlobals: true
    }))
    .pipe(rename('client.js'))
    .pipe(gulp.dest('./public/js'));

    gulp.src('./public/client/less/**/*.less')
    .pipe(less({
        paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./public/css'));
});