var read = require('read')

module.exports = function (stdin, stdout, agency, callback) {
  read({
    prompt: agency
      ? (
        'Do you agree to the agency terms at ' +
        'https://licensezero.com/terms/agency? [Y/N]'
      )
      : (
        'Do you agree to the terms of service at ' +
        'https://licensezero.com/terms/service? [Y/N]'
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
