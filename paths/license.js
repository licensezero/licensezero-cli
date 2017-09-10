var path = require('path')

module.exports = function (config, nickname, projectID) {
  return path.join(
    config, 'licensees', nickname, 'licenses', projectID
  )
}
