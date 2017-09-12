/* eslint-disable max-len */
var USAGE = [
  'Retract your offer of paid licenses through licensezero.com.',
  '',
  'Usage:',
  '  l0-retract [-l UUID]',
  '  l0-retract -h | --help',
  '  l0-retract -v | --version',
  '',
  'Options:',
  '  -h, --help                    Print this screen to standard output.',
  '  -v, --version                 Print version to standard output.',
  '  -l UUID, --licensor UUID      Licensor offering licenses.'
]
/* eslint-enable max-len */

module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')(USAGE).apply(null, arguments)
  if (!options) return

  var readJSONFile = require('../read/json-file')
  var path = require('path')
  readJSONFile(path.join(cwd, 'package.json'), function (error, data) {
    /* istanbul ignore next */
    if (error) return done(error)
    if (!data.hasOwnProperty('licensezero') || !Array.isArray(data.licensezero)) {
      done(new Error('no licensezero property in package.json'))
    }
    if (data.licensezero.length === 0) {
      done(new Error('empty licensezero property in package.json'))
    }
    // TODO: handle retracting with multiple manifests
    if (data.licensezero.length > 1) {
      done(new Error('multiple licensezero manifests in package.json'))
    }
    var first = data.licensezero[0]
    if (
      !first.hasOwnProperty('license') ||
      first.license === null ||
      !first.license.hasOwnProperty('projectID') ||
      typeof first.license.projectID !== 'string'
    ) {
      done(new Error('invalid licensezero manifest in package.json'))
    }
    var projectID = first.license.projectID
    var licensorID = options['--licensor']
    var readLicensor = require('../read/licensor')
    var readOnlyLicensor = require('../read/only-licensor')
    var licensorFunction = options['--licensor']
      ? readLicensor.bind(null, config, licensorID)
      : readOnlyLicensor.bind(null, config)
    licensorFunction(function (error, licensor) {
      /* istanbul ignore next */
      if (error) return done(error)
      var request = require('../request')
      request({
        action: 'retract',
        licensorID: licensor.licensorID,
        token: licensor.token,
        projectID: projectID
      }, function (error, response) {
        if (error) return done(error)
        stdout.write('Project ID ' + response.projectID + ' retracted from sale.\n')
        done()
      })
    })
  })
}
