var https = require('https')
var simpleConcat = require('simple-concat')

module.exports = function (payload, callback) {
  https.request({
    method: 'POST',
    host: 'licensezero.com',
    path: '/api/v0',
    headers: {'Content-Type': 'application/json'}
  })
    .once('error', callback)
    .once('response', function (response) {
      var status = response.statusCode
      if (status !== 200) {
        return callback(new Error('server responded ' + status))
      }
      simpleConcat(response, function (error, parsed) {
        if (error) {
          return callback(new Error('invalid server response'))
        }
        if (parsed.error) {
          return callback(new Error(parsed.error))
        }
        delete parsed.error
        callback(null, parsed)
      })
    })
    .end(JSON.stringify(payload))
}
