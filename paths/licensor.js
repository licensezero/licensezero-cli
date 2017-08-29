var path = require('path')

module.exports = function (config, licensorID) {
  return path.join(config, 'licensors', licensorID, 'licensor.json')
}
