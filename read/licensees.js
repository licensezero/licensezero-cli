var eea = require('./enoent-empty-array')
var fs = require('fs')
var path = require('path')
var readLicensee = require('./licensee')
var runParallel = require('run-parallel')

module.exports = function (config, callback) {
  fs.readdir(
    path.join(config, 'licensees'),
    eea(callback, function (entries) {
      runParallel(entries.map(function (entry) {
        return readLicensee.bind(null, config, entry)
      }), callback)
    })
  )
}
