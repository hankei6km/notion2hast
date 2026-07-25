import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import * as index from '../src/index.ts'
import { blockToHast } from '../src/lib/notion2hast.ts'
import { Client } from '../src/lib/client.ts'

describe('index.ts', () => {
  it('should export modules', async () => {
    assert.strictEqual(index.blockToHast, blockToHast)
    assert.strictEqual(index.Client, Client)
  })
})
