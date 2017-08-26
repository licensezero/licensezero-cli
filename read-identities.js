var fs = require('fs')
var identityPath = require('./paths/identity')
var path = require('path')
var readJSONFile = require('./read-json-file')
var runParallel = require('run-parallel')

module.exports = function (config, callback) {
  fs.readdir(
    path.join(config, 'identities'),
    function (error, entries) {
      if (error) {
        /* istanbul ignore else */
        if (error.code === 'ENOENT') {
          return callback(null, [])
        } else {
          return callback(error)
        }
      }
      runParallel(entries.map(function (entry) {
        return readJSONFile.bind(null, identityPath(config, entry))
      }), callback)
    }
  )
}
