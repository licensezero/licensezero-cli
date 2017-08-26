var licensePath = require('./paths/license')
var writeJSONFile = require('./write-json-file')

module.exports = function (config, nickname, license, callback) {
  var file = licensePath(config, nickname, license.productID)
  writeJSONFile(file, JSON.stringify(license), callback)
}
