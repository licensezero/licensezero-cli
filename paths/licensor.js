var path = require('path')

module.exports = function (config) {
  return path.join(config, 'licensor.json')
}
