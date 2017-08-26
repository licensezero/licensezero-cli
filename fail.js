module.exports = function (error) {
  if (typeof error === 'string') {
    console.error(error)
  } else {
    console.error(error.userMessage || error)
  }
  process.exit(1)
}
