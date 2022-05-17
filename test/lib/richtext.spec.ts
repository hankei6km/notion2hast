import { h } from 'hastscript'
import { getMockRichTextItem } from '../util.js'
import { colorText, RichTextToHast } from '../../src/lib/richtext.js'
import { ColorProps } from '../../src/lib/color.js'

describe('colorText()', () => {
  it('should retun color', () => {
    expect(colorText('gray')).toEqual(['gray', ''])
  })
  it('should retun background color', () => {
    expect(colorText('gray_background')).toEqual(['', 'gray'])
  })
})

describe('RichTexttoHast.textToHast()', () => {
  it('should hsat from rich_text(basic)', () => {
    const r = new RichTextToHast({})
    expect(r.textToHast(getMockRichTextItem('test1'))).toEqual('test1')
  })
  it('should hsat from rich_text(link)', async () => {
    const r = new RichTextToHast({})
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { href: 'https://www.notion.so/' })
      )
    ).toEqual(h('a', { href: 'https://www.notion.so/' }, ['test1']))
  })
  it('should hsat from rich_text array(annotaions)', async () => {
    const r = new RichTextToHast({})
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { bold: true } })
      )
    ).toEqual(h('strong', {}, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { code: true } })
      )
    ).toEqual(h('code', {}, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { italic: true } })
      )
    ).toEqual(h('em', {}, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { strikethrough: true } })
      )
    ).toEqual(h('s', {}, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { underline: true } })
      )
    ).toEqual(h('span', { style: 'text-decoration: underline;' }, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { color: 'gray' } })
      )
    ).toEqual(h('span', { style: 'color:#9B9A97' }, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { color: 'foo' } })
      )
    ).toEqual(h('span', {}, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', {
          annotations: { color: 'gray_background' }
        })
      )
    ).toEqual(h('span', { style: 'background-color:#EBECED' }, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', {
          annotations: { color: 'foo_background' }
        })
      )
    ).toEqual(h('span', {}, ['test1']))
  })
  it('should hsat from rich_text array(annotaions with default class name)', async () => {
    const r = new RichTextToHast({ defaultClassName: true })
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { bold: true } })
      )
    ).toEqual(h('strong', { className: 'text-bold' }, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { code: true } })
      )
    ).toEqual(h('code', { className: 'text-code' }, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { italic: true } })
      )
    ).toEqual(h('em', { className: 'text-italic' }, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { strikethrough: true } })
      )
    ).toEqual(h('s', { className: 'text-strikethrough' }, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { underline: true } })
      )
    ).toEqual(
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
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { href: 'https://www.notion.so/' })
      )
    ).toEqual(
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
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { bold: true } })
      )
    ).toEqual(h('strong', { className: 'b-class' }, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { code: true } })
      )
    ).toEqual(h('code', { className: 'code-class' }, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { italic: true } })
      )
    ).toEqual(h('em', { className: 'em-class' }, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { strikethrough: true } })
      )
    ).toEqual(h('s', { className: 's-class' }, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', { annotations: { underline: true } })
      )
    ).toEqual(h('span', { className: 'underline-class' }, ['test1']))
    expect(
      r.textToHast(
        getMockRichTextItem('test1', {
          annotations: { underline: true, color: 'gray' }
        })
      )
    ).toEqual(
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
    expect(
      r.textToHast(
        getMockRichTextItem('test1', {
          annotations: { underline: true, color: 'gray' }
        })
      )
    ).toEqual(
      h('span', { className: 'underline-class', style: 'color:red' }, ['test1'])
    )
  })
  it('should hsat from rich_text array(annotaions mix)', () => {
    const r = new RichTextToHast({})
    expect(
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
      )
    ).toEqual(
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
    expect(
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
      )
    ).toEqual(
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
    expect(await r.build([getMockRichTextItem('test1')])).toEqual(['test1'])
    expect(
      await r.build([
        getMockRichTextItem('test1', { href: 'https://www.notion.so/' }),
        getMockRichTextItem('test2', { annotations: { code: true } }),
        getMockRichTextItem('test3')
      ])
    ).toEqual([
      h(
        'a',
        { href: 'https://www.notion.so/' },

        ['test1']
      ),
      h('code', {}, ['test2']),
      'test3'
    ])
  })
})
