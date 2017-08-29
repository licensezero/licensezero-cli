var licensorPath = require('../paths/licensor')
var mkdirp = require('mkdirp')
var path = require('path')
var runSeries = require('run-series')
var writeJSONFile = require('./json-file')

module.exports = function (config, licensor, callback) {
  var file = licensorPath(config, licensor.licensorID)
  runSeries([
    mkdirp.bind(null, path.dirname(file)),
    writeJSONFile.bind(null, file, licensor)
  ], callback)
}
