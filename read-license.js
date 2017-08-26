var licensePath = require('./paths/license')
var readJSONFile = require('./read-json-file')

module.exports = function (config, nickname, productID, callback) {
  readJSONFile(licensePath(config, nickname, productID), callback)
}
