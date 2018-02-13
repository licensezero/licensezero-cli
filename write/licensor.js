var licensorPath = require('../paths/licensor')
var writeJSONFile = require('./json-file')

module.exports = function (config, licensor, callback) {
  writeJSONFile(licensorPath(config), licensor, callback)
}
