import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { h } from 'hastscript'
import { getMockRichTextItem } from '../util.ts'
import { colorText, RichTextToHast } from '../../src/lib/richtext.ts'
import { ColorProps } from '../../src/lib/color.ts'
import type { BlockToHastBuilderBuildOpts } from '../../src/lib/types.ts'

describe('colorText()', () => {
  it('should retun color', () => {
    assert.deepStrictEqual(colorText('gray'), ['gray', ''])
  })
  it('should retun background color', () => {
    assert.deepStrictEqual(colorText('gray_background'), ['', 'gray'])
  })
})

const getBuildOpts = (block: any, opts: any, richTextToHast: RichTextToHast) =>
  ({
    block,
    nest: [],
    opts,
    index: 0,
    depth: 0,
    parents: [],
    richTextToHast,
    colorProps: {} as ColorProps
  }) as BlockToHastBuilderBuildOpts

describe('RichTextToHast.build() - textToHast', () => {
  it('should hast from rich_text(basic)', async () => {
    const r = new RichTextToHast({})
    assert.deepStrictEqual(
      await r.build([getMockRichTextItem('test1')], getBuildOpts({}, {}, r)),
      ['test1']
    )
  })
  it('should hast from rich_text(link)', async () => {
    const r = new RichTextToHast({})
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { href: 'https://www.notion.so/' })],
        getBuildOpts({}, {}, r)
      ),
      [h('a', { href: 'https://www.notion.so/' }, ['test1'])]
    )
  })
  it('should hast from rich_text array(annotaions)', async () => {
    const r = new RichTextToHast({})
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { bold: true } })],
        getBuildOpts({}, {}, r)
      ),
      [h('strong', {}, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { code: true } })],
        getBuildOpts({}, {}, r)
      ),
      [h('code', {}, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { italic: true } })],
        getBuildOpts({}, {}, r)
      ),
      [h('em', {}, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [
          getMockRichTextItem('test1', { annotations: { strikethrough: true } })
        ],
        getBuildOpts({}, {}, r)
      ),
      [h('s', {}, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { underline: true } })],
        getBuildOpts({}, {}, r)
      ),
      [h('span', { style: 'text-decoration: underline;' }, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { color: 'gray' } })],
        getBuildOpts({}, {}, r)
      ),
      [h('span', { style: 'color:#9B9A97' }, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { color: 'foo' } })],
        getBuildOpts({}, {}, r)
      ),
      [h('span', {}, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [
          getMockRichTextItem('test1', {
            annotations: { color: 'gray_background' }
          })
        ],
        getBuildOpts({}, {}, r)
      ),
      [h('span', { style: 'background-color:#EBECED' }, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [
          getMockRichTextItem('test1', {
            annotations: { color: 'foo_background' }
          })
        ],
        getBuildOpts({}, {}, r)
      ),
      [h('span', {}, ['test1'])]
    )
  })
  it('should hast from rich_text array(annotaions with default class name)', async () => {
    const r = new RichTextToHast({ defaultClassName: true })
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { bold: true } })],
        getBuildOpts({}, {}, r)
      ),
      [h('strong', { className: 'text-bold' }, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { code: true } })],
        getBuildOpts({}, {}, r)
      ),
      [h('code', { className: 'text-code' }, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { italic: true } })],
        getBuildOpts({}, {}, r)
      ),
      [h('em', { className: 'text-italic' }, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [
          getMockRichTextItem('test1', { annotations: { strikethrough: true } })
        ],
        getBuildOpts({}, {}, r)
      ),
      [h('s', { className: 'text-strikethrough' }, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { underline: true } })],
        getBuildOpts({}, {}, r)
      ),
      [
        h(
          'span',
          {
            style: 'text-decoration: underline;',
            className: 'text-underline'
          },
          ['test1']
        )
      ]
    )
  })
  it('should hast from rich_text(link with properties map)', async () => {
    const r = new RichTextToHast({
      richTexttoHastBuilderOpts: {
        richTexttoHastBuildePropertiesMap: {
          'text-link': { className: 'a-class' }
        }
      }
    })
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { href: 'https://www.notion.so/' })],
        getBuildOpts({}, {}, r)
      ),
      [
        h('a', { className: 'a-class', href: 'https://www.notion.so/' }, [
          'test1'
        ])
      ]
    )
  })
  it('should hast from rich_text array(annotaions with properties map)', async () => {
    const r = new RichTextToHast({
      richTexttoHastBuilderOpts: {
        richTexttoHastBuildePropertiesMap: {
          'text-bold': { className: 'b-class' },
          'text-code': { className: 'code-class' },
          'text-italic': { className: 'em-class' },
          'text-strikethrough': { className: 's-class' },
          'text-underline': { className: 'underline-class' }
        }
      }
    })
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { bold: true } })],
        getBuildOpts({}, {}, r)
      ),
      [h('strong', { className: 'b-class' }, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { code: true } })],
        getBuildOpts({}, {}, r)
      ),
      [h('code', { className: 'code-class' }, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { italic: true } })],
        getBuildOpts({}, {}, r)
      ),
      [h('em', { className: 'em-class' }, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [
          getMockRichTextItem('test1', { annotations: { strikethrough: true } })
        ],
        getBuildOpts({}, {}, r)
      ),
      [h('s', { className: 's-class' }, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [getMockRichTextItem('test1', { annotations: { underline: true } })],
        getBuildOpts({}, {}, r)
      ),
      [h('span', { className: 'underline-class' }, ['test1'])]
    )
    assert.deepStrictEqual(
      await r.build(
        [
          getMockRichTextItem('test1', {
            annotations: { underline: true, color: 'gray' }
          })
        ],
        getBuildOpts({}, {}, r)
      ),
      [
        h('span', { className: 'underline-class', style: 'color:#9B9A97' }, [
          'test1'
        ])
      ]
    )
  })
  it('should hast from rich_text array(annotaions with color map)', async () => {
    const r = new RichTextToHast(
      {
        richTexttoHastBuilderOpts: {
          richTexttoHastBuildePropertiesMap: {
            'text-underline': { className: 'underline-class' }
          }
        }
      },
      new ColorProps({ colorPropertiesMap: { gray: { style: 'color:red' } } })
    )
    assert.deepStrictEqual(
      await r.build(
        [
          getMockRichTextItem('test1', {
            annotations: { underline: true, color: 'gray' }
          })
        ],
        getBuildOpts({}, {}, r)
      ),
      [
        h('span', { className: 'underline-class', style: 'color:red' }, [
          'test1'
        ])
      ]
    )
  })
  it('should hast from rich_text array(annotaions mix)', async () => {
    const r = new RichTextToHast({})
    assert.deepStrictEqual(
      await r.build(
        [
          getMockRichTextItem('test1', {
            annotations: {
              bold: true,
              code: true,
              italic: true,
              strikethrough: true,
              underline: true,
              color: 'gray'
            }
          })
        ],
        getBuildOpts({}, {}, r)
      ),
      [
        h('code', {}, [
          h('strong', {}, [
            h('em', {}, [
              h(
                's',
                {},
                h(
                  'span',
                  {
                    style: 'text-decoration: underline;color:#9B9A97'
                  },
                  ['test1']
                )
              )
            ])
          ])
        ])
      ]
    )
  })
  it('should hast from rich_text array(href and annotaions)', async () => {
    const r = new RichTextToHast({})
    assert.deepStrictEqual(
      await r.build(
        [
          getMockRichTextItem('test1', {
            annotations: {
              bold: true,
              code: true,
              italic: true,
              strikethrough: true,
              underline: true,
              color: 'gray'
            },
            href: 'https://www.notion.so/'
          })
        ],
        getBuildOpts({}, {}, r)
      ),
      [
        h(
          'a',
          {
            href: 'https://www.notion.so/'
          },
          [
            h('code', {}, [
              h('strong', {}, [
                h('em', {}, [
                  h(
                    's',
                    {},
                    h(
                      'span',
                      {
                        style: 'text-decoration: underline;color:#9B9A97'
                      },
                      ['test1']
                    )
                  )
                ])
              ])
            ])
          ]
        )
      ]
    )
  })
})

describe('RichTexttoHast.build()', () => {
  it('should hast from rich_text array(basic)', async () => {
    const r = new RichTextToHast({})
    assert.deepStrictEqual(
      await r.build([getMockRichTextItem('test1')], getBuildOpts({}, {}, r)),
      ['test1']
    )
    assert.deepStrictEqual(
      await r.build(
        [
          getMockRichTextItem('test1', { href: 'https://www.notion.so/' }),
          getMockRichTextItem('test2', { annotations: { code: true } }),
          getMockRichTextItem('test3')
        ],
        getBuildOpts({}, {}, r)
      ),
      [
        h(
          'a',
          { href: 'https://www.notion.so/' },

          ['test1']
        ),
        h('code', {}, ['test2']),
        'test3'
      ]
    )
  })
})
