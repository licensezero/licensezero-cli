var identityPath = require('../paths/identity')
var path = require('path')
var rimraf = require('rimraf')

module.exports = function (config, nickname, callback) {
  var directory = path.dirname(identityPath(config, nickname))
  rimraf(directory, callback)
}
