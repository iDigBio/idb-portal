/*
*Default task requires Chrome LiveReload plugin for livereload development.
*otherwise this can be run just for browserify bundleing.
*/
var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    source = require('vinyl-source-stream'),
    gutil = require('gulp-util'),
    watchify = require('watchify'),
    react = require('gulp-react'),
    less = require('gulp-less'),
    path = require('path');

gulp.task('default',function(){
    var bundle = watchify('./client/js/main.js');
    bundle.transform('reactify');
    bundle.on('update',rebundle)

    function rebundle(){
        return bundle.bundle()
        .on('error',function(e){
            gutil.log('Browserify Error:', e);
        })
        .pipe(source('app.js'))
        .pipe(gulp.dest('./public/js'))
    }
    //live reload of compiled files
    livereload.listen();
    gulp.watch(['app/views/*','public/js/app.js','public/css/**']).on('change',livereload.changed);
    //build js changes 
    gulp.watch(['client/js/react/src/**']).on('change',function(){
        return gulp.src("./client/js/react/src/**/*.js")
        .pipe(react())
        .pipe(gulp.dest('./client/js/react/build'))
    })
    //build less css changes
    gulp.watch('client/less/**').on('change', function(){
        return gulp.src('./client/less/**/*.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('./public/css'));
    })
    return rebundle();
});
