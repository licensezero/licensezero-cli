module.exports = function (argv, cwd, config, stdin, stdout, stderr, done) {
  var options = require('./usage')([
    'Identify and price unlicensed License Zero JavaScript packages.',
    '',
    'Usage:',
    '  l0-bom <nickname>',
    '  l0-bom -h | --help',
    '  l0-bom -v | --version',
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
    var licensee = result.licensee
    var licensable = result.licensable
    var licensed = result.licensed
    var waived = result.waived
    var unlicensed = result.unlicensed
    if (licensable.length === 0) {
      stdout.write('No License Zero dependencies found.')
      return done(0)
    }
    stdout.write('License Zero Products: ' + licensable.length + '\n')
    stdout.write('Licensed: ' + licensed.length + '\n')
    stdout.write('Waived: ' + waived.length + '\n')
    stdout.write('Unlicensed: ' + unlicensed.length + '\n')
    if (unlicensed.length === 0) return done(0)
    var request = require('../request')
    request({
      action: 'quote',
      products: unlicensed.map(function (metadata) {
        return metadata.productID
      })
    }, function (error, response) {
      if (error) return done(error)
      var lamos = require('lamos')
      var products = response.products
      var formattedProducts = []
      var total = 0
      products.forEach(function (product) {
        var licensor = product.licensor
        var price = product.pricing[licensee.tier]
        var formatted = {
          Product: product.productID,
          Description: product.description,
          Repository: product.repository,
          'Grace Period': product.grace + ' calendar days',
          Licensor: (
            licensor.name + ' [' + licensor.jurisdiction + ']'
          )
        }
        if (product.retracted) {
          formatted.Retracted = product.retracted
        } else {
          total += price
          formatted.Price = (
            currency(price) +
            ' (' + capitalize(licensee.tier) + ' License)'
          )
        }
        formattedProducts.push(formatted)
      })
      stdout.write(
        lamos.stringify({
          Products: formattedProducts,
          Total: currency(total)
        })
      )
      done(0)
    })
  })
}

function currency (cents) {
  return '$' + (
    cents < 100
      ? '0.' + (cents < 10 ? '0' + cents : cents)
      : cents.toString().replace(/(\d\d)$/, '.$1')
  )
}

function capitalize (string) {
  return string[0].toUpperCase() + string.slice(1)
}
