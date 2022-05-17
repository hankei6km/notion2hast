import { Client as NotionClient } from '@notionhq/client'
export abstract class Client {
  abstract listBlockChildren(
    ...args: Parameters<NotionClient['blocks']['children']['list']>
  ): Promise<ReturnType<NotionClient['blocks']['children']['list']>>
}
