var licenseePath = require('../paths/licensee')
var mkdirp = require('mkdirp')
var path = require('path')
var runSeries = require('run-series')
var writeJSONFile = require('./json-file')

module.exports = function (config, licensee, callback) {
  var file = licenseePath(config, licensee.nickname)
  runSeries([
    mkdirp.bind(null, path.dirname(file)),
    writeJSONFile.bind(null, file, licensee)
  ], callback)
}
