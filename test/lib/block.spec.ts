import { jest } from '@jest/globals'
import { h } from 'hastscript'
import {
  BlockBookmarkToHast,
  BlockBulletedListItemToHast,
  BlockCalloutToHast,
  BlockCodeToHast,
  BlockDividerToHast,
  BlockHeading1ToHast,
  BlockHeading2ToHast,
  BlockHeading3ToHast,
  BlockImageToHast,
  blockItem,
  BlockNumberedListItemToHast,
  BlockParagraphToHast,
  BlockQuoteToHast,
  BlockTableRowToHast,
  BlockTableToHast,
  BlockTodoToHast,
  BlockToggleToHast,
  isBlock,
  SurroundElement
} from '../../src/lib/block.js'
import { ColorProps } from '../../src/lib/color.js'
import { RichTextToHast } from '../../src/lib/richtext.js'
import { getMockRichTextItem } from '../util.js'

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
    expect(isBlock({ object: 'block', type: 'paragraph' })).toBeTruthy()
  })
  it('should retun false', () => {
    expect(isBlock({ object: '', type: 'paragraph' })).toBeFalsy()
    expect(isBlock({ object: 'block' })).toBeFalsy()
  })
})

describe('blockItem()', () => {
  it('should call list api', async () => {
    const mockList = jest.fn<(a: any[]) => any>().mockResolvedValue({
      results: []
    })
    const client = { listBlockChildren: mockList }
    const gen = blockItem(client as any, { block_id: 'test-id-1' })
    const i = await gen.next()
    expect(mockList).toBeCalledTimes(1)
    expect(mockList).toBeCalledWith({ block_id: 'test-id-1' })
    expect(i.done).toBeTruthy()
  })
  it('should iterate block item', async () => {
    const mockBlocks = [
      { object: 'block', type: 'heading_1' },
      { object: 'block', type: 'paragraph' }
    ]
    const mockList = jest.fn<(a: any[]) => any>().mockResolvedValue({
      results: mockBlocks
    })
    const client = { listBlockChildren: mockList }
    const gen = blockItem(client as any, { block_id: 'test-id-1' })
    let i = await gen.next()
    expect(i.done).toBeFalsy()
    expect(i.value).toEqual(mockBlocks[0])
    i = await gen.next()
    expect(i.done).toBeFalsy()
    expect(i.value).toEqual(mockBlocks[1])
    i = await gen.next()
    expect(i.done).toBeTruthy()
  })
})

