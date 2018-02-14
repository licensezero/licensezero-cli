var https = require('https')
var simpleConcat = require('simple-concat')

/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  var mocks = []
  module.exports = function (payload, callback) {
    var action = payload.action
    /* istanbul ignore else */
    if (mocks.length && mocks[0].action === action) {
      var mock = mocks.shift()
      mock.handler(payload, callback)
    } else {
      request(payload, callback)
    }
  }
  module.exports.mocks = mocks
} else {
  module.exports = request
}

/* istanbul ignore next */
function request (payload, callback) {
  https
    .request({
      method: 'POST',
      host: 'licensezero.com',
      path: '/api/v0',
      headers: { 'Content-Type': 'application/json' }
    })
    .once('error', callback)
    .once('response', function (response) {
      var status = response.statusCode
      if (status !== 200) {
        return callback(new Error('server responded ' + status))
      }
      simpleConcat(response, function (error, buffer) {
        if (error) {
          return callback(new Error('invalid server response'))
        }
        var parseJSON = require('json-parse-errback')
        parseJSON(buffer, function (error, parsed) {
          if (error) return callback(new Error('invalid server response'))
          if (parsed.error) return callback(new Error(parsed.error))
          delete parsed.error
          callback(null, parsed)
        })
      })
    })
    .end(JSON.stringify(payload))
}
