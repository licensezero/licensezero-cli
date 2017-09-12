var AJV = require('ajv')
var licenseSchema = require('../schemas/license')

var ajv = new AJV()
var validate = ajv.compile(licenseSchema)

// TODO validate agent signature
// TODO validate licensor signature

module.exports = function (argument) {
  return validate(argument)
}