describe('BlockToHastBuilder class', () => {
  it('should build hast as BlockParagraphToHast', async () => {
    const b = new BlockParagraphToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([h('p', {}, ...['test1'])])
    expect(
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
      })
    ).toEqual([h('p', { style: 'color:#9B9A97' }, ...['test1'])])
    expect(
      await b.build({
        block: getMockBlock('otherother', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('paragraph')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
  })

  it('should build hast as BlockParagraphToHast(props)', async () => {
    const b = new BlockParagraphToHast({
      propertiesMap: { paragraph: { className: 'foo' } }
    })

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h('p', { className: 'foo', style: 'color:#9B9A97' }, ...['test1'])
    ])
  })

  it('should build hast as BlockHeading1ToHast', async () => {
    const b = new BlockHeading1ToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([h('h1', { id: '8b0ef1905b3c' }, ...['test1'])])
    expect(
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
      })
    ).toEqual([
      h('h1', { id: '8b0ef1905b3c', style: 'color:#9B9A97' }, ...['test1'])
    ])
    expect(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('heading_1')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
  })

  it('should build hast as BlockHeading1ToHast(props)', async () => {
    const b = new BlockHeading1ToHast({
      propertiesMap: { 'heading-1': { className: 'foo' } }
    })

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h(
        'h1',
        { id: '8b0ef1905b3c', className: 'foo', style: 'color:#9B9A97' },
        ...['test1']
      )
    ])
  })

  it('should build hast as BlockHeading2ToHast', async () => {
    const b = new BlockHeading2ToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([h('h2', { id: 'a2cc31006112' }, ...['test1'])])
    expect(
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
      })
    ).toEqual([
      h('h2', { id: 'a2cc31006112', style: 'color:#9B9A97' }, ...['test1'])
    ])
    expect(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('heading_2')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
  })

  it('should build hast as BlockHeading2ToHast(props)', async () => {
    const b = new BlockHeading2ToHast({
      propertiesMap: { 'heading-2': { className: 'foo' } }
    })

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h(
        'h2',
        { id: 'a2cc31006112', className: 'foo', style: 'color:#9B9A97' },
        ...['test1']
      )
    ])
  })

  it('should build hast as BlockHeading3ToHast', async () => {
    const b = new BlockHeading3ToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([h('h3', { id: 'df7d2a664da1' }, ...['test1'])])
    expect(
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
      })
    ).toEqual([
      h('h3', { id: 'df7d2a664da1', style: 'color:#9B9A97' }, ...['test1'])
    ])
    expect(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('heading_3')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
  })

  it('should build hast as BlockHeading3ToHast(props)', async () => {
    const b = new BlockHeading3ToHast({
      propertiesMap: { 'heading-3': { className: 'foo' } }
    })

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h(
        'h3',
        { id: 'df7d2a664da1', className: 'foo', style: 'color:#9B9A97' },
        ...['test1']
      )
    ])
  })

  it('should build hast as BlockCodeToHast', async () => {
    const b = new BlockCodeToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h(
        'figure',
        {},
        h('pre', {}, h('code', { className: 'javascript' }, ...['test1']))
      )
    ])
    expect(
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
      })
    ).toEqual([
      h(
        'figure',
        {},
        h('pre', {}, h('code', { className: 'javascript' }, ...['test1'])),
        h('figcaption', {}, ['caption1'])
      )
    ])
    expect(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('code')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
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

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
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
    ])
  })

  it('should build hast as BlockCodeToHast(props className is array)', async () => {
    const b = new BlockCodeToHast({
      propertiesMap: { 'code-code': { className: ['class1', 'class2'] } }
    })

    expect(
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
      })
    ).toEqual([
      h(
        'figure',
        {},
        h(
          'pre',
          {},
          h('code', { className: 'class1 class2 javascript' }, ...['test1'])
        )
      )
    ])
  })

  it('should build hast as BlockCalloutToHast', async () => {
    const b = new BlockCalloutToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h(
        'div',
        { style: 'color:#9B9A97' },
        h('div', {}, 'emoji-1'),
        h('div', {}, h('p', 'test1'))
      )
    ])
    expect(
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
      })
    ).toEqual([
      h(
        'div',
        { style: 'color:#9B9A97' },
        h('div', {}, h('img', { src: 'test-url' })),
        h('div', {}, h('p', 'test1'))
      )
    ])
    expect(
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
      })
    ).toEqual([
      h(
        'div',
        { style: 'color:#9B9A97' },
        h('div', {}, h('img', { src: 'test-url' })),
        h('div', {}, h('p', 'test1'))
      )
    ])
    expect(
      await b.build({
        block: getMockBlock('otherother', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('callout')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
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

    expect(
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
      })
    ).toEqual([
      h(
        'div',
        { className: 'callout-class', style: 'color:#9B9A97' },
        h('div', { className: 'emoji-class' }, 'emoji-1'),
        h('div', { className: 'paragraph-class' }, h('p', 'test1'))
      )
    ])

    expect(
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
      })
    ).toEqual([
      h(
        'div',
        { className: 'callout-class', style: 'color:#9B9A97' },
        h('div', { className: 'image-class' }, h('img', { src: 'test-url' })),
        h('div', { className: 'paragraph-class' }, h('p', 'test1'))
      )
    ])
  })

  it('should build hast as BlockDividerToHast', async () => {
    const b = new BlockDividerToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
      await b.build({
        block: getMockBlock('divider', {}),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([h('hr')])
    expect(
      await b.build({
        block: getMockBlock('other', {}),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('divider')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
  })

  it('should build hast as BlockDividerToHast(props)', async () => {
    const b = new BlockDividerToHast({
      propertiesMap: {
        divider: { className: 'foo' }
      }
    })

    expect(b.outerTag()).toEqual({ name: null })

    expect(
      await b.build({
        block: getMockBlock('divider', {}),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([h('hr', { className: 'foo' })])
  })

  it('should build hast as BlockBulletedListItemToHast', async () => {
    const b = new BlockBulletedListItemToHast()

    expect(b.outerTag()).toEqual({ name: 'ul', properties: {} })

    expect(
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
      })
    ).toEqual([h('li', {}, ...['test1'])])
    expect(
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
      })
    ).toEqual([h('li', { style: 'color:#9B9A97' }, ...['test1'])])
    expect(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('bulleted_list_item')).toBeFalsy()
    expect(b.isBreak('other' as any)).toBeTruthy()
  })

  it('should build hast as BlockBulletedListItemToHast(props)', async () => {
    const b = new BlockBulletedListItemToHast({
      propertiesMap: {
        'bulleted-list': { className: 'foo' },
        'bulleted-list-item': { className: 'bar' }
      }
    })

    expect(b.outerTag()).toEqual({
      name: 'ul',
      properties: { className: 'foo' }
    })

    expect(
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
      })
    ).toEqual([
      h('li', { className: 'bar', style: 'color:#9B9A97' }, ...['test1'])
    ])
  })

  it('should build hast as BlockNumberedListItemToHast', async () => {
    const b = new BlockNumberedListItemToHast()

    expect(b.outerTag()).toEqual({ name: 'ol', properties: {} })

    expect(
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
      })
    ).toEqual([h('li', {}, ...['test1'])])
    expect(
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
      })
    ).toEqual([h('li', { style: 'color:#9B9A97' }, ...['test1'])])
    expect(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('numbered_list_item')).toBeFalsy()
    expect(b.isBreak('other' as any)).toBeTruthy()
  })

  it('should build hast as BlockNumberedListItemToHast(props)', async () => {
    const b = new BlockNumberedListItemToHast({
      propertiesMap: {
        'numbered-list': { className: 'foo' },
        'numbered-list-item': { className: 'bar' }
      }
    })

    expect(b.outerTag()).toEqual({
      name: 'ol',
      properties: { className: 'foo' }
    })

    expect(
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
      })
    ).toEqual([
      h('li', { className: 'bar', style: 'color:#9B9A97' }, ...['test1'])
    ])
  })

  it('should build hast as BlockQuoteToHast', async () => {
    const b = new BlockQuoteToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([h('blockquote', {}, ...['test1'])])
    expect(
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
      })
    ).toEqual([h('blockquote', { style: 'color:#9B9A97' }, ...['test1'])])
    expect(
      await b.build({
        block: getMockBlock('otherother', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('quote')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
  })

  it('should build hast as BlockQuoteToHast(props)', async () => {
    const b = new BlockQuoteToHast({
      propertiesMap: { quote: { className: 'foo' } }
    })

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h(
        'blockquote',
        { className: 'foo', style: 'color:#9B9A97' },
        ...['test1']
      )
    ])
  })

  it('should build hast as BlockTodoToHast', async () => {
    const b = new BlockTodoToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([h('div', {}, h('div', {}), h('div', {}, ...['test1']))])
    expect(
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
      })
    ).toEqual([h('div', {}, h('div', {}), h('div', {}, ...['test1']))])
    expect(
      await b.build({
        block: getMockBlock('otherother', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('to_do')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
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

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h(
        'div',
        { className: 'todo_class' },
        h('div', { className: 'not_checked_class' }),
        h('div', { className: 'text_class' }, ...['test1'])
      )
    ])
    expect(
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
      })
    ).toEqual([
      h(
        'div',
        { className: 'todo_class' },
        h('div', { className: 'checked_class' }),
        h('div', { className: 'text_class' }, ...['test1'])
      )
    ])
  })

  it('should build hast as BlockToggleToHast', async () => {
    const b = new BlockToggleToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([h('details', {}, h('summary', {}, ...['test1']), ['details1'])])
    expect(
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
      })
    ).toEqual([
      h('details', { style: 'color:#9B9A97' }, h('summary', {}, ...['test1']), [
        'details1'
      ])
    ])
    expect(
      await b.build({
        block: getMockBlock('otherother', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('paragraph')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
  })

  it('should build hast as BlockToggleToHast(props)', async () => {
    const b = new BlockToggleToHast({
      propertiesMap: {
        toggle: { className: 'toggle-class' },
        'toggle-summary': { className: 'toggle-summary-class' }
      }
    })

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h(
        'details',
        { className: 'toggle-class', style: 'color:#9B9A97' },
        h('summary', { className: 'toggle-summary-class' }, ...['test1']),
        ['details1']
      )
    ])
  })

  it('should build hast as BlockTableToHast', async () => {
    const b = new BlockTableToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
      await b.build({
        block: getMockBlock('table', {
          rich_text: []
        }),
        nest: ['rows'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([h('table', {}, ...['rows'])])
    expect(
      await b.build({
        block: getMockBlock('other', {
          rich_text: []
        }),
        nest: ['rows'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('table')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
  })

  it('should build hast as BlockTableToHast(props)', async () => {
    const b = new BlockTableToHast({
      propertiesMap: { table: { className: 'foo' } }
    })

    expect(b.outerTag()).toEqual({ name: null })

    expect(
      await b.build({
        block: getMockBlock('table', {
          rich_text: []
        }),
        nest: ['rows'],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([h('table', { className: 'foo' }, ...['rows'])])
  })

  it('should build hast as BlockTablRowToHast', async () => {
    const b = new BlockTableRowToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([h('tr', [h('td', {}, ...['test1']), h('td', {}, ...['test2'])])])
    expect(
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
      })
    ).toEqual([h('tr', [h('th', {}, ...['test1']), h('th', {}, ...['test2'])])])
    expect(
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
      })
    ).toEqual([h('tr', [h('th', {}, ...['test1']), h('td', {}, ...['test2'])])])
    expect(
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
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('table_row')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
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

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h('tr', { className: 'tr-class' }, [
        h('td', { className: 'td-class' }, ...['test1']),
        h('td', { className: 'td-class' }, ...['test2'])
      ])
    ])
    expect(
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
      })
    ).toEqual([
      h('tr', { className: 'tr-class' }, [
        h('th', { className: 'th-top-left-class' }, ...['test1']),
        h('th', { className: 'th-top-class' }, ...['test2'])
      ])
    ])
    expect(
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
      })
    ).toEqual([
      h('tr', { className: 'tr-class' }, [
        h('th', { className: 'th-top-left-class' }, ...['test1']),
        h('td', { className: 'td-class' }, ...['test2'])
      ])
    ])
    expect(
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
      })
    ).toEqual([
      h('tr', { className: 'tr-class' }, [
        h('th', { className: 'th-left-class' }, ...['test1']),
        h('td', { className: 'td-class' }, ...['test2'])
      ])
    ])
  })

  it('should build hast as BlockTablRowToHast(props just th)', async () => {
    const b = new BlockTableRowToHast({
      propertiesMap: {
        'table-row': { className: 'tr-class' },
        'table-row-cell': { className: 'td-class' },
        'table-row-header': { className: 'th-class' }
      }
    })

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h('tr', { className: 'tr-class' }, [
        h('th', { className: 'th-class' }, ...['test1']),
        h('th', { className: 'th-class' }, ...['test2'])
      ])
    ])
    expect(
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
      })
    ).toEqual([
      h('tr', { className: 'tr-class' }, [
        h('th', { className: 'th-class' }, ...['test1']),
        h('td', { className: 'td-class' }, ...['test2'])
      ])
    ])
    expect(
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
      })
    ).toEqual([
      h('tr', { className: 'tr-class' }, [
        h('th', { className: 'th-class' }, ...['test1']),
        h('td', { className: 'td-class' }, ...['test2'])
      ])
    ])
  })

  it('should build hast as BlockBookmarkToHast', async () => {
    const b = new BlockBookmarkToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([h('figure', {}, h('a', { href: 'test-url' }, ['test-url']))])
    expect(
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
      })
    ).toEqual([
      h(
        'figure',
        {},
        h('a', { href: 'test-url' }, ['test-url']),
        h('figcaption', {}, ['test1'])
      )
    ])
    expect(
      await b.build({
        block: getMockBlock('otherother', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('paragraph')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
  })

  it('should build hast as BlockBookmarkToHast(props)', async () => {
    const b = new BlockBookmarkToHast({
      propertiesMap: {
        bookmark: { className: 'foo' },
        'bookmark-link': { className: 'bar' },
        'bookmark-caption': { className: 'baz' }
      }
    })

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h(
        'figure',
        { className: 'foo' },
        h('a', { className: 'bar', href: 'test-url' }, ['test-url']),
        h('figcaption', { className: 'baz' }, ['test1'])
      )
    ])
  })

  it('should build hast as BlockImageToHast', async () => {
    const b = new BlockImageToHast()

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h(
        'figure',
        {},
        h('img', { src: 'test-url' }),
        h('figcaption', {}, 'test1')
      )
    ])
    expect(
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
      })
    ).toEqual([
      h(
        'figure',
        {},
        h('img', { src: 'test-url' }),
        h('figcaption', {}, 'test1')
      )
    ])
    expect(
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
      })
    ).toEqual([h('figure', {}, h('img', { src: 'test-url' }))])
    expect(
      await b.build({
        block: getMockBlock('other', {
          rich_text: [getMockRichTextItem('test1')]
        }),
        nest: [],
        parent: undefined,
        index: 0,
        richTextToHast: new RichTextToHast(),
        colorProps: new ColorProps({})
      })
    ).toEqual([])

    expect(b.isBreak('')).toBeTruthy()
    expect(b.isBreak('image')).toBeTruthy()
    expect(b.isBreak('other' as any)).toBeTruthy()
  })

  it('should build hast as BlockImageToHast(props)', async () => {
    const b = new BlockImageToHast({
      propertiesMap: {
        image: { className: 'foo' },
        'image-img': { className: 'bar' },
        'image-caption': { className: 'baz' }
      }
    })

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h('figure', { className: 'foo' }, [
        h('img', { className: 'bar', src: 'test-url' }),
        h('figcaption', { className: 'baz' }, 'test1')
      ])
    ])
  })
})

