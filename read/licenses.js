var eea = require('./enoent-empty-array')
var fs = require('fs')
var path = require('path')
var readLicense = require('./license')
var runParallel = require('run-parallel')

module.exports = function (config, nickname, callback) {
  var directory = path.join(config, 'licensees', nickname, 'licenses')
  fs.readdir(directory, eea(callback, function (entries) {
    runParallel(entries.map(function (productID) {
      return readLicense.bind(null, config, nickname, productID)
    }), callback)
  }))
}
