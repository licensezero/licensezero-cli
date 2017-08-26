var TIERS = require('../schemas/tiers')

module.exports = function (string) {
  return TIERS.indexOf(string) === -1
    ? ['invalid license tier']
    : []
}
