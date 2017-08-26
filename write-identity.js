var identityPath = require('./paths/identity')
var mkdirp = require('mkdirp')
var path = require('path')
var runSeries = require('run-series')
var writeJSONFile = require('./write-json-file')

module.exports = function (config, identity, callback) {
  var file = identityPath(config, identity.nickname)
  runSeries([
    mkdirp.bind(null, path.dirname(file)),
    writeJSONFile.bind(null, file, identity)
  ], callback)
}
