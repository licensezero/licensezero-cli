var fs = require('fs')
var readLicense = require('./read-license')
var path = require('path')
var runParallel = require('run-parallel')

module.exports = function (config, nickname, callback) {
  var directory = path.join(config, 'identities', nickname, 'licenses')
  fs.readdir(directory, function (error, entries) {
    if (error) {
      /* istanbul ignore else */
      if (error.code === 'ENOENT') {
        return callback(null, [])
      } else {
        return callback(error)
      }
    }
    runParallel(entries.map(function (productID) {
      return readLicense.bind(null, config, nickname, productID)
    }), callback)
  })
}