describe('BlockToHastBuilder class(defaultClassName)', () => {
  it('should build hast with default class name', async () => {
    const b = new BlockParagraphToHast({ defaultClassname: true })

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([h('p', { className: 'paragraph' }, ...['test1'])])
  })

  it('should build hast with mapped class name', async () => {
    const b = new BlockParagraphToHast({
      defaultClassname: true,
      propertiesMap: { paragraph: { className: 'foo' } }
    })

    expect(b.outerTag()).toEqual({ name: null })

    expect(
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
      })
    ).toEqual([
      h('p', { className: 'foo', style: 'color:#9B9A97' }, ...['test1'])
    ])
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
    expect(surround.content()).toEqual([h('p', {}, ...['test1'])])

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
    expect(surround.content()).toEqual([
      h('h1', { id: '8b0ef1905b3c' }, ...['test1'])
    ])

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
    expect(surround.content()).toEqual([
      h('h2', { id: 'a2cc31006112' }, ...['test1'])
    ])

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
    expect(surround.content()).toEqual([
      h('h3', { id: 'df7d2a664da1' }, ...['test1'])
    ])

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
    expect(surround.content()).toEqual([
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
    expect(surround.content()).toEqual([
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
    expect(surround.content()).toEqual([h('hr')])

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
    expect(surround.content()).toEqual([h('li', {}, ...['test1'])])

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
    expect(surround.content()).toEqual([h('li', {}, ...['test1'])])

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
    expect(surround.content()).toEqual([h('blockquote', {}, ...['test1'])])

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
    expect(surround.content()).toEqual([
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
    expect(surround.content()).toEqual([
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
    expect(surround.content()).toEqual([h('table', {}, ...['rows'])])

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
    expect(surround.content()).toEqual([
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
    expect(surround.content()).toEqual([
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
    expect(surround.content()).toEqual(['test-nest-1'])
  })

  it('should return tag name ', async () => {
    const surround = new SurroundElement('')
    expect(surround.outerTag()).toBeNull()
    await surround.append({
      block: getMockBlock('paragraph'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.outerTag()).toEqual({ name: null })
    await surround.append({
      block: getMockBlock('heading_1'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.outerTag()).toEqual({ name: null })
    await surround.append({
      block: getMockBlock('heading_2'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.outerTag()).toEqual({ name: null })
    await surround.append({
      block: getMockBlock('heading_3'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.outerTag()).toEqual({ name: null })
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
    expect(surround.outerTag()).toEqual({ name: null })
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
    expect(surround.outerTag()).toEqual({ name: null })
    await surround.append({
      block: getMockBlock('divider'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.outerTag()).toEqual({ name: null })
    await surround.append({
      block: getMockBlock('bulleted_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.outerTag()).toEqual({ name: 'ul', properties: {} })
    await surround.append({
      block: getMockBlock('numbered_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.outerTag()).toEqual({ name: 'ol', properties: {} })
    await surround.append({
      block: getMockBlock('table'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.outerTag()).toEqual({ name: null })
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
    expect(surround.outerTag()).toEqual({ name: null })
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
    expect(surround.outerTag()).toEqual({ name: null })
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
    expect(surround.outerTag()).toEqual({ name: null })
    await surround.append({
      block: getMockBlock('table_row', { cells: [] }),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.outerTag()).toEqual({ name: null })
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
    expect(surround.outerTag()).toEqual({ name: null })
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
    expect(surround.outerTag()).toEqual({ name: null })
    await surround.append({
      block: getMockBlock('unsuported', { cells: [] }),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.outerTag()).toBeNull()
  })

  it('should reset block type in previous', async () => {
    const surround = new SurroundElement('paragraph')
    expect((surround as any).prevType).toEqual('paragraph')
    surround.reset()
    expect((surround as any).prevType).toEqual('')
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
    expect(surround.isBreak('paragraph')).toBeTruthy()

    surround.reset()
    await surround.append({
      block: getMockBlock('bulleted_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.isBreak('paragraph')).toBeTruthy()

    surround.reset()
    await surround.append({
      block: getMockBlock('bulleted_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.isBreak('numbered_list_item')).toBeTruthy()

    surround.reset()
    await surround.append({
      block: getMockBlock('numbered_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.isBreak('paragraph')).toBeTruthy()

    surround.reset()
    await surround.append({
      block: getMockBlock('numbered_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.isBreak('bulleted_list_item')).toBeTruthy()

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
    expect(surround.isBreak('quote')).toBeTruthy()

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
    expect(surround.isBreak('to_do')).toBeTruthy()

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
    expect(surround.isBreak('toggle')).toBeTruthy()

    surround.reset()
    surround.reset()
    await surround.append({
      block: getMockBlock('table'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.isBreak('table')).toBeTruthy()

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
    expect(surround.isBreak('table_row')).toBeTruthy()

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
    expect(surround.isBreak('bookmark')).toBeTruthy()

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
    expect(surround.isBreak('image')).toBeTruthy()

    surround.reset()
    await surround.append({
      block: getMockBlock('other'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.isBreak('paragraph')).toBeTruthy()
  })

  it('should not break by block type', async () => {
    const surround = new SurroundElement('')

    surround.reset()
    expect(surround.isBreak('paragraph')).toBeFalsy()

    surround.reset()
    await surround.append({
      block: getMockBlock('bulleted_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.isBreak('bulleted_list_item')).toBeFalsy()

    surround.reset()
    await surround.append({
      block: getMockBlock('numbered_list_item'),
      nest: [],
      parent: undefined,
      index: 0,
      richTextToHast: new RichTextToHast(),
      colorProps: new ColorProps({})
    })
    expect(surround.isBreak('numbered_list_item')).toBeFalsy()
  })
})
