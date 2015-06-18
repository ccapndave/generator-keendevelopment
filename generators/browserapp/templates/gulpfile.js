var gulp              = require('gulp'),
    babel             = require('gulp-babel'),
    tsify             = require('tsify'),
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
    appDir   = '<%= appDir %>',
    srcDir   = '<%= srcDir %>',
    styleDir = '<%= styleDir %>',
    entry    = '<%= entry %>',
    buildDir = '<%= buildDir %>',
    flowDest = '<%= flowDest %>',
    useTypescript = <%= useTypescript %>,
    useFlow = <%= useFlow %>;

/** The array of things to copy over directly */
var assetGlobs = [
  appDir + "/**/*",
  "!" + srcDir, "!" + srcDir + "/**/*",
  "!" + styleDir, "!" + styleDir + "/**/*"
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
  return wrapper(params).add(require.resolve("./" + srcDir + "/" + entry));
}

gulp.task('watchify', function() {
  var bundle = getBrowserifyBundler(true, true);

  if (useTypescript) {
    // Add a Typescript plugin, and use the ES6 definitions
    bundle = bundle
      .plugin('tsify', { noImplicitAny: true, module: 'commonjs', noLib: true })
      .add('node_modules/tsify/node_modules/typescript/bin/lib.es6.d.ts');
  }

  // The bundling process
  var rebundle = function() {
    var start = Date.now();
    var stream = bundle
      .bundle()
      .on("error", notify.onError("\\<%= error.message %\\>"))
      .pipe(exorcist(buildDir + '/js/index.js.map')) // for Safari
      .pipe(source("bundle.js"))
      .pipe(gulp.dest(buildDir + '/js'))
      .pipe(notify('Built in ' + (Date.now() - start) + 'ms'));

    // Trigger live reload if the client server is running
    if (server) stream.pipe(server.notify());
  };

  bundle.on('update', rebundle);

  return rebundle();
});

gulp.task('less', function() {
  var stream = gulp.src([styleDir + '/**/*.less'])
    .pipe(sourcemaps.init())
    .pipe(less())
    .on("error", notify.onError("\\<%= error.message %\\>"))
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
  gulp.src(assetGlobs)
    .pipe(gulp.dest(buildDir));
});

gulp.task('copy-assets:watch', function() {
  gulp.watch(assetGlobs, ['copy-assets']);
});

gulp.task('flow:babel', function(cb) {
  gulp.src(srcDir + '/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({ blacklist: ['flow'] }))
    .on('error', notify.onError("<\\%= error.message %\\>"))
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

var devDeps = ['watchify', 'less', 'less:watch', 'copy-assets', 'copy-assets:watch'];
if (useFlow) devDeps.concat(['flow', 'flow:watch']);
gulp.task('dev', devDeps);

gulp.task('default', ['dev'], function() {
  server = gls.new('server.js');
  server.start();
});
