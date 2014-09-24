/*
*Default task requires Chrome LiveReload plugin for livereload development.
*otherwise this can be run just for browserify bundleing.
*/
var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    source = require('vinyl-source-stream'),
    gutil = require('gulp-util'),
    watchify = require('watchify'),
    react = require('gulp-react');

gulp.task('default',function(){
    var bundle = watchify('./public/js/app/main.js');
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

    livereload.listen();
    gulp.watch(['app/views/*','public/js/app.js','public/css/**']).on('change',livereload.changed);
    gulp.watch(['public/react/src/**']).on('change',function(){
        return gulp.src("./public/react/src/**/*.js")
        .pipe(react())
        .pipe(gulp.dest('./public/react/build'))
    })
    return rebundle();
});
