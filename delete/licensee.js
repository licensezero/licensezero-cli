var licenseePath = require('../paths/licensee')
var path = require('path')
var rimraf = require('rimraf')

module.exports = function (config, nickname, callback) {
  var directory = path.dirname(licenseePath(config, nickname))
  rimraf(directory, callback)
}
