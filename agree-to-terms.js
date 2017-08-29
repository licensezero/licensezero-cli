var read = require('read')

module.exports = function (stdin, stdout, callback) {
  read({
    prompt: (
      'Do you agree to the latest published ' +
      'terms of service? [Y/N]'
    ),
    default: 'N',
    input: stdin,
    output: stdout
  }, function (error, accepted) {
    /* istanbul ignore next */
    if (error) return callback(error)
    accepted = (
      accepted.toLowerCase() === 'yes' ||
      accepted.toLowerCase() === 'y'
    )
    callback(null, accepted)
  })
}
