var licensePath = require('../paths/license')
var readJSONFile = require('./json-file')

module.exports = function (config, projectID, callback) {
  readJSONFile(licensePath(config, projectID), callback)
}
