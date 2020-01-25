var gulp = require('gulp');
    clean = require('gulp-clean'); //Очисщает директори
    pug = require('gulp-pug'); //Переводит pug в html
    gulpPugBeautify = require('gulp-pug-beautify'); //Причесывает Pug
    replace = require('gulp-replace');
    debug = require('gulp-debug'); //Показывает пути дебаженых фалов
    watch = require('gulp-watch'); //Отслеживает изменения в директории
    sass = require('gulp-sass'); //Переводит sass в css
    notify = require('gulp-notify'); //Уведомляет об ошибках в коде
    autoprefixer = require('gulp-autoprefixer'); //Ставит автопрефиксы
    rename = require('gulp-rename'); //Переименовывает файл
    plumber = require('gulp-plumber');
    sourcemaps = require('gulp-sourcemaps');
    concat = require('gulp-concat');
    mincss = require('gulp-clean-css');
    browsersync = require('browser-sync').create(); //Забускает сервер
    csscomb = require('gulp-csscomb');

//Сервер
gulp.task('serve', function () {
        return new Promise((res, rej) => {
            browsersync.init({
                server: './dist/',
                // tunnel: true,
                // port: 9000
            });
            res();
        });
    });

//Clean    
gulp.task('clean', function () {
    return gulp.src('dist/*', {read: false})
        .pipe(clean());
});

//dist/index.html
gulp.task('pug', function buildHTML() {
  return gulp.src('app/*.pug') //Обрабатываем файлы в этой директории
    .pipe(pug({pretty: true}))
    .pipe(gulpPugBeautify({ omit_empty: true }))
    .pipe(replace('../dist/'))
    .pipe(gulp.dest('./dist/'))
    .pipe(debug({'title': 'html'}))
    .on('end', browsersync.reload)
});

//dist/main.css
gulp.task('sass', function(){
    return gulp.src(['./app/*.{css,sass,scss}']) 
        .pipe( sass().on( 'error', notify.onError( 
            {
                message: '<%= error.message %>',
                title  : 'Кэп! Твой код пошел по пизде!'
            } )))
        .pipe(sass())
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(concat('main.css')) 
        .pipe(gulp.dest('./dist/assets/css'))
        .pipe(mincss({compatibility: 'ie8', level: {1: {specialComments: 0}}})) 
        .pipe(concat('main.css')) 
        .pipe(replace('../../dist/', '../'))
        .pipe(plumber.stop())
        .pipe(sourcemaps.write('./maps/'))		
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/assets/css'))
        .on('end', browsersync.reload);
});

//webfonts
gulp.task('webfonts', function(){
    return gulp.src(['./app/*.ttf'])
        .pipe(gulp.dest('./dist/assets/webfonts'))
        .on('end', browsersync.reload);
});

//Js
gulp.task('js', function(){
    return gulp.src(['./app/*.js'])
        .pipe(gulp.dest('./dist/assets/js'))
        .on('end', browsersync.reload);
});

//images
gulp.task('img', function(){
    return gulp.src(['./app/*.{png,jpg,jepg}'])
        .pipe(gulp.dest('./dist/images'))
        .on('end', browsersync.reload);
});

//watch
gulp.task('watch', function() {
    return new Promise((res, rej) => {
        watch(['./app/**/*.pug','./src/index.pug'], gulp.series('pug'));
        watch('./app/**/*.{sass,css}', gulp.series('sass'));
        watch('.app/**/*.js', gulp.series('js'));
        watch('./app/**/*.ttf', gulp.series('webfonts'));
        watch('.app/**/*.{png,jpg,jepg}', gulp.series('img'));
        res();
    });
});

gulp.task('default', 
    gulp.series('clean',
    gulp.parallel('pug', 'sass', 'js', 'webfonts', 'img'),
    gulp.parallel('watch'),
));