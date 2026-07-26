import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { h } from 'hastscript'
import {
  BlockBookmarkToHast,
  BlockBulletedListItemToHast,
  BlockCalloutToHast,
  BlockCodeToHast,
  BlockColumnListToHast,
  BlockColumnToHast,
  BlockDividerToHast,
  BlockHeading1ToHast,
  BlockHeading2ToHast,
  BlockHeading3ToHast,
  BlockHeading4ToHast,
  BlockImageToHast,
  BlockItem,
  BlockNumberedListItemToHast,
  BlockParagraphToHast,
  BlockQuoteToHast,
  BlockTableRowToHast,
  BlockTableToHast,
  BlockTodoToHast,
  BlockToggleToHast,
  isBlock,
  SurroundElement
} from '../../src/lib/block.ts'
import { ColorProps } from '../../src/lib/color.ts'
import { RichTextToHast } from '../../src/lib/richtext.ts'
import { getMockRichTextItem } from '../util.ts'

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

describe('BlockToHastBuilder class', () => {
  it('should build hast as BlockParagraphToHast', async () => {
    const b = new BlockParagraphToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('paragraph', {
          color: 'default',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('p', {}, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('paragraph', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('p', { style: 'color:#9B9A97' }, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('otherother', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('paragraph'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockParagraphToHast(props)', async () => {
    const b = new BlockParagraphToHast({
      propertiesMap: { paragraph: { className: 'foo' } }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('paragraph', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('p', { className: 'foo', style: 'color:#9B9A97' }, ...['test1'])]
    )
  })

  it('should build hast as BlockHeading1ToHast', async () => {
    const b = new BlockHeading1ToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('heading_1', {
          color: 'default',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('h1', {}, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('heading_1', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('h1', { style: 'color:#9B9A97' }, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('heading_1'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockHeading1ToHast(props)', async () => {
    const b = new BlockHeading1ToHast({
      propertiesMap: { 'heading-1': { className: 'foo' } }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('heading_1', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('h1', { className: 'foo', style: 'color:#9B9A97' }, ...['test1'])]
    )
  })

  it('should build hast as BlockHeading2ToHast', async () => {
    const b = new BlockHeading2ToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('heading_2', {
          color: 'default',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('h2', {}, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('heading_2', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('h2', { style: 'color:#9B9A97' }, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('heading_2'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockHeading2ToHast(props)', async () => {
    const b = new BlockHeading2ToHast({
      propertiesMap: { 'heading-2': { className: 'foo' } }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('heading_2', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('h2', { className: 'foo', style: 'color:#9B9A97' }, ...['test1'])]
    )
  })

  it('should build hast as BlockHeading3ToHast', async () => {
    const b = new BlockHeading3ToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('heading_3', {
          color: 'default',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('h3', {}, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('heading_3', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('h3', { style: 'color:#9B9A97' }, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('heading_3'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockHeading3ToHast(props)', async () => {
    const b = new BlockHeading3ToHast({
      propertiesMap: { 'heading-3': { className: 'foo' } }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('heading_3', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('h3', { className: 'foo', style: 'color:#9B9A97' }, ...['test1'])]
    )
  })

  it('should build hast as BlockHeading4ToHast', async () => {
    const b = new BlockHeading4ToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('heading_4', {
          color: 'default',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('h4', {}, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('heading_4', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('h4', { style: 'color:#9B9A97' }, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('heading_4'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockHeading4ToHast(props)', async () => {
    const b = new BlockHeading4ToHast({
      propertiesMap: { 'heading-4': { className: 'foo' } }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('heading_4', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('h4', { className: 'foo', style: 'color:#9B9A97' }, ...['test1'])]
    )
  })

  it('should build hast as BlockCodeToHast', async () => {
    const b = new BlockCodeToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('code', {
          language: 'javascript',
          rich_text: [getMockRichTextItem('test1')],
          caption: []
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'figure',
          {},
          h('pre', {}, h('code', { className: 'javascript' }, ...['test1']))
        )
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('code', {
          language: 'javascript',
          rich_text: [getMockRichTextItem('test1')],
          caption: [getMockRichTextItem('caption1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'figure',
          {},
          h('pre', {}, h('code', { className: 'javascript' }, ...['test1'])),
          h('figcaption', {}, ['caption1'])
        )
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('code'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockCodeToHast(props)', async () => {
    const b = new BlockCodeToHast({
      propertiesMap: {
        code: { className: 'code-class' },
        'code-pre': { className: 'code-pre-class' },
        'code-code': { className: 'code-code-class' },
        'code-caption': { className: 'code-caption-class' }
      }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('code', {
          language: 'javascript',
          rich_text: [getMockRichTextItem('test1')],
          caption: [getMockRichTextItem('caption1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'figure',
          { className: 'code-class' },
          h(
            'pre',
            { className: 'code-pre-class' },
            h('code', { className: 'code-code-class javascript' }, ...['test1'])
          ),
          h('figcaption', { className: 'code-caption-class' }, ['caption1'])
        )
      ]
    )
  })

  it('should build hast as BlockCodeToHast(props className is array)', async () => {
    const b = new BlockCodeToHast({
      propertiesMap: { 'code-code': { className: ['class1', 'class2'] } }
    })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('code', {
          language: 'javascript',
          rich_text: [getMockRichTextItem('test1')],
          caption: []
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'figure',
          {},
          h(
            'pre',
            {},
            h('code', { className: 'class1 class2 javascript' }, ...['test1'])
          )
        )
      ]
    )
  })

  it('should build hast as BlockCalloutToHast', async () => {
    const b = new BlockCalloutToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('callout', {
          color: 'gray',
          icon: {
            type: 'emoji',
            emoji: 'emoji-1'
          },
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'div',
          { style: 'color:#9B9A97' },
          h('div', {}, 'emoji-1'),
          h('div', {}, h('p', 'test1'))
        )
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('callout', {
          color: 'gray',
          icon: {
            type: 'external',
            external: { url: 'test-url' }
          },
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'div',
          { style: 'color:#9B9A97' },
          h('div', {}, h('img', { src: 'test-url' })),
          h('div', {}, h('p', 'test1'))
        )
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('callout', {
          color: 'gray',
          icon: {
            type: 'file',
            file: { url: 'test-url' }
          },
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'div',
          { style: 'color:#9B9A97' },
          h('div', {}, h('img', { src: 'test-url' })),
          h('div', {}, h('p', 'test1'))
        )
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('otherother', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('callout'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockCalloutToHast(props)', async () => {
    const b = new BlockCalloutToHast({
      propertiesMap: {
        callout: { className: 'callout-class' },
        'callout-icon-emoji': { className: 'emoji-class' },
        'callout-icon-image': { className: 'image-class' },
        'callout-paragraph': { className: 'paragraph-class' }
      }
    })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('callout', {
          color: 'gray',
          icon: {
            type: 'emoji',
            emoji: 'emoji-1'
          },
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'div',
          { className: 'callout-class', style: 'color:#9B9A97' },
          h('div', { className: 'emoji-class' }, 'emoji-1'),
          h('div', { className: 'paragraph-class' }, h('p', 'test1'))
        )
      ]
    )

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('callout', {
          color: 'gray',
          icon: {
            type: 'file',
            file: { url: 'test-url' }
          },
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'div',
          { className: 'callout-class', style: 'color:#9B9A97' },
          h('div', { className: 'image-class' }, h('img', { src: 'test-url' })),
          h('div', { className: 'paragraph-class' }, h('p', 'test1'))
        )
      ]
    )
  })

  it('should build hast as BlockDividerToHast', async () => {
    const b = new BlockDividerToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('divider', {}),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('hr')]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('other', {}),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('divider'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockDividerToHast(props)', async () => {
    const b = new BlockDividerToHast({
      propertiesMap: {
        divider: { className: 'foo' }
      }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('divider', {}),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('hr', { className: 'foo' })]
    )
  })

  it('should build hast as BlockColumnListToHast', async () => {
    const b = new BlockColumnListToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('column_list', {}),
        nest: ['col1', 'col2'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('div', {}, ...['col1', 'col2'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('other', {}),
        nest: ['col1', 'col2'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('column_list'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockColumnListToHast(props)', async () => {
    const b = new BlockColumnListToHast({
      propertiesMap: { 'column-list': { className: 'foo' } }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('column_list', {}),
        nest: ['col1', 'col2'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('div', { className: 'foo' }, ...['col1', 'col2'])]
    )
  })

  it('should build hast as BlockColumnToHast', async () => {
    const b = new BlockColumnToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('column', {}),
        nest: ['test1'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('div', {}, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('other', {}),
        nest: ['test1'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('column'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockColumnToHast(props)', async () => {
    const b = new BlockColumnToHast({
      propertiesMap: { column: { className: 'foo' } }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('column', {}),
        nest: ['test1'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('div', { className: 'foo' }, ...['test1'])]
    )
  })

  it('should build hast as BlockBulletedListItemToHast', async () => {
    const b = new BlockBulletedListItemToHast()

    assert.deepStrictEqual(b.outerTag(), { name: 'ul', properties: {} })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('bulleted_list_item', {
          color: 'default',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('li', {}, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('bulleted_list_item', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('li', { style: 'color:#9B9A97' }, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('bulleted_list_item'), false)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockBulletedListItemToHast(props)', async () => {
    const b = new BlockBulletedListItemToHast({
      propertiesMap: {
        'bulleted-list': { className: 'foo' },
        'bulleted-list-item': { className: 'bar' }
      }
    })

    assert.deepStrictEqual(b.outerTag(), {
      name: 'ul',
      properties: { className: 'foo' }
    })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('bulleted_list_item', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('li', { className: 'bar', style: 'color:#9B9A97' }, ...['test1'])]
    )
  })

  it('should build hast as BlockNumberedListItemToHast', async () => {
    const b = new BlockNumberedListItemToHast()

    assert.deepStrictEqual(b.outerTag(), { name: 'ol', properties: {} })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('numbered_list_item', {
          color: 'default',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('li', {}, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('numbered_list_item', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('li', { style: 'color:#9B9A97' }, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('numbered_list_item'), false)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockNumberedListItemToHast(props)', async () => {
    const b = new BlockNumberedListItemToHast({
      propertiesMap: {
        'numbered-list': { className: 'foo' },
        'numbered-list-item': { className: 'bar' }
      }
    })

    assert.deepStrictEqual(b.outerTag(), {
      name: 'ol',
      properties: { className: 'foo' }
    })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('numbered_list_item', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('li', { className: 'bar', style: 'color:#9B9A97' }, ...['test1'])]
    )
  })

  it('should build hast as BlockQuoteToHast', async () => {
    const b = new BlockQuoteToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('quote', {
          color: 'default',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('blockquote', {}, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('quote', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('blockquote', { style: 'color:#9B9A97' }, ...['test1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('otherother', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('quote'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockQuoteToHast(props)', async () => {
    const b = new BlockQuoteToHast({
      propertiesMap: { quote: { className: 'foo' } }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('quote', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'blockquote',
          { className: 'foo', style: 'color:#9B9A97' },
          ...['test1']
        )
      ]
    )
  })

  it('should build hast as BlockTodoToHast', async () => {
    const b = new BlockTodoToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('to_do', {
          color: 'default',
          checked: false,
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('div', {}, h('div', {}), h('div', {}, ...['test1']))]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('to_do', {
          color: 'default',
          checked: true,
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('div', {}, h('div', {}), h('div', {}, ...['test1']))]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('otherother', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('to_do'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockTodoToHast(props)', async () => {
    const b = new BlockTodoToHast({
      propertiesMap: {
        todo: { className: 'todo_class' },
        'todo-checked': { className: 'checked_class' },
        'todo-not-checked': { className: 'not_checked_class' },
        'todo-text': { className: 'text_class' }
      }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('to_do', {
          color: 'default',
          checked: false,
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'div',
          { className: 'todo_class' },
          h('div', { className: 'not_checked_class' }),
          h('div', { className: 'text_class' }, ...['test1'])
        )
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('to_do', {
          color: 'default',
          checked: true,
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'div',
          { className: 'todo_class' },
          h('div', { className: 'checked_class' }),
          h('div', { className: 'text_class' }, ...['test1'])
        )
      ]
    )
  })

  it('should build hast as BlockToggleToHast', async () => {
    const b = new BlockToggleToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('toggle', {
          color: 'default',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: ['details1'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('details', {}, h('summary', {}, ...['test1']), ['details1'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('toggle', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: ['details1'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'details',
          { style: 'color:#9B9A97' },
          h('summary', {}, ...['test1']),
          ['details1']
        )
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('otherother', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('paragraph'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockToggleToHast(props)', async () => {
    const b = new BlockToggleToHast({
      propertiesMap: {
        toggle: { className: 'toggle-class' },
        'toggle-summary': { className: 'toggle-summary-class' }
      }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('toggle', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: ['details1'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'details',
          { className: 'toggle-class', style: 'color:#9B9A97' },
          h('summary', { className: 'toggle-summary-class' }, ...['test1']),
          ['details1']
        )
      ]
    )
  })

  it('should build hast as BlockTableToHast', async () => {
    const b = new BlockTableToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('table', {
          rich_text: []
        }),
        nest: ['rows'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('table', {}, ...['rows'])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('other', {
          rich_text: []
        }),
        nest: ['rows'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('table'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockTableToHast(props)', async () => {
    const b = new BlockTableToHast({
      propertiesMap: { table: { className: 'foo' } }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('table', {
          rich_text: []
        }),
        nest: ['rows'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('table', { className: 'foo' }, ...['rows'])]
    )
  })

  it('should build hast as BlockTablRowToHast', async () => {
    const b = new BlockTableRowToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('table_row', {
          cells: [
            [getMockRichTextItem('test1')],
            [getMockRichTextItem('test2')]
          ]
        }),
        nest: [],
        parent: { type: 'table', table: {} } as any,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('tr', [h('td', {}, ...['test1']), h('td', {}, ...['test2'])])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('table_row', {
          cells: [
            [getMockRichTextItem('test1')],
            [getMockRichTextItem('test2')]
          ]
        }),
        nest: [],
        parent: {
          type: 'table',
          table: {
            has_column_header: true
          }
        } as any,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('tr', [h('th', {}, ...['test1']), h('th', {}, ...['test2'])])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('table_row', {
          cells: [
            [getMockRichTextItem('test1')],
            [getMockRichTextItem('test2')]
          ]
        }),
        nest: [],
        parent: {
          type: 'table',
          table: {
            has_row_header: true
          }
        } as any,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('tr', [h('th', {}, ...['test1']), h('td', {}, ...['test2'])])]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('other', {
          cells: [
            [getMockRichTextItem('test1')],
            [getMockRichTextItem('test2')]
          ]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('table_row'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockTablRowToHast(props)', async () => {
    const b = new BlockTableRowToHast({
      propertiesMap: {
        'table-row': { className: 'tr-class' },
        'table-row-cell': { className: 'td-class' },
        'table-row-header': { className: 'th-class' },
        'table-row-header-top-left': { className: 'th-top-left-class' },
        'table-row-header-top': { className: 'th-top-class' },
        'table-row-header-left': { className: 'th-left-class' }
      }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('table_row', {
          cells: [
            [getMockRichTextItem('test1')],
            [getMockRichTextItem('test2')]
          ]
        }),
        nest: [],
        parent: { type: 'table', table: {} } as any,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h('tr', { className: 'tr-class' }, [
          h('td', { className: 'td-class' }, ...['test1']),
          h('td', { className: 'td-class' }, ...['test2'])
        ])
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('table_row', {
          cells: [
            [getMockRichTextItem('test1')],
            [getMockRichTextItem('test2')]
          ]
        }),
        nest: [],
        parent: {
          type: 'table',
          table: {
            has_column_header: true
          }
        } as any,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h('tr', { className: 'tr-class' }, [
          h('th', { className: 'th-top-left-class' }, ...['test1']),
          h('th', { className: 'th-top-class' }, ...['test2'])
        ])
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('table_row', {
          cells: [
            [getMockRichTextItem('test1')],
            [getMockRichTextItem('test2')]
          ]
        }),
        nest: [],
        parent: {
          type: 'table',
          table: {
            has_row_header: true
          }
        } as any,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h('tr', { className: 'tr-class' }, [
          h('th', { className: 'th-top-left-class' }, ...['test1']),
          h('td', { className: 'td-class' }, ...['test2'])
        ])
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('table_row', {
          cells: [
            [getMockRichTextItem('test1')],
            [getMockRichTextItem('test2')]
          ]
        }),
        nest: [],
        parent: {
          type: 'table',
          table: {
            has_row_header: true
          }
        } as any,
        index: 1,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h('tr', { className: 'tr-class' }, [
          h('th', { className: 'th-left-class' }, ...['test1']),
          h('td', { className: 'td-class' }, ...['test2'])
        ])
      ]
    )
  })

  it('should build hast as BlockTablRowToHast(props just th)', async () => {
    const b = new BlockTableRowToHast({
      propertiesMap: {
        'table-row': { className: 'tr-class' },
        'table-row-cell': { className: 'td-class' },
        'table-row-header': { className: 'th-class' }
      }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('table_row', {
          cells: [
            [getMockRichTextItem('test1')],
            [getMockRichTextItem('test2')]
          ]
        }),
        nest: [],
        parent: {
          type: 'table',
          table: {
            has_column_header: true
          }
        } as any,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h('tr', { className: 'tr-class' }, [
          h('th', { className: 'th-class' }, ...['test1']),
          h('th', { className: 'th-class' }, ...['test2'])
        ])
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('table_row', {
          cells: [
            [getMockRichTextItem('test1')],
            [getMockRichTextItem('test2')]
          ]
        }),
        nest: [],
        parent: {
          type: 'table',
          table: {
            has_row_header: true
          }
        } as any,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h('tr', { className: 'tr-class' }, [
          h('th', { className: 'th-class' }, ...['test1']),
          h('td', { className: 'td-class' }, ...['test2'])
        ])
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('table_row', {
          cells: [
            [getMockRichTextItem('test1')],
            [getMockRichTextItem('test2')]
          ]
        }),
        nest: [],
        parent: {
          type: 'table',
          table: {
            has_row_header: true
          }
        } as any,
        index: 1,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h('tr', { className: 'tr-class' }, [
          h('th', { className: 'th-class' }, ...['test1']),
          h('td', { className: 'td-class' }, ...['test2'])
        ])
      ]
    )
  })

  it('should build hast as BlockBookmarkToHast', async () => {
    const b = new BlockBookmarkToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('bookmark', {
          url: 'test-url',
          caption: []
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('figure', {}, h('a', { href: 'test-url' }, ['test-url']))]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('bookmark', {
          url: 'test-url',
          caption: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'figure',
          {},
          h('a', { href: 'test-url' }, ['test-url']),
          h('figcaption', {}, ['test1'])
        )
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('otherother', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('paragraph'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockBookmarkToHast(props)', async () => {
    const b = new BlockBookmarkToHast({
      propertiesMap: {
        bookmark: { className: 'foo' },
        'bookmark-link': { className: 'bar' },
        'bookmark-caption': { className: 'baz' }
      }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('bookmark', {
          url: 'test-url',
          caption: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'figure',
          { className: 'foo' },
          h('a', { className: 'bar', href: 'test-url' }, ['test-url']),
          h('figcaption', { className: 'baz' }, ['test1'])
        )
      ]
    )
  })

  it('should build hast as BlockImageToHast', async () => {
    const b = new BlockImageToHast()

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('image', {
          type: 'external',
          external: {
            url: 'test-url'
          },
          caption: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'figure',
          {},
          h('img', { src: 'test-url' }),
          h('figcaption', {}, 'test1')
        )
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('image', {
          type: 'file',
          file: {
            url: 'test-url'
          },
          caption: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h(
          'figure',
          {},
          h('img', { src: 'test-url' }),
          h('figcaption', {}, 'test1')
        )
      ]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('image', {
          type: 'external',
          external: {
            url: 'test-url'
          },
          caption: []
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('figure', {}, h('img', { src: 'test-url' }))]
    )
    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      []
    )

    assert.strictEqual(b.isBreak(''), true)
    assert.strictEqual(b.isBreak('image'), true)
    assert.strictEqual(b.isBreak('other' as any), true)
  })

  it('should build hast as BlockImageToHast(props)', async () => {
    const b = new BlockImageToHast({
      propertiesMap: {
        image: { className: 'foo' },
        'image-img': { className: 'bar' },
        'image-caption': { className: 'baz' }
      }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('image', {
          type: 'external',
          external: {
            url: 'test-url'
          },
          caption: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [
        h('figure', { className: 'foo' }, [
          h('img', { className: 'bar', src: 'test-url' }),
          h('figcaption', { className: 'baz' }, 'test1')
        ])
      ]
    )
  })
})

describe('BlockToHastBuilder class(defaultClassName)', () => {
  it('should build hast with default class name', async () => {
    const b = new BlockParagraphToHast({ defaultClassname: true })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('paragraph', {
          color: 'default',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('p', { className: 'paragraph' }, ...['test1'])]
    )
  })

  it('should build hast with mapped class name', async () => {
    const b = new BlockParagraphToHast({
      defaultClassname: true,
      propertiesMap: { paragraph: { className: 'foo' } }
    })

    assert.deepStrictEqual(b.outerTag(), { name: null })

    assert.deepStrictEqual(
      await b.build({
        block: getMockBlock('paragraph', {
          color: 'gray',
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      }),
      [h('p', { className: 'foo', style: 'color:#9B9A97' }, ...['test1'])]
    )
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.content(), [h('hr')])

    surround.reset()
    await surround.append({
      block: getMockBlock('column_list', {}),
      nest: ['col1', 'col2'],
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: { type: 'table', table: {} } as any,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('heading_1'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('heading_2'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('heading_3'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('heading_4'),
      nest: [],
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('divider'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    surround.reset()
    await surround.append({
      block: getMockBlock('column_list', {}),
      nest: ['col1', 'col2'],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    surround.reset()
    await surround.append({
      block: getMockBlock('column', {}),
      nest: ['test1'],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('bulleted_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: 'ul', properties: {} })
    await surround.append({
      block: getMockBlock('numbered_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: 'ol', properties: {} })
    await surround.append({
      block: getMockBlock('table'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('quote', {
        rich_text: [getMockRichTextItem('test1')]
      }),
      nest: [],
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('table_row', { cells: [] }),
      nest: [],
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.deepStrictEqual(surround.outerTag(), { name: null })
    await surround.append({
      block: getMockBlock('unsuported', { cells: [] }),
      nest: [],
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('paragraph'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('bulleted_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('paragraph'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('bulleted_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('numbered_list_item'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('numbered_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('paragraph'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('numbered_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('toggle'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('column_list', {}),
      nest: ['col1', 'col2'],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('column_list'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('column', {}),
      nest: ['test1'],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('column_list'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('table'),
      nest: [],
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('image'), true)

    surround.reset()
    await surround.append({
      block: getMockBlock('other'),
      nest: [],
      parent: undefined,
      index: 0,
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
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('bulleted_list_item'), false)

    surround.reset()
    await surround.append({
      block: getMockBlock('numbered_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    assert.strictEqual(surround.isBreak('numbered_list_item'), false)
  })
})
