module.exports = function (error) {
  return typeof error === 'string'
    ? 'Error: ' + error + '\n'
    : (error.userMessage || error.message) + '\n'
}
