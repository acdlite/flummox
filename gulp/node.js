'use strict';

module.exports = function() {
  var gulp = require('gulp');
  var esnext = require('gulp-esnext');

  return gulp.src('./src/**/*.js')
    .pipe(esnext())
    .pipe(gulp.dest('./dist'));
};
