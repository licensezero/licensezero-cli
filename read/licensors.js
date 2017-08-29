var eea = require('./enoent-empty-array')
var fs = require('fs')
var path = require('path')
var readLicensor = require('./licensor')
var runParallel = require('run-parallel')

module.exports = function (config, callback) {
  fs.readdir(
    path.join(config, 'licensors'),
    eea(callback, function (entries) {
      runParallel(entries.map(function (entry) {
        return readLicensor.bind(null, config, entry)
      }), callback)
    })
  )
}
