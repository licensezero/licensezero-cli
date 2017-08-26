var AJV = require('ajv')
var manifestSchema = require('../schemas/manifest')

var ajv = new AJV()
var validate = ajv.compile(manifestSchema)

module.exports = function (argument) {
  return validate(argument)
}
