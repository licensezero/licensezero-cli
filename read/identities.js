var fs = require('fs')
var path = require('path')
var runParallel = require('run-parallel')
var readIdentity = require('./identity')

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
        return readIdentity.bind(null, config, entry)
      }), callback)
    }
  )
}
