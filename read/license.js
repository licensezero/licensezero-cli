var licensePath = require('../paths/license')
var readJSONFile = require('./json-file')

module.exports = function (config, nickname, projectID, callback) {
  readJSONFile(licensePath(config, nickname, projectID), callback)
}
