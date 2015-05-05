'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var srcDir = 'src', buildDir = 'lib';

module.exports = yeoman.generators.NamedBase.extend({
  writing: function() {
    this.fs.copyTpl(
      this.templatePath('_package.json'),
      this.destinationPath('package.json'),
      { name: this.name, buildDir: buildDir  }
    );
    this.fs.copyTpl(
      this.templatePath('gulpfile.js'),
      this.destinationPath('gulpfile.js'),
      { srcDir: srcDir, buildDir: buildDir }
    );
    this.fs.copyTpl(
      this.templatePath('flowconfig'),
      this.destinationPath('.flowconfig'),
      { buildDir: buildDir }
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
  },

  install: function () {
    this.installDependencies({ bower: false });
  }
});
