// import plugin
var gulp = require('gulp'),
    sass = require('gulp-sass')
    pug = require('gulp-pug')
    uglify = require('gulp-uglify')
    imagemin = require('gulp-imagemin')
    connect = require('gulp-connect')
    livereload = require('gulp-livereload');

// file paths
const stylePath = {src: 'src/static/sass/*.sass', dest: 'docs/static/css'};
const htmlPath = {src: 'src/*.pug', dest: 'docs'};
const scriptPath = {src: 'src/static/js/*.js', dest: 'docs/static/js'};
const imagePath = {src: 'src/static/images/**', dest: 'docs/static/images'};

// default task
gulp.task('default', ['sass', 'pug', 'js', 'images', 'server', 'watch']);
gulp.task('build', ['sass', 'pug', 'js', 'images']);

// gulp-connect
gulp.task('server', function() {
  connect.server({
    root: 'docs',
    livereload: true,
    port: 4000
  });
});

// gulp-sass
gulp.task('sass', function() {
	return gulp.src(stylePath.src)
          .pipe(sass()) // compile sass into CSS
          .pipe(gulp.dest(stylePath.dest))
          .pipe(connect.reload())
});

// gulp-pug
gulp.task('pug', function() {
  return gulp.src(htmlPath.src)
    .pipe(pug({ // compile pug into HTML
      pretty: true
    }))
    .pipe(gulp.dest(htmlPath.dest))
    .pipe(connect.reload())
});

// gulp-uglify
gulp.task('js', function () {
  return gulp.src(scriptPath.src)
    .pipe(uglify())  // minify JavaScript
    .pipe(gulp.dest(scriptPath.dest))
    .pipe(connect.reload())
});

// gulp-imagemin  
gulp.task('images', function() {
  return gulp.src(imagePath.src)
    .pipe(imagemin())  // minify images
    .pipe(gulp.dest(imagePath.dest)) 
});

// watch
gulp.task('watch', function() {
  gulp.watch(htmlPath.src, ['pug']);
  gulp.watch(stylePath.src, ['sass']);
  gulp.watch(scriptPath.src, ['js']);
  gulp.watch(imagePath.src, ['images']);
});