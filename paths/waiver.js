var path = require('path')

module.exports = function (config, projectID) {
  return path.join(config, 'waivers', projectID)
}
