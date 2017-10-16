var JURISDICTIONS = require('licensezero-jurisdictions')

module.exports = function (jurisdiction) {
  return JURISDICTIONS.indexOf(jurisdiction) !== -1
}
