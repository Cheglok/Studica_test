const {src, dest, watch, parallel} = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();

const css_style = function () {
    return src('./scss/style.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(dest('./css/'))
        .pipe(cleanCSS())
        .pipe(rename({extname: '.min.css'}))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./css/'))
        .pipe(browserSync.stream());
};

const sync = function (cb) {
    browserSync.init({
        server: {
            baseDir: './'
        },
        port: 3000
    });
    cb();
};

const browserReload = function (cb) {
    browserSync.reload();
    cb();
}

const watchFiles = function () {
    watch('./scss/**/*', css_style);
    watch('./**/*.html', browserReload);
    watch('./**/*.js', browserReload);
};

exports.default = parallel(watchFiles, sync);
exports.css_style = css_style;
