var AJV = require('ajv')

var ajv = new AJV()
var validate = ajv.compile({
  type: 'string',
  format: 'email'
})

module.exports = function (argument) {
  return validate(argument)
}
