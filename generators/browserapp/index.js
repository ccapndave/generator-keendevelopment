'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var srcDir = 'src', styleDir = 'style', buildDir = 'build', entry = 'app.js';

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
      { name: this.name, srcDir: srcDir, styleDir: styleDir, buildDir: buildDir  }
    );
    this.fs.copyTpl(
      this.templatePath('gulpfile.js'),
      this.destinationPath('gulpfile.js'),
      { srcDir: srcDir, buildDir: buildDir, entry: entry }
    );
    this.fs.copyTpl(
      this.templatePath('flowconfig'),
      this.destinationPath('.flowconfig'),
      { buildDir: buildDir }
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
      this.templatePath('src/index.js'),
      this.destinationPath('src/index.js')
    );
    this.fs.copy(
      this.templatePath('test/gitkeep'),
      this.destinationPath('test/.gitkeep')
    );
  },

  install: function () {
    this.installDependencies({ bower: false });
  }
});
