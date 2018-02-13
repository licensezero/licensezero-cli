var AJV = require('ajv')

module.exports = function (argument) {
  return new AJV().validate(
    {
      type: 'string',
      format: 'email'
    },
    argument
  )
}
