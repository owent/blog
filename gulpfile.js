// Sass configuration
var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');

gulp.task('sass', function () {
    gulp.src('*.scss')
        .pipe(sass())
        .pipe(gulp.dest(function (f) {
            return f.base;
        }))
});

// gulp.task('default', ['sass'], function () {
//     gulp.watch('*.scss', ['sass']);
// })

gulp.task('theme-sass', function () {
    gulp.src('themes/distinctionpp/source/css/*.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(gulp.dest(function (f) {
            return f.base;
        }));

    // gulp.src('themes/distinctionpp/source/css/*.scss')
    //     .pipe(sass().on('error', sass.logError))
    //     .pipe(minify())
    //     .pipe(rename({ suffix: '.min' }))
    //     .pipe(gulp.dest(function (f) {
    //         return f.base;
    //     }));
});

gulp.task('default', ['theme-sass'], function () {
    gulp.watch('themes/distinctionpp/source/css/**/*.scss', ['theme-sass']);
})