var waiverPath = require('../paths/waiver')
var writeJSONFile = require('./json-file')

module.exports = function (config, nickname, waiver, callback) {
  var file = waiverPath(config, nickname, waiver.projectID)
  writeJSONFile(file, waiver, callback)
}
