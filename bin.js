#!/usr/bin/env node
require('update-notifier')({pkg: require('./package.json')})
  .notify({defer: true})

var path = require('path')

// Build the command's usage lines programmatically, so we have a list
// of subcommands in memory to check later, to route to the right
// subcommand handler.
var subcommands = {
  'buy': '[--do-not-open]',
  'identify': '<name> <jurisdiction> <email>',
  'import-license': '<file>',
  'import-waiver': '<file>',
  'license': '<project id> (--noncommercial | --reciprocal)',
  'offer': '<PRICE> [--relicense CENTS]',
  'purchased': '<URL>',
  'quote': '[--no-noncommercial] [--no-reciprocal]',
  'register': '',
  'reset-token': '',
  'retract': '<project id>',
  'set-licensor-id': '<licensor ID>',
  'sponsor': '<project id> [--do-not-open]',
  'waive': '<project id> -b NAME -j CODE -d DAYS',
  'whoami': ''
}
var subcommandNames = Object.keys(subcommands)

/* eslint-disable max-len */
var usage = `Manage License Zero software projects.

Usage:
  licensezero (--help | --version)
${
  subcommandNames
    .map(function (name) {
      if (subcommands[name]) {
        return '  licensezero ' + name + ' ' + subcommands[name]
      } else {
        return '  licensezero ' + name
      }
    })
    .join('\n')
}

Options:
  -h, --help                    Print this screen to standard output.
  -v, --version                 Print version to standard output.
  --do-not-open                 Do not open the payment page in a browser.
  --no-noncommercial            Omit L0-NC projects from quotes and orders.
  --no-reciprocal               Omit L0-R projects from quotes and orders.
  -d DAYS, --days DAYS          Term in days or "forever".
  -j CODE, --jurisdiction CODE  Beneficiary jurisdiction (ISO 3166-2).
  -b NAME, --beneficiary NAME   Beneficiary name.
  -n, --noncommercial           Apply the Noncommercial Public License.
  -r, --reciprocal              Apply the Reciprocal Public License.
  --relicense CENTS             Price for relicensing, in cents.
  -p CENTS, --private CENTS     Price for private licenses, in cents.
  --stack                       Stack License Zero metadata.
`
/* eslint-enable max-len */

function execute (argv, cwd, config, stdin, stdout, stderr, done) {
  try {
    var options = require('docopt').docopt(usage, {
      argv: argv,
      exit: false,
      help: false
    })
  } catch (error) {
    return done(error.message)
  }

  if (options['--help']) {
    stdout.write(usage)
    return done()
  }

  if (options['--version']) {
    stdout.write(require('./package.json').version + '\n')
    return done()
  }

  for (var index = 0; index < subcommandNames.length; index++) {
    var name = subcommandNames[index]
    if (options[name]) {
      return require('./subcommands/' + name)(
        options, cwd, config, stdin, stdout, stderr, done
      )
    }
  }
}

/* istanbul ignore else */
if (module.parent) {
  module.exports = execute
} else {
  execute(
    process.argv.slice(2),
    process.cwd(),
    path.join(
      require('xdg-basedir').config,
      require('./package.json').name
    ),
    process.stdin,
    process.stdout,
    process.stderr,
    function (error) {
      if (error) {
        var formatError = require('./format-error')
        process.stderr.write(formatError(error))
        process.exit(1)
      }
      process.exit(0)
    }
  )
}
