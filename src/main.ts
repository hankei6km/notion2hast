#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { cli } from './cli.js'

const envVarsPrefix =
  process.env['NOTION2HAST_ENV_VARS_PREFIX'] || 'NOTION2HAST'

;(async () => {
  const argv = await yargs(hideBin(process.argv))
    .scriptName('notion2hast')
    .env(envVarsPrefix)
    .usage('$0 [OPTIONS]...')
    .demand(0)
    .options({
      'api-key': {
        type: 'string',
        array: false,
        required: true,
        description: 'API Key to API endpoint'
      },
      'block-id': {
        type: 'string',
        array: false,
        required: true,
        description: 'The id of root block in Notion'
      },
      'default-class-name': {
        type: 'boolean',
        array: false,
        required: false,
        description: 'Set default name to class of each elements'
      },
      'to-html': {
        type: 'boolean',
        array: false,
        required: false,
        description: 'Convert hast to html'
      }
    })
    .help().argv

  process.exit(
    await cli({
      apiKey: argv['api-key'],
      blockId: argv['block-id'],
      defaultClassName: argv['default-class-name'],
      toHtml: argv['to-html'],
      stdout: process.stdout,
      stderr: process.stderr
    })
  )
})()
