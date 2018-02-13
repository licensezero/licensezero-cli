var licensorPath = require('../paths/licensor')
var readJSONFile = require('../read/json-file')

module.exports = function (config, callback) {
  readJSONFile(licensorPath(config), callback)
}
