import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import type { Client as NotionClient } from '@notionhq/client'
import { getMockRichTextItem } from '../util.ts'
import { Client } from '../../src/index.ts'
import { blockToHast, CyclicChainError } from '../../src/index.ts'

const getMockBlock = (
  type: string,
  id?: string,
  opts: any = { rich_text: [] },
  has_children = false
): any => {
  return {
    id: id || `${type}-id`,
    type,
    [type]: opts,
    object: 'block',
    has_children
  }
}
describe('blockToHast', () => {
  it('client から取得した block を hast へ変換する', async () => {
    class MockClient extends Client {
      listBlockChildren(
        args: {
          block_id: import('@notionhq/client/build/src/api-endpoints.js').IdRequest
        } & { start_cursor?: string | null; page_size?: number } & {
          auth?: string
        }
      ): ReturnType<NotionClient['blocks']['children']['list']> {
        return Promise.resolve({
          type: 'block',
          block: {},
          object: 'list',
          next_cursor: null,
          has_more: false,
          results: [
            getMockBlock('paragraph', 'test-id-1', {
              color: 'default',
              rich_text: [getMockRichTextItem('test1')]
            })
          ]
        })
      }
    }
    const client = new MockClient()
    assert.deepStrictEqual(
      await blockToHast(client, { block_id: 'test-block-id-0' }, 0, []),
      {
        type: 'root',
        children: [
          {
            type: 'element',
            properties: {},
            tagName: 'p',
            children: [
              {
                type: 'text',
                value: 'test1'
              }
            ]
          }
        ]
      }
    )
  })
})

describe('CyclicChainError class', () => {
  it('should create an error with the correct message', () => {
    const blockId = 'test-block-id'
    const error = new CyclicChainError(blockId)
    assert.strictEqual(
      error.message,
      `Cyclic chain detected at block: ${blockId}`
    )
    assert.strictEqual(error.name, 'CyclicChainError')
  })
  it('blockToHast 処理中に循環参照が発生した場合に CyclicChainError を投げる', async () => {
    class MockClient extends Client {
      private genInstance: Generator<any, any, unknown>
      constructor() {
        super()
        function* gen() {
          // child blocks 表現した results になる。
          // ただし、実際にこのようなな構造にはならない(テスト用)。
          yield {
            type: 'block',
            block: {},
            object: 'list',
            next_cursor: null,
            has_more: false,
            results: [
              getMockBlock(
                'paragraph',
                'test-id-1',
                {
                  color: 'default',
                  rich_text: [getMockRichTextItem('test1')]
                },
                true
              )
            ]
          }
          yield {
            type: 'block',
            block: {},
            has_children: false,
            object: 'list',
            next_cursor: null,
            has_more: false,
            results: [
              getMockBlock(
                'paragraph',
                'test-id-2',
                {
                  color: 'default',
                  rich_text: [getMockRichTextItem('test2')]
                },
                true
              )
            ]
          }
          yield {
            type: 'block',
            block: {},
            has_children: false,
            object: 'list',
            next_cursor: null,
            has_more: false,
            results: [
              getMockBlock(
                'paragraph',
                'test-id-1',
                {
                  color: 'default',
                  rich_text: [getMockRichTextItem('test1')]
                },
                true
              )
            ]
          }
        }
        this.genInstance = gen()
      }
      listBlockChildren(
        args: {
          block_id: import('@notionhq/client/build/src/api-endpoints.js').IdRequest
        } & { start_cursor?: string | null; page_size?: number } & {
          auth?: string
        }
      ): ReturnType<NotionClient['blocks']['children']['list']> {
        return Promise.resolve(this.genInstance.next().value)
      }
    }
    const client = new MockClient()
    const opts = {
      block_id: 'test-block-id',
      colorPropsOpts: {},
      richTexttoHastOpts: {},
      blocktoHastOpts: {}
    }
    await assert.rejects(
      blockToHast(client, { block_id: 'test-block-id-0' }, 0, []),
      new CyclicChainError('test-id-1')
    )
  })
  it('blockToHast 処理中に循環参照が発生したが、childを持っててない場合は CyclicChainError を投げない', async () => {
    class MockClient extends Client {
      private genInstance: Generator<any, any, unknown>
      constructor() {
        super()
        function* gen() {
          // child blocks 表現した results になる。
          // ただし、実際にこのようなな構造にはならない(テスト用)。
          yield {
            type: 'block',
            block: {},
            object: 'list',
            next_cursor: null,
            has_more: false,
            results: [
              getMockBlock(
                'paragraph',
                'test-id-1',
                {
                  color: 'default',
                  rich_text: [getMockRichTextItem('test1')]
                },
                true
              )
            ]
          }
          yield {
            type: 'block',
            block: {},
            has_children: false,
            object: 'list',
            next_cursor: null,
            has_more: false,
            results: [
              getMockBlock(
                'paragraph',
                'test-id-2',
                {
                  color: 'default',
                  rich_text: [getMockRichTextItem('test2')]
                },
                true
              )
            ]
          }
          yield {
            type: 'block',
            block: {},
            has_children: false,
            object: 'list',
            next_cursor: null,
            has_more: false,
            results: [
              getMockBlock(
                'paragraph',
                'test-id-1',
                {
                  color: 'default',
                  rich_text: [getMockRichTextItem('test1')]
                },
                false // "test-id-1"は で循環しているか child を持っていない
              )
            ]
          }
        }
        this.genInstance = gen()
      }
      listBlockChildren(
        args: {
          block_id: import('@notionhq/client/build/src/api-endpoints.js').IdRequest
        } & { start_cursor?: string | null; page_size?: number } & {
          auth?: string
        }
      ): ReturnType<NotionClient['blocks']['children']['list']> {
        return Promise.resolve(this.genInstance.next().value)
      }
    }
    const client = new MockClient()
    const opts = {
      block_id: 'test-block-id',
      colorPropsOpts: {},
      richTexttoHastOpts: {},
      blocktoHastOpts: {}
    }
    assert.deepStrictEqual(
      await blockToHast(client, { block_id: 'test-block-id-0' }, 0, []),
      {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [
              {
                type: 'text',
                value: 'test1'
              },
              {
                type: 'element',
                tagName: 'p',
                properties: {},
                children: [
                  {
                    type: 'text',
                    value: 'test2'
                  },
                  {
                    type: 'element',
                    tagName: 'p',
                    properties: {},
                    children: [
                      {
                        type: 'text',
                        value: 'test1'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    )
  })
})
