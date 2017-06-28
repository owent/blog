// Sass configuration
var gulp = require('gulp');
var sass = require('gulp-sass');

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
        .pipe(sass())
        .pipe(gulp.dest(function (f) {
            return f.base;
        }))
});

gulp.task('default', ['theme-sass'], function () {
    gulp.watch('themes/distinctionpp/source/css/**/*.scss', ['theme-sass']);
})