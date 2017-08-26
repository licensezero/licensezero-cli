var AJV = require('ajv')
var licenseSchema = require('../schemas/license')

var ajv = new AJV()
var validate = ajv.compile(licenseSchema)

module.exports = function (argument) {
  return validate(argument)
    ? []
    : ['invalid license']
}
