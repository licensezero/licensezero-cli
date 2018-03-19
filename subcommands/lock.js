module.exports = function (options, cwd, config, stdin, stdout, stderr, done) {
  var projectID = options['<project id>']

  var readLicensor = require('../read/licensor')
  readLicensor(config, function (error, licensor) {
    /* istanbul ignore next */
    if (error) return done(error)
    var validateDate = require('../validate/date')
    if (!validateDate(options['<date>'])) return done('invalid unlock date')
    var request = require('../request')
    var unlockDateString = new Date(options['<date>'])
    request({
      action: 'lock',
      licensorID: licensor.licensorID,
      token: licensor.token,
      projectID: projectID,
      unlock: unlockDateString
    }, function (error, response) {
      if (error) return done(error)
      stdout.write(
        'Project ID ' + response.projectID +
        ' locked until ' + unlockDateString + '.'
      )
      done()
    })
  })
}
