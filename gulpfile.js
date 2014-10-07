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
    path = require('path');

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
        .pipe(source('app.js'))
        .pipe(gulp.dest('./public/js'))
    }
    //live reload of compiled files
    livereload.listen();
    gulp.watch(['app/views/*','public/js/app.js','public/css/*']).on('change',livereload.changed);

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

gulp.task('libs', function(){
    gulp.src('./public/client/libs.js')
    .pipe(browserify({
        insertGlobals: true
    }))
    .pipe(gulp.dest('./public/js'))
});
