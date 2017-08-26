module.exports = function (error) {
  return typeof error === 'string'
    ? error + '\n'
    : error.userMessage || error.message
}
