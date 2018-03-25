var confirm = require('./confirm')

module.exports = function (stdin, stdout, agency, callback) {
  confirm(
    stdin,
    stdout,
    agency
      ? (
        'Do you agree to the agency terms at ' +
        'https://licensezero.com/terms/agency?'
      )
      : (
        'Do you agree to the terms of service at ' +
        'https://licensezero.com/terms/service?'
      ),
    callback
  )
}
