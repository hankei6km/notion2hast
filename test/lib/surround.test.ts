import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { h } from 'hastscript'
import type { ToHastOpts } from '../../src/builder/types.ts'
import { SurroundElement, BlockItem, isBlock } from '../../src/lib/surround.ts'
import { ColorProps } from '../../src/builder/color.ts'
import { RichTextToHast } from '../../src/builder/richtext.ts'
import { getMockRichTextItem } from '../util.ts'

const getToHastOpts: () => ToHastOpts = () => ({
  block_id: 'test-id-1'
})

const getMockBlock = (
  type: string,
  opts: any = { rich_text: [] },
  id?: string
): any => {
  return {
    id: id || `${type}-id`,
    type,
    [type]: opts
  }
}

describe('isBlock()', () => {
  it('should retun true', () => {
    assert.strictEqual(isBlock({ object: 'block', type: 'paragraph' }), true)
  })
  it('should retun false', () => {
    assert.strictEqual(isBlock({ object: '', type: 'paragraph' }), false)
    assert.strictEqual(isBlock({ object: 'block' }), false)
  })
})

describe('BlockItem class', () => {
  it('should call list api in init()', async (t) => {
    const mockList = t.mock.fn<(a: any[]) => any>(() =>
      Promise.resolve({ results: [] })
    )
    const client = { listBlockChildren: mockList }
    const i = new BlockItem(client as any, { block_id: 'test-id-1' })
    await i.init()
    assert.strictEqual(mockList.mock.callCount(), 1)
    assert.deepStrictEqual(mockList.mock.calls[0].arguments[0], {
      block_id: 'test-id-1'
    })
  })
  it('should iterate block item', async (t) => {
    const mockBlocks = [
      { object: 'block', type: 'heading_1' },
      { object: 'block', type: 'paragraph' }
    ]
    const mockList = t.mock.fn<(a: any[]) => any>(() =>
      Promise.resolve({ results: mockBlocks })
    )
    const client = { listBlockChildren: mockList }
    const i = new BlockItem(client as any, { block_id: 'test-id-1' })
    await i.init()
    assert.deepStrictEqual(await i.block(), mockBlocks[0])
    assert.deepStrictEqual(await i.block(), mockBlocks[1])
    assert.deepStrictEqual(await i.block(), null)
  })
  it('should use next_cursor', async (t) => {
    const mockBlocks1 = [
      { object: 'block', type: 'heading_1' },
      { object: 'block', type: 'paragraph' }
    ]
    const mockBlocks2 = [
      { object: 'block', type: 'heading_2' },
      { object: 'block', type: 'code' }
    ]
    const ite = (async function* () {
      yield Promise.resolve({
        next_cursor: 'cursor1',
        results: mockBlocks1
      })
      yield Promise.resolve({
        next_cursor: null,
        results: mockBlocks2
      })
    })()
    const mockList = t.mock.fn<(a: any[]) => any>(
      async () => (await ite.next()).value
    )

    const client = { listBlockChildren: mockList }
    const i = new BlockItem(client as any, { block_id: 'test-id-1' })
    await i.init()
    assert.deepStrictEqual(await i.block(), mockBlocks1[0])
    assert.deepStrictEqual(await i.block(), mockBlocks1[1])
    assert.deepStrictEqual(await i.block(), mockBlocks2[0])
    assert.deepStrictEqual(await i.block(), mockBlocks2[1])
    assert.deepStrictEqual(await i.block(), null)

    assert.strictEqual(mockList.mock.callCount(), 2)
    assert.deepStrictEqual(mockList.mock.calls[0].arguments[0], {
      block_id: 'test-id-1'
    })
    assert.deepStrictEqual(mockList.mock.calls[1].arguments[0], {
      block_id: 'test-id-1',
      start_cursor: 'cursor1'
    })
  })
})

