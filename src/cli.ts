import { Writable } from 'stream'
import { toHtml as hastToHtml } from 'hast-util-to-html'
import { Client as NotionClient } from '@notionhq/client'
import { ClientOptions } from '@notionhq/client/build/src/Client'
import { Client } from './lib/client.js'
import { blockToHast } from './lib/notion2hast.js'

class CliClient extends Client {
  private client: NotionClient
  constructor(options?: ClientOptions) {
    super()
    this.client = new NotionClient(options)
  }
  async listBlockChildren(
    ...args: Parameters<NotionClient['blocks']['children']['list']>
  ): Promise<ReturnType<NotionClient['blocks']['children']['list']>> {
    return this.client.blocks.children.list(...args)
  }
}

type Opts = {
  apiKey: string
  blockId: string
  defaultClassName?: boolean
  toHtml?: boolean
  stdout: Writable
  stderr: Writable
}
export const cli = async ({
  apiKey,
  blockId,
  defaultClassName,
  toHtml,
  stdout,
  stderr
}: Opts): Promise<number> => {
  try {
    const client = new CliClient({
      auth: apiKey
    })
    const tree = await blockToHast(client, {
      block_id: blockId,
      blocktoHastOpts: { defaultClassName },
      richTexttoHastOpts: { defaultClassName }
    })
    if (toHtml) {
      stdout.write(`${hastToHtml(tree)}\n`)
    } else {
      stdout.write(`${JSON.stringify(tree, null, '  ')}\n`)
    }
  } catch (err: any) {
    stderr.write(err.toString())
    stderr.write('\n')
    return 1
  }
  return 0
}
