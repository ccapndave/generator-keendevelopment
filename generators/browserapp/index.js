'use strict';
var yeoman = require('yeoman-generator');

var appDir = 'app',
    srcDir = appDir + '/src',
    styleDir = appDir + '/style',
    testDir = appDir + '/test',
    buildDir = 'build',
    flowDest = 'build_flow',
    entry = 'app.js',
    useTypescript = false,
    useFlow = false;

module.exports = yeoman.generators.NamedBase.extend({
  prompting: function() {
    var done = this.async();

    this.prompt({
      type    : 'list',
      name    : 'type',
      message : 'What language would you like to code in?',
      default : 'Typescript',
      choices : [ 'ES6', 'ES6 + Flow', 'Typescript' ]
    }, function(answers) {
      switch (answers.type) {
        case 'Typescript':
          useTypescript = true;
          entry = 'app.ts';
          break;
        case 'ES6 + Flow':
          useFlow = true;
          break;
      }

      done();
    }.bind(this));
  },

  writing: function() {
    this.fs.copyTpl(
      this.templatePath('gitignore'),
      this.destinationPath('.gitignore'),
      { buildDir: buildDir }
    );
    this.fs.copyTpl(
      this.templatePath('npmignore'),
      this.destinationPath('.npmignore'),
      { buildDir: buildDir }
    );
    this.fs.copyTpl(
      this.templatePath('_package.json'),
      this.destinationPath('package.json'),
      { name: this.name, srcDir: srcDir, buildDir: buildDir }
    );
    this.fs.copyTpl(
      this.templatePath('gulpfile.js'),
      this.destinationPath('gulpfile.js'),
      {
        appDir: appDir,
        entry: entry,
        srcDir: srcDir,
        styleDir: styleDir,
        flowDest: flowDest,
        buildDir: buildDir,
        useTypescript: useTypescript,
        useFlow: useFlow
      }
    );
    this.fs.copyTpl(
      this.templatePath('server.js'),
      this.destinationPath('server.js'),
      { }
    );
    this.fs.copyTpl(
      this.templatePath('flowconfig'),
      this.destinationPath('.flowconfig'),
      { flowDest: flowDest }
    );
    this.fs.copy(
      this.templatePath('babelhook.js'),
      this.destinationPath('babelhook.js')
    );
    this.fs.copy(
      this.templatePath('editorconfig'),
      this.destinationPath('.editorconfig')
    );
    this.fs.copy(
      this.templatePath('jshintrc'),
      this.destinationPath('.jshintrc')
    );
    this.fs.copy(
      this.templatePath(appDir + '/index.html'),
      this.destinationPath(appDir + '/index.html')
    );
    this.fs.copy(
      this.templatePath(srcDir + '/gitkeep'),
      this.destinationPath(srcDir + '/.gitkeep')
    );
    this.fs.copy(
      this.templatePath(styleDir + '/gitkeep'),
      this.destinationPath(styleDir + '/.gitkeep')
    );
    this.fs.copy(
      this.templatePath(styleDir + '/app.less'),
      this.destinationPath(styleDir + '/app.less')
    );
    this.fs.copy(
      this.templatePath(testDir + '/gitkeep'),
      this.destinationPath(testDir + '/.gitkeep')
    );
    this.fs.write(srcDir + '/' + entry, '');

    if (useTypescript) {
      this.fs.copy(
        this.templatePath(testDir + '/tsconfig.json'),
        this.destinationPath(testDir + '/tsconfig.json')
      );
    }
  },

  install: function () {
    this.installDependencies({ bower: false });
  }
});
