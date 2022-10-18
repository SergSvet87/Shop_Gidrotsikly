// Подключение модулей
const gulp = require('gulp');
const gulpLess = require('gulp-less');
const gulpPug = require('gulp-pug');
const gulpStylus = require('gulp-stylus');
const cssnano = require('gulp-cssnano');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');
const newer = require('gulp-newer');
const ts = require('gulp-typescript');
const coffee = require('gulp-coffee');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const browserSync = require('browser-sync').create();
const del = require('del');

// Пути к файлам проекта
const paths = {
  pug: {
    src: 'src/*.pug',
    dest: 'dist/'
  },
  html: {
    src: 'src/*.html',
    dest: 'dist/'
  },
  fonts: {
    src: ['src/fonts/*.ttf', 'src/fonts/*.woff', 'src/fonts/*.woff2'],
    dest: 'dist/fonts/'
  },
  styles: {
    src: 'src/styles/main.sass',
    dest: 'dist/css/'
  },
  scripts: {
    src: ['src/scripts/**/*.ts', 'src/scripts/**/*.coffee', 'src/scripts/**/*.js'],
    dest: 'dist/js/'
  },
  images: {
    src: 'src/img/**',
    dest: 'dist/img/'
  }
}

// Очистка каталогов и файлов
function clean() {
  return del(['dist/*', '!dist/img'])
}

// Обработка pug
function pug() {
  return gulp.src(paths.pug.src)
    .pipe(gulpPug())
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(browserSync.stream())
};

// Обработка html
function html() {
  return gulp.src(paths.html.src)
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream())
};

// Обработка шрифтов
function fonts() {
  return gulp.src(paths.fonts.src)
    .pipe(ttf2woff())
    .pipe(ttf2woff2())
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(browserSync.stream())
};

// Обработка стилей
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    // .pipe(gulpLess())
    // .pipe(gulpStylus())
    .pipe(sass().on('error', sass.logError))
    .pipe(cssnano())
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(rename({
      basename: 'main',
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream())
}

// Обработка скриптов
function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
    /* .pipe(coffee({
       bare: true
     }))
     .pipe(ts({
       noImplicitAny: true,
       outFile: 'main.min.js'
    })) */
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream())
}

// Обработка изображений
function images() {
  return gulp.src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(imagemin({
      progressive: true,
      optimizationLevel: 3
    }))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.images.dest))
}

// Слежение за изменениями в файлах
function watch() {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    }
  });
  gulp.watch(paths.html.dest).on('change', browserSync.reload)
  gulp.watch(paths.html.src, html)
  gulp.watch(paths.fonts.src, fonts)
  gulp.watch(paths.styles.src, styles)
  gulp.watch(paths.scripts.src, scripts)
  gulp.watch(paths.images.src, images)
}

// Последовательное и паралельное выполнение  задач
const build = gulp.series(clean, html, gulp.parallel(fonts, styles, scripts, images), watch)

exports.clean = clean;
exports.pug = pug;
exports.html = html;
exports.fonts = fonts;
exports.images = images;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.build = build;
exports.default = build;