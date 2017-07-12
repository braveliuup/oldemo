var gulp = require('gulp')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var htmlminify = require('gulp-html-minify')

gulp.task('build', function () {
    gulp.src(['./js/common.js','./js/log.js','./js/config.js','./js/mapHelper.js','./js/popup.js',
            './js/mark.js','./js/measure.js','./js/featureClick.js', './js/api_v1.js'
            ])
            .pipe(concat('main.js'))
            .pipe(uglify({
                mangle: {toplevel: true,
                    reserved: ['api', 'map']}
            }))
            .pipe(gulp.dest('./dist'))
})

gulp.task('html', function () {
    gulp.src('index.html').pipe(htmlminify()).pipe(gulp.dest('./dist'))
})