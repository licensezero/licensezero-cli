var ecb = require('ecb')
var fs = require('fs')
var parseJSON = require('json-parse-errback')

module.exports = function (file, callback) {
  fs.readFile(file, ecb(callback, function (buffer) {
    parseJSON(buffer, callback)
  }))
}
