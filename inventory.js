var readLicensee = require('./read/licensee')
var readLicenses = require('./read/licenses')
var readPackageTree = require('read-package-tree')
var readWaivers = require('./read/waivers')
var runParallel = require('run-parallel')

module.exports = function (nickname, cwd, config, callback) {
  readLicensee(config, nickname, function (error, licensee) {
    if (error) return callback(error)
    runParallel({
      licenses: readLicenses.bind(null, config, nickname),
      waivers: readWaivers.bind(null, config, nickname)
    }, function (error, existing) {
      if (error) return callback(error)
      readPackageTree(cwd, function (error, tree) {
        if (error) return callback(error)
        var licensable = tree.children
          .map(function (node) {
            return node.package
          })
          .filter(function (dependency) {
            return hasProductID(dependency)
          })
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
        return callback(null, {
          licensee: licensee,
          licensable: licensable,
          licensed: licensed,
          waived: waived,
          unlicensed: unlicensed
        })
      })
    })
  })
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
