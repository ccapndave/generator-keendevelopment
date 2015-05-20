'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var appDir = 'app',
    srcDir = appDir + '/src',
    styleDir = appDir + '/style',
    testDir = appDir + '/test',
    buildDir = 'build',
    flowDest = 'build_flow',
    entry = 'app.js';

module.exports = yeoman.generators.NamedBase.extend({
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
      { appDir: appDir, entry: entry, srcDir: srcDir, styleDir: styleDir, flowDest: flowDest, buildDir: buildDir }
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
  },

  install: function () {
    this.installDependencies({ bower: false });
  }
});
