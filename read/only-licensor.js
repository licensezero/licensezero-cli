var readLicensors = require('./licensors')

module.exports = function (config, callback) {
  readLicensors(config, function (error, licensors) {
    if (error) return callback(error)
    if (licensors.length !== 1) {
      callback(new Error('more than one licensor available'))
    } else {
      callback(null, licensors[0])
    }
  })
}
