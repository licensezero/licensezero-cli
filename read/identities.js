var fs = require('fs')
var identitiesPath = require('../paths/identities')
var parseJSON = require('json-parse-errback')

module.exports = function (config, callback) {
  fs.readFile(identitiesPath(config), function (error, buffer) {
    if (error) {
      if (error.code === 'ENOENT') return callback(null, [])
      else return callback(error)
    }
    parseJSON(buffer, callback)
  })
}
