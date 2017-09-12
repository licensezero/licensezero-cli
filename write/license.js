var licensePath = require('../paths/license')
var writeJSONFile = require('./json-file')

module.exports = function (config, nickname, license, callback) {
  var file = licensePath(config, nickname, license.projectID)
  writeJSONFile(file, license, callback)
}
