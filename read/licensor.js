var licensorPath = require('../paths/licensor')
var readJSONFile = require('./json-file')

module.exports = function (config, licensorID, callback) {
  readJSONFile(licensorPath(config, licensorID), callback)
}
