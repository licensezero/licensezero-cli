var licenseePath = require('../paths/licensee')
var readJSONFile = require('./json-file')

module.exports = function (config, nickname, callback) {
  readJSONFile(licenseePath(config, nickname), callback)
}
