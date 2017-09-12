module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'Generate a signed commercial-use waiver.',
    '',
    'Usage:',
    '  l0-waive <UUID> -n NAME -j CODE -t TERM [-l UUID]',
    '  l0-waive -h | --help',
    '  l0-waive -v | --version',
    '',
    'Options:',
    '  -h, --help                    Print this screen to standard output.',
    '  -v, --version                 Print version to standard output.',
    '  -q, --quiet                   Suppress output.',
    '  -n NAME, --name NAME          Beneficiary name.',
    '  -j CODE, --jurisdiction CODE  Beneficiary jurisdiction (ISO 3166-2).',
    '  -t TERM, --term TERM          Term in days or "forever".',
    '  -l UUID, --licensor UUID      Licensor waiving.'
  ]).apply(null, arguments)
  if (!options) return

  var projectID = options['<UUID>']
  var name = options['--name']
  var jurisdiction = options['--jurisdiction']
  var term = options['--term']
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
    var payload = {
      action: 'waiver',
      licensorID: licensor.licensorID,
      projectID: projectID,
      token: licensor.token,
      beneficiary: name,
      jurisdiction: jurisdiction,
      term: term.toLowerCase() === 'forever' ? 'forever' : parseInt(term)
    }
    request(payload, function (error, response) {
      if (error) return done(error)
      stdout.write(JSON.stringify(response, null, 2) + '\n')
      done()
    })
  })
}
