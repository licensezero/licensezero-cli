var AJV = require('ajv')
var waiverSchema = require('../schemas/waiver')

var ajv = new AJV()
var validate = ajv.compile(waiverSchema)

module.exports = function (argument) {
  return validate(argument)
}