describe('SurroundElement class', () => {
  it('should append children by rich text', async () => {
    const surround = new SurroundElement('')

    surround.reset()
    await surround.append({
      block: getMockBlock('paragraph', {
        color: 'default',
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [h('p', {}, ...['test1'])])

    surround.reset()
    await surround.append({
      block: getMockBlock('heading_1', {
        color: 'default',
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [h('h1', {}, ...['test1'])])

    surround.reset()
    await surround.append({
      block: getMockBlock('heading_2', {
        color: 'default',
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [h('h2', {}, ...['test1'])])

    surround.reset()
    await surround.append({
      block: getMockBlock('heading_3', {
        color: 'default',
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [h('h3', {}, ...['test1'])])

    surround.reset()
    await surround.append({
      block: getMockBlock('heading_4', {
        color: 'default',
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [h('h4', {}, ...['test1'])])

    surround.reset()
    await surround.append({
      block: getMockBlock('code', {
        language: 'javascript',
        rich_text: [getMockRichTextItem('test1')],
        caption: []
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [
      h(
        'figure',
        {},
        h('pre', {}, h('code', { className: 'javascript' }, ...['test1']))
      )
    ])

    surround.reset()
    await surround.append({
      block: getMockBlock('callout', {
        color: 'gray',
        icon: {
          type: 'emoji',
          emoji: 'emoji-1'
        },
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [
      h(
        'div',
        { style: 'color:#9B9A97' },
        h('div', {}, 'emoji-1'),
        h('div', {}, h('p', 'test1'))
      )
    ])

    surround.reset()
    await surround.append({
      block: getMockBlock('divider', {}),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [h('hr')])

    surround.reset()
    await surround.append({
      block: getMockBlock('column_list', {}),
      nest: ['col1', 'col2'],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [
      h('div', {}, ...['col1', 'col2'])
    ])

    surround.reset()
    await surround.append({
      block: getMockBlock('column', {}),
      nest: ['test1'],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [h('div', {}, ...['test1'])])

    surround.reset()
    await surround.append({
      block: getMockBlock('bulleted_list_item', {
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [h('li', {}, ...['test1'])])

    surround.reset()
    await surround.append({
      block: getMockBlock('numbered_list_item', {
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [h('li', {}, ...['test1'])])

    surround.reset()
    await surround.append({
      block: getMockBlock('quote', {
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [
      h('blockquote', {}, ...['test1'])
    ])

    surround.reset()
    await surround.append({
      block: getMockBlock('to_do', {
        color: 'default',
        checked: false,
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [
      h('div', {}, h('div', {}), h('div', {}, ...['test1']))
    ])

    surround.reset()
    await surround.append({
      block: getMockBlock('toggle', {
        color: 'default',
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: ['details1'],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [
      h('details', {}, h('summary', {}, ...['test1']), ['details1'])
    ])

    surround.reset()
    await surround.append({
      block: getMockBlock('table', {
        rich_text: []
      }),
      nest: ['rows'],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [h('table', {}, ...['rows'])])

    surround.reset()
    await surround.append({
      block: getMockBlock('table_row', {
        cells: [[getMockRichTextItem('test1')], [getMockRichTextItem('test2')]]
      }),
      nest: [],
      index: 0,
      depth: 1,
      parents: [
        {
          type: 'table',
          table: {}
        } as any
      ],
      opts: {
        ...getToHastOpts(),
        parent: {
          type: 'table',
          table: {}
        } as any
      },
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [
      h('tr', [h('td', {}, ...['test1']), h('td', {}, ...['test2'])])
    ])

    surround.reset()
    await surround.append({
      block: getMockBlock('image', {
        type: 'external',
        external: { url: 'test-url' },
        caption: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [
      h(
        'figure',
        {},
        h('img', { src: 'test-url' }),
        h('figcaption', {}, ['test1'])
      )
    ])
  })

  it('should nesting content', async () => {
    const surround = new SurroundElement('')
    surround.nest('test-nest-1')
    assert.deepStrictEqual(surround.content(), ['test-nest-1'])
  })

  it('should return tag name ', async () => {
    const surround = new SurroundElement('')
    assert.strictEqual(surround.outerTag(), null)
    await surround.append({
      block: getMockBlock('paragraph'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('heading_1'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('heading_2'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('heading_3'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('heading_4'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('code', {
        rich_text: ['test1'],
        caption: []
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('callout', {
        color: 'gray',
        icon: {
          type: 'emoji',
          emoji: 'emoji-1'
        },
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('divider'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    surround.reset()
    await surround.append({
      block: getMockBlock('column_list', {}),
      nest: ['col1', 'col2'],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    surround.reset()
    await surround.append({
      block: getMockBlock('column', {}),
      nest: ['test1'],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('bulleted_list_item'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: 'ul', properties: {} })
    await surround.append({
      block: getMockBlock('numbered_list_item'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: 'ol', properties: {} })
    await surround.append({
      block: getMockBlock('table'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('quote', {
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('to_do', {
        color: 'default',
        checked: false,
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    surround.reset()
    await surround.append({
      block: getMockBlock('toggle', {
        color: 'default',
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: ['details1'],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('table_row', { cells: [] }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('bookmark', {
        url: 'test-url',
        caption: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('image', {
        type: 'external',
        external: { url: '' },
        caption: []
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('unsuported', { cells: [] }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.outerTag(), null)
  })

  it('should reset block type in previous', async () => {
    const surround = new SurroundElement('paragraph')
    assert.deepStrictEqual((surround as any).prevType, 'paragraph')
    surround.reset()
    assert.deepStrictEqual((surround as any).prevType, '')
  })

  it('should break by block type', async () => {
    const surround = new SurroundElement('')

    surround.reset()
    await surround.append({
      block: getMockBlock('paragraph'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('paragraph'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('bulleted_list_item'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('paragraph'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('bulleted_list_item'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('numbered_list_item'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('numbered_list_item'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('paragraph'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('numbered_list_item'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('bulleted_list_item'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('quote', {
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('quote'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('to_do', {
        color: 'default',
        checked: false,
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('to_do'), true)

    surround.reset()
    surround.reset()
    await surround.append({
      block: getMockBlock('toggle', {
        color: 'default',
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: ['details1'],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('toggle'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('column_list', {}),
      nest: ['col1', 'col2'],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('column_list'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('column', {}),
      nest: ['test1'],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('column_list'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('table'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('table'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('table_row', {
        cells: [[], [getMockRichTextItem('test2')]]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('table_row'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('bookmark', {
        url: 'test-url',
        caption: [getMockRichTextItem('test1')]
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('bookmark'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('image', {
        type: 'external',
        external: { url: '' },
        caption: []
      }),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('image'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('other'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('paragraph'), true)
  })

  it('should not break by block type', async () => {
    const surround = new SurroundElement('')

    surround.reset()
    assert.strictEqual(surround.isBreak('paragraph'), false)

    surround.reset()
    await surround.append({
      block: getMockBlock('bulleted_list_item'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('bulleted_list_item'), false)

    surround.reset()
    await surround.append({
      block: getMockBlock('numbered_list_item'),
      nest: [],
      index: 0,
      depth: 0,
      parents: [],
      opts: getToHastOpts(),
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('numbered_list_item'), false)
  })
})
