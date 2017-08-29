module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'Buy missing License Zero dependency licenses.',
    '',
    'Usage:',
    '  l0-buy <nickname>',
    '  l0-buy -h | --help',
    '  l0-buy -v | --version',
    '',
    'Options:',
    '  -h, --help     Print this screen to standard output.',
    '  -v, --version  Print version to standard output.'
  ]).apply(null, arguments)
  if (!options) return

  var nickname = options['<nickname>']

  var inventory = require('../inventory')
  inventory(nickname, cwd, config, function (error, result) {
    if (error) return done(error)
    var unlicensed = result.unlicensed
    var licensable = result.licensable
    var licensee = result.licensee
    var request = require('../request')
    if (licensable.length === 0) {
      stdout.write('No License Zero dependencies found.')
      return done(0)
    }
    if (unlicensed.length === 0) return done(0)
    request({
      action: 'buy',
      products: unlicensed.map(function (dependency) {
        return dependency.licensezero.metadata.productID
      }),
      licensee: licensee.name,
      jurisdiction: licensee.jurisdiction,
      tier: licensee.tier
    }, function (error, response) {
      if (error) return done(error)
      stdout.write(response.location + '\n')
      done(0)
    })
  })
}
