"use strict";

const { series, parallel } = require('gulp')
const gulp = require("gulp")
const autoprefixer = require("autoprefixer")
const browsersync = require("browser-sync").create()
const cp = require("child_process")
const cssnano = require("cssnano")
const del = require("del")
const eslint = require("gulp-eslint")
const plumber = require("gulp-plumber")
const postcss = require("gulp-postcss")
const rename = require("gulp-rename")
const sass = require("gulp-sass")
const webpack = require("webpack")
const webpackconfig = require("./webpack.config.js")
const webpackstream = require("webpack-stream")
const order = require("gulp-order");
//
function browserSync(done) {
  browsersync.init({
    proxy: 'localhost/landing.mpi',
    options: {
      reloadDelay: 50
    },
    port: 3000
  });
  done();
}
// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done(console.log("'Browser Reload' Listo!"));
}
function css() {
  console.log("Sass Listo!")
  return (
    gulp
    .src("./scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(gulp.dest("./assets/css/"))
    .pipe(rename({ suffix: ".min" }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest("./assets/css/"))
    .pipe(browsersync.stream())
  )

} 
//
function scriptsLint() {
  return gulp
  .src(["./js/**/*", "./gulpfile.js"])
  .pipe(plumber())
  .pipe(eslint({
    config: '.eslintrc.js'
  }))
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
}

// Transpile, concatenate and minify scripts
function scripts() {
  console.log("JavaScript Listo!")
  return (
    gulp
    .src(["./js/**/*"])
    .pipe(plumber())
    .pipe(webpackstream(webpackconfig, webpack))
    .pipe(gulp.dest("./assets/js/"))
    .pipe(browsersync.stream())
  )
}

function php() {
  console.log("PHP Listo!");
  return (
    gulp
    .src("./**/*.php")
    // .pipe(plumber())
    // .pipe(gulp.dest(""))
    .pipe(browsersync.stream())
  )
}

// Watch
function watchFiles() {
  gulp.watch("./scss/**/*", css)
  // gulp.watch("./js/**/*", series(scripts))
  gulp.watch("./js/**/*", series(scriptsLint, scripts))
  gulp.watch("./**/*.php", php)
}

//complex tasks
// const js = series(scripts)
const js = series(scriptsLint, scripts)
const build = series(css, js, php)
const watch = parallel(watchFiles, browserSync)

// export tasks
exports.css = css
exports.js = js
exports.php = php
exports.build = build
exports.watch = watch
exports.default = series(build, watch)
