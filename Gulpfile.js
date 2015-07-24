
var gulp = require('gulp')
var webpack = require('webpack')
var wpConf = require('./webpack.config.js')
var gutil = require('gulp-util')
var mocha = require('gulp-mocha')

gulp.task('default', ['webpack'])

gulp.task('test', ['webpack'], function () {
  return gulp.src('test/index.js', {read: false})
  .pipe(mocha({}))
})

gulp.task('webpack', function (callback) {
  webpack(wpConf, function (err, stats) {
    if (err) throw new gutil.PluginError('webpack', err)
    gutil.log('[webpack]', stats.toString({}))
    callback()
  })
})
