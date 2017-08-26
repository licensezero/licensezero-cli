var fs = require('fs')

module.exports = function (file, data, callback) {
  fs.writeFile(file, JSON.stringify(data), callback)
}
