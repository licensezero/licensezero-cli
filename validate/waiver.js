var AJV = require('ajv')
var waiverSchema = require('../schemas/waiver')

var ajv = new AJV()
var validate = ajv.compile(waiverSchema)

// TODO validate agent signature
// TODO validate licensor signature

module.exports = function (argument) {
  return validate(argument)
}
