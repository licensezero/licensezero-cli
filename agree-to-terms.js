var confirm = require('./confirm')

module.exports = function (stdin, stdout, agency, callback) {
  confirm(
    stdin,
    stdout,
    agency
      ? (
        'Do you agree to the agency terms at ' +
        'https://licensezero.com/terms/agency? [Y/N]'
      )
      : (
        'Do you agree to the terms of service at ' +
        'https://licensezero.com/terms/service? [Y/N]'
      ),
    callback
  )
}
