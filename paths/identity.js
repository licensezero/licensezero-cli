var path = require('path')

module.exports = function (config, nickname) {
  return path.join(config, 'identities', nickname, 'identity.json')
}
