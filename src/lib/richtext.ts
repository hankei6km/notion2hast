import { h } from 'hastscript'
import { HChild, HProperties } from 'hastscript/lib/core'
import { ColorProps } from './color.js'
import { mergeProps } from './props.js'
import {
  RichTextItem,
  RichTexttoHastOpts,
  ColorPropertiesMap,
  RichTexttoHastBuildePropertiesMap
} from './types.js'

export type RichTextTextItem = Extract<RichTextItem, { type?: 'text' }>

export function colorText(richTextColor: string): [string, string] {
  const colors = richTextColor.split('_', 2)
  if (colors.length > 1) {
    return ['', colors[0]]
  }
  return [richTextColor, '']
}

export class RichTextToHast {
  protected colorProps: ColorProps
  protected defaultClassName: boolean
  private propertiesMap: RichTexttoHastBuildePropertiesMap = {}
  constructor(opts: RichTexttoHastOpts = {}, colorProps?: ColorProps) {
    this.colorProps = colorProps || new ColorProps({})
    this.defaultClassName = opts.defaultClassName || false
    Object.assign(
      this.propertiesMap,
      opts.richTexttoHastBuilderOpts?.richTexttoHastBuildePropertiesMap || {}
    )
  }
  protected props(key: string): HProperties {
    const ret = { ...(this.propertiesMap[key] || {}) }
    if (this.defaultClassName) {
      if (typeof ret.className === 'undefined') {
        ret.className = key
      }
    }
    return ret
  }
  textToHast(text: RichTextTextItem): HChild {
    let tag: { name: string; properties: HProperties }[] = []
    const value = text.plain_text
    if (text.href) {
      tag.push({
        name: 'a',
        properties: Object.assign(this.props('text-link'), { href: text.href })
      })
    }
    if (text.annotations.code) {
      tag.push({ name: 'code', properties: this.props('text-code') })
    }
    if (text.annotations.bold) {
      tag.push({ name: 'strong', properties: this.props('text-bold') })
    }
    if (text.annotations.italic) {
      tag.push({ name: 'em', properties: this.props('text-italic') })
    }
    if (text.annotations.strikethrough) {
      tag.push({ name: 's', properties: this.props('text-strikethrough') })
    }
    if (text.annotations.underline) {
      const props = this.props('text-underline')
      const entries = Object.entries(props)
      tag.push({
        name: 'span',
        properties:
          entries.length === 0 ||
          (entries.length === 1 &&
            entries[0][0] === 'className' &&
            entries[0][1] === 'text-underline')
            ? mergeProps(props, { style: 'text-decoration: underline;' })
            : props
      })
    }
    if (text.annotations.color && text.annotations.color !== 'default') {
      if (tag.length == 0) {
        tag.push({ name: 'span', properties: {} })
      }
      const len = tag.length
      tag[len - 1].properties = mergeProps(
        tag[len - 1].properties,
        this.colorProps.props(text.annotations.color)
      )
    }
    const len = tag.length
    if (len === 0) {
      return value
    }
    let nest = h(tag[len - 1].name, tag[len - 1].properties, [value])
    for (let i = len - 2; i >= 0; i--) {
      nest = h(tag[i].name, tag[i].properties, nest)
    }
    return nest
  }
  async build(richTextItems: RichTextItem[]): Promise<HChild[]> {
    const ret: HChild[] = []
    for (const item of richTextItems) {
      if (item.type === 'text') {
        ret.push(this.textToHast(item))
      }
    }
    return ret
  }
}
