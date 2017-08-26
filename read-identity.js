var identityPath = require('./paths/identity')
var readJSONFile = require('./read-json-file')

module.exports = function (config, nickname, callback) {
  readJSONFile(identityPath(config, nickname), callback)
}
