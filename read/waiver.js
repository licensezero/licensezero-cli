var waiverPath = require('../paths/waiver')
var readJSONFile = require('./json-file')

module.exports = function (config, nickname, projectID, callback) {
  readJSONFile(waiverPath(config, nickname, projectID), callback)
}
