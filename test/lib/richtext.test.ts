import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { h } from 'hastscript'
import { getMockRichTextItem } from '../util.ts'
import { colorText, RichTextToHast } from '../../src/lib/richtext.ts'
import { ColorProps } from '../../src/lib/color.ts'

describe('colorText()', () => {
  it('should retun color', () => {
    assert.deepStrictEqual(colorText('gray'), ['gray', ''])
  })
  it('should retun background color', () => {
    assert.deepStrictEqual(colorText('gray_background'), ['', 'gray'])
  })
})

describe('RichTexttoHast.textToHast()', () => {
  it('should hsat from rich_text(basic)', () => {
    const r = new RichTextToHast({})
    assert.strictEqual(r.textToHast(getMockRichTextItem('test1')), 'test1')
  })
  it('should hsat from rich_text(link)', async () => {
    const r = new RichTextToHast({})
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { href: 'https://www.notion.so/' })
      ),
      h('a', { href: 'https://www.notion.so/' }, ['test1'])
    )
  })
  it('should hsat from rich_text array(annotaions)', async () => {
    const r = new RichTextToHast({})
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { bold: true } })
      ),
      h('strong', {}, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { code: true } })
      ),
      h('code', {}, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { italic: true } })
      ),
      h('em', {}, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { strikethrough: true } })
      ),
      h('s', {}, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { underline: true } })
      ),
      h('span', { style: 'text-decoration: underline;' }, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { color: 'gray' } })
      ),
      h('span', { style: 'color:#9B9A97' }, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { color: 'foo' } })
      ),
      h('span', {}, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', {
          annotations: { color: 'gray_background' }
        })
      ),
      h('span', { style: 'background-color:#EBECED' }, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', {
          annotations: { color: 'foo_background' }
        })
      ),
      h('span', {}, ['test1'])
    )
  })
  it('should hsat from rich_text array(annotaions with default class name)', async () => {
    const r = new RichTextToHast({ defaultClassName: true })
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { bold: true } })
      ),
      h('strong', { className: 'text-bold' }, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { code: true } })
      ),
      h('code', { className: 'text-code' }, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { italic: true } })
      ),
      h('em', { className: 'text-italic' }, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { strikethrough: true } })
      ),
      h('s', { className: 'text-strikethrough' }, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { underline: true } })
      ),
      h(
        'span',
        {
          style: 'text-decoration: underline;',
          className: 'text-underline'
        },
        ['test1']
      )
    )
  })
  it('should hsat from rich_text(link with properties map)', async () => {
    const r = new RichTextToHast({
      richTexttoHastBuilderOpts: {
        richTexttoHastBuildePropertiesMap: {
          'text-link': { className: 'a-class' }
        }
      }
    })
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { href: 'https://www.notion.so/' })
      ),
      h('a', { className: 'a-class', href: 'https://www.notion.so/' }, [
        'test1'
      ])
    )
  })
  it('should hsat from rich_text array(annotaions with properties map)', async () => {
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
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { bold: true } })
      ),
      h('strong', { className: 'b-class' }, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { code: true } })
      ),
      h('code', { className: 'code-class' }, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { italic: true } })
      ),
      h('em', { className: 'em-class' }, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { strikethrough: true } })
      ),
      h('s', { className: 's-class' }, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { underline: true } })
      ),
      h('span', { className: 'underline-class' }, ['test1'])
    )
    assert.deepStrictEqual(
      r.textToHast(
        getMockRichTextItem('test1', {
          annotations: { underline: true, color: 'gray' }
        })
      ),
      h('span', { className: 'underline-class', style: 'color:#9B9A97' }, [
        'test1'
      ])
    )
  })
  it('should hsat from rich_text array(annotaions with color map)', async () => {
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
      r.textToHast(
        getMockRichTextItem('test1', {
          annotations: { underline: true, color: 'gray' }
        })
      ),
      h('span', { className: 'underline-class', style: 'color:red' }, ['test1'])
    )
  })
  it('should hsat from rich_text array(annotaions mix)', () => {
    const r = new RichTextToHast({})
    assert.deepStrictEqual(
      r.textToHast(
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
      ),
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
    )
  })
  it('should hsat from rich_text array(href and annotaions)', () => {
    const r = new RichTextToHast({})
    assert.deepStrictEqual(
      r.textToHast(
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
      ),
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
    )
  })
})

describe('RichTexttoHast.build()', () => {
  it('should hsat from rich_text array(basic)', async () => {
    const r = new RichTextToHast({})
    assert.deepStrictEqual(await r.build([getMockRichTextItem('test1')]), [
      'test1'
    ])
    assert.deepStrictEqual(
      await r.build([
        getMockRichTextItem('test1', { href: 'https://www.notion.so/' }),
        getMockRichTextItem('test2', { annotations: { code: true } }),
        getMockRichTextItem('test3')
      ]),
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
