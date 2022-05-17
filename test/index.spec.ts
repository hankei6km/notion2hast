import * as index from '../src/index.js'
import { blockToHast } from '../src/lib/notion2hast.js'
import { Client } from '../src/lib/client.js'

describe('index.ts', () => {
  it('should export modules', async () => {
    expect(index.blockToHast).toEqual(blockToHast)
    expect(index.Client).toEqual(Client)
  })
})
