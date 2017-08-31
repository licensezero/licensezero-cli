var fs = require('fs')
var parseJSON = require('json-parse-errback')

module.exports = function (file, callback) {
  fs.readFile(file, function (error, buffer) {
    if (error) return callback(error)
    parseJSON(buffer, callback)
  })
}
