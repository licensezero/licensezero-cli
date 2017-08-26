var eea = require('./enoent-empty-array')
var fs = require('fs')
var path = require('path')
var readWaiver = require('./waiver')
var runParallel = require('run-parallel')

module.exports = function (config, nickname, callback) {
  var directory = path.join(config, 'identities', nickname, 'waivers')
  fs.readdir(directory, eea(callback, function (entries) {
    runParallel(entries.map(function (productID) {
      return readWaiver.bind(null, config, nickname, productID)
    }), callback)
  }))
}
