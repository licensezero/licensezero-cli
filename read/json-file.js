var fs = require('fs')
var parseJSON = require('json-parse-errback')

module.exports = function (file, callback) {
  fs.readFile(file, function (error, buffer) {
    /* istanbul ignore if */
    if (error) return callback(error)
    parseJSON(buffer, callback)
  })
}
