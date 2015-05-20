var gulp              = require('gulp'),
    babel             = require('gulp-babel'),
    sourcemaps        = require('gulp-sourcemaps'),
    notify            = require('gulp-notify'),
    flow              = require('gulp-flowtype'),
    sourcemapReporter = require('jshint-sourcemap-reporter'),
    source            = require('vinyl-source-stream'),
    browserify        = require('browserify'),
    exorcist          = require('exorcist'),
    watchify          = require('watchify'),
    less              = require('gulp-less'),
    postcss           = require('gulp-postcss'),
    autoprefixer      = require('autoprefixer-core'),
    concatCss         = require('gulp-concat-css'),
    gls               = require('gulp-live-server'),
    watch             = require('gulp-watch'),
    _                 = require('lodash');

var server,
    srcDir   = '<%= srcDir %>',
    srcGlob  = srcDir + '/**/*.js',
    styleDir = '<%= styleDir %>',
    entry = '<%= entry %>',
    buildDir = '<%= buildDir %>';

/** The array of things to copy over directly */
var clientAssetGlobs = [
    clientDir + "/**/*",
    "!" + srcDir,
    "!" + srcDir + "/**/*",
    "!" + styleDir,
    "!" + styleDir + "/**/*"
];

function timeTask(stream, taskFn) {
  var start = Date.now();
  taskFn(stream)
    .pipe(notify('Built in ' + (Date.now() - start) + 'ms'));
}

function getBrowserifyBundler(useSourceMaps, useWatchify) {
  var params = useWatchify ? _.assign({ debug: useSourceMaps }, watchify.args) : { debug: useSourceMaps };
  var wrapper = useWatchify ? _.compose(watchify, browserify) : browserify;
  params = _.assign(params, { });
  return wrapper(params).require(require.resolve(srcDir + "/" + entry), { entry: true });
}

gulp.task('watchify', function() {
  var bundle = getBrowserifyBundler(true, true);

  // The bundling process
  var rebundle = function() {
    var start = Date.now();
    var stream = bundle
      .bundle()
      .on("error", notify.onError(function(error) {
        return error.message;
      }))
      .pipe(exorcist(clientDest + '/js/index.js.map')) // for Safari
      .pipe(source("bundle.js"))
      .pipe(gulp.dest(buildDir + '/js'))
      .pipe(notify('Built in ' + (Date.now() - start) + 'ms'));

    // Trigger live reload if the client server is running
    if (clientServer) stream.pipe(clientServer.notify());
  };

  bundle.on('update', rebundle);

  return rebundle();
});

gulp.task('less', function() {
  var stream = gulp.src([styleDir + '/**/*.less'])
    .pipe(sourcemaps.init())
    .pipe(less())
    .on("error", notify.onError(function(error) {
      return error.message;
    }))
    .pipe(postcss([ autoprefixer({ map: true, browsers: ['last 2 version'] }) ]))
    .pipe(concatCss("bundle.css"))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(buildDir + "/css"));

  // Trigger live reload if the client server is running
  if (server) stream.pipe(server.notify());

  return stream;
});

gulp.task('less:watch', function() {
  gulp.watch([styleDir + '/**/*.less'], ['less']);
});

gulp.task('copy-assets', function() {
  // Copy everything apart from the src and style folders into the client build folder
  gulp.src(clientAssetGlobs)
    .pipe(gulp.dest(buildDir));
});

gulp.task('copy-assets:watch', function() {
  gulp.watch(clientAssetGlobs, ['copy-assets']);
});

gulp.task('flow:babel', function(cb) {
  gulp.src(srcDir + '/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({ optional: ['runtime'], blacklist: ['flow'] }))
    .on('error', notify.onError(function(error) {
      return error.message;
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(flowDest))
    .on('end', cb);
});

gulp.task('flow', ['flow:babel'], function() {
  gulp.src(flowDest + '/**/*.js')
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

gulp.task('flow:watch', function() {
  gulp.watch(srcDir + "/**/*.js", ['flow']);
});

gulp.task('dev', ['watchify', 'less', 'less:watch', 'copy-assets', 'copy-assets:watch', 'flow', 'flow:watch']);

gulp.task('default', ['dev'], function() {
  server = gls.static(buildDir);
  server.start();
});
