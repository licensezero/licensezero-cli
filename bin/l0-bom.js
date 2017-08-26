module.exports = function (argv, cwd, config, stdout, stderr, done) {
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

  var ecb = require('ecb')
  var readIdentity = require('../read/identity')
  readIdentity(config, nickname, ecb(done, function (identity) {
    var readLicenses = require('../read/licenses')
    var readWaivers = require('../read/waivers')
    var runParallel = require('run-parallel')
    runParallel({
      licenses: readLicenses.bind(null, config, nickname),
      waivers: readWaivers.bind(null, config, nickname)
    }, ecb(done, function (existing) {
      var readPackageTree = require('read-package-tree')
      readPackageTree(cwd, ecb(done, function (tree) {
        var licensable = tree.children
          .map(function (node) {
            return node.package
          })
          .filter(function (dependency) {
            return hasProductID(dependency)
          })
        if (licensable.length === 0) {
          stdout.write('No License Zero dependencies found.')
          return done(0)
        }
        stdout.write(
          'License Zero Products: ' + licensable.length + '\n'
        )
        var unlicensed = []
        var licensed = []
        var waived = []
        licensable.forEach(function (dependency) {
          var productID = dependencyProductID(dependency)
          var haveLicense = existing.licenses.some(function (license) {
            return license.productID === productID
          })
          // TODO: Check whether existing license matches current tier
          // TODO: Price upgrades
          if (haveLicense) return licensed.push(dependency)
          var haveWaiver = existing.waivers.some(function (waiver) {
            return waiver.productID === productID
          })
          if (haveWaiver) return waived.push(dependency)
          unlicensed.push(dependency)
        })
        if (unlicensed.length === 0) {
          stdout.write('No unlicensed License Zero dependencies found.')
          return done(0)
        }
        stdout.write('Licensed: ' + licensed.length + '\n')
        stdout.write('Waived: ' + waived.length + '\n')
        stdout.write('Unlicensed: ' + unlicensed.length + '\n')
        var request = require('../request')
        request({
          action: 'quote',
          products: unlicensed.map(function (dependency) {
            return dependencyProductID(dependency)
          })
        }, ecb(done, function (response) {
          var lamos = require('lamos')
          var products = response.products
          var formattedProducts = []
          var total = 0
          products.forEach(function (product) {
            var licensor = product.licensor
            var price = product.pricing[identity.tier]
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
                ' (' + capitalize(identity.tier) + ' License)'
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
        }))
      }))
    }))
  }))
}

function hasProductID (dependency) {
  return (
    isObject(dependency.licensezero) &&
    isObject(dependency.licensezero.metadata) &&
    typeof dependency.licensezero.metadata.productID === 'string'
  )
}

function dependencyProductID (dependency) {
  return dependency.licensezero.metadata.productID
}

function isObject (argument) {
  return typeof argument === 'object' && argument !== null
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
