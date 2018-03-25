var read = require('read')

module.exports = function (stdin, stdout, prompt, callback) {
  read({
    prompt: prompt + ' [Y/N]',
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
