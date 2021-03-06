var gulp              = require('gulp'),
    babel             = require('gulp-babel'),
    sourcemaps        = require('gulp-sourcemaps'),
    notify            = require('gulp-notify'),
    flow              = require('gulp-flowtype'),
    sourcemapReporter = require('jshint-sourcemap-reporter');

var srcDir   = '<%= srcDir %>',
    srcGlob  = srcDir + '/**/*.js',
    buildDir = '<%= buildDir %>';

gulp.task('babel', function(cb) {
  gulp.src(srcGlob)
    .pipe(sourcemaps.init())
    .pipe(babel({ optional: ['runtime'], blacklist: ['flow'] }))
    .on('error', notify.onError('<%= error.message %>'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(buildDir))
    .on('end', cb);
});

gulp.task('flow', ['babel'], function() {
  gulp.src(buildDir + '/**/*.js')
    .pipe(flow({
      all: false,
      weak: false,
      //declarations: './declarations',
      killFlow: false,
      beep: true,
      abort: false,
      reporter: {
        reporter: function(errors) {
          return sourcemapReporter.reporter(errors, { sourceRoot: '/' + srcDir + '/' });
        }
      }
    }));
});

gulp.task('watch', function() {
  gulp.watch(srcGlob, ['babel', 'flow']);
});

gulp.task('default', ['babel', 'flow', 'watch']);
