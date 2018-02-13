var readIdentities = require('./identities')

module.exports = function (config, callback) {
  readIdentities(config, function (error, identities) {
    if (error) return callback(error)
    var identity = identities[0]
    if (!identity) {
      var e = new Error('Create an identity with `licensezero identify`.')
      return callback(e)
    }
    callback(null, identity)
  })
}
