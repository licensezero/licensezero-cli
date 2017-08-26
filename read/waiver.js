var waiverPath = require('../paths/waiver')
var readJSONFile = require('./json-file')

module.exports = function (config, nickname, productID, callback) {
  readJSONFile(waiverPath(config, nickname, productID), callback)
}
