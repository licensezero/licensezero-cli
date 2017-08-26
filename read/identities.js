var eea = require('./enoent-empty-array')
var fs = require('fs')
var path = require('path')
var readIdentity = require('./identity')
var runParallel = require('run-parallel')

module.exports = function (config, callback) {
  fs.readdir(
    path.join(config, 'identities'),
    eea(callback, function (entries) {
      runParallel(entries.map(function (entry) {
        return readIdentity.bind(null, config, entry)
      }), callback)
    })
  )
}
