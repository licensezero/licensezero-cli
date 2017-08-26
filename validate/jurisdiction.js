var JURISDICTIONS = require('../schemas/jurisdictions')

module.exports = function (jurisdiction) {
  return JURISDICTIONS.indexOf(jurisdiction) !== -1
}
