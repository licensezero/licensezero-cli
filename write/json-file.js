var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var runSeries = require('run-series')

module.exports = function (file, data, callback) {
  runSeries([
    mkdirp.bind(null, path.dirname(file)),
    fs.writeFile.bind(null, file, JSON.stringify(data))
  ], callback)
}
