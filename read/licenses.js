var eea = require('./enoent-empty-array')
var fs = require('fs')
var path = require('path')
var readLicense = require('./license')
var runParallel = require('run-parallel')

module.exports = function (config, callback) {
  var directory = path.join(config, 'licenses')
  fs.readdir(
    directory,
    eea(callback, function (entries) {
      runParallel(
        entries.map(function (projectID) {
          return readLicense.bind(null, config, projectID)
        }),
        callback
      )
    })
  )
}
