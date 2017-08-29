var path = require('path')

module.exports = function (config, nickname, productID) {
  return path.join(
    config, 'licensees', nickname, 'licenses', productID
  )
}
