var licensorPath = require('../paths/licensor')
var path = require('path')
var rimraf = require('rimraf')

module.exports = function (config, licensorID, callback) {
  var directory = path.dirname(licensorPath(config, licensorID))
  rimraf(directory, callback)
}
