var licensorPath = require('../paths/licensor')
var path = require('path')
var rimraf = require('rimraf')

module.exports = function (config, nickname, callback) {
  var directory = path.dirname(licensorPath(config, nickname))
  rimraf(directory, callback)
}
