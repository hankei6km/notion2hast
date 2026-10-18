import { h } from 'hastscript'
import type { Child, Properties } from 'hastscript'
import { classnames } from 'hast-util-classnames'
import type {
  Block,
  BlockToHastBuilderBuildOpts,
  BlockToHastBuilderOpts,
  BlockToHastBuilderPropertiesKey,
  BlockToHastBuilderPropertiesMap
} from './types.ts'
import { mergeProps } from './props.ts'

export type PrevType = Block['type'] | undefined | ''

export abstract class BlockToHastBuilder<T extends Block['type']> {
  protected blockType!: T
  protected defaultClassname: boolean
  protected propertiesMap: BlockToHastBuilderPropertiesMap = {}
  constructor(blockType: T, opts: BlockToHastBuilderOpts) {
    this.blockType = blockType
    this.defaultClassname = opts.defaultClassname || false
    this.propertiesMap = { ...(opts.propertiesMap || {}) }
  }
  protected props(key: BlockToHastBuilderPropertiesKey): Properties {
    const ret = { ...(this.propertiesMap[key] || {}) }
    if (this.defaultClassname) {
      if (typeof ret.className === 'undefined') {
        ret.className = key
      }
    }
    return ret
  }
  abstract outerTag(): { name: string | null; properties?: Properties }
  abstract build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: T } }
  ): Promise<Child[]>
  abstract isBreak(prevType: PrevType): boolean
}

export class BlockParagraphToHast extends BlockToHastBuilder<'paragraph'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('paragraph', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'paragraph' } }
  ): Promise<Child[]> {
    return [
      h(
        'p',
        mergeProps(
          this.props('paragraph'),
          opts.colorProps.props(opts.block[opts.block.type].color)
        ),
        ...(await opts.richTextToHast.build(
          opts.block[opts.block.type].rich_text,
          opts
        )),
        ...opts.nest
      )
    ]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockHeading1ToHast extends BlockToHastBuilder<'heading_1'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('heading_1', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'heading_1' } }
  ): Promise<Child[]> {
    return [
      h(
        'h1',
        mergeProps(
          this.props('heading-1'),
          opts.colorProps.props(opts.block[opts.block.type].color)
        ),
        ...(await opts.richTextToHast.build(
          opts.block[opts.block.type].rich_text,
          opts
        )),
        ...opts.nest
      )
    ]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockHeading2ToHast extends BlockToHastBuilder<'heading_2'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('heading_2', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'heading_2' } }
  ): Promise<Child[]> {
    return [
      h(
        'h2',
        mergeProps(
          this.props('heading-2'),
          opts.colorProps.props(opts.block[opts.block.type].color)
        ),
        ...(await opts.richTextToHast.build(
          opts.block[opts.block.type].rich_text,
          opts
        )),
        ...opts.nest
      )
    ]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockHeading3ToHast extends BlockToHastBuilder<'heading_3'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('heading_3', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'heading_3' } }
  ): Promise<Child[]> {
    return [
      h(
        'h3',
        mergeProps(
          this.props('heading-3'),
          opts.colorProps.props(opts.block[opts.block.type].color)
        ),
        ...(await opts.richTextToHast.build(
          opts.block[opts.block.type].rich_text,
          opts
        )),
        ...opts.nest
      )
    ]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockHeading4ToHast extends BlockToHastBuilder<'heading_4'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('heading_4', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'heading_4' } }
  ): Promise<Child[]> {
    return [
      h(
        'h4',
        mergeProps(
          this.props('heading-4'),
          opts.colorProps.props(opts.block[opts.block.type].color)
        ),
        ...(await opts.richTextToHast.build(
          opts.block[opts.block.type].rich_text,
          opts
        )),
        ...opts.nest
      )
    ]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockCodeToHast extends BlockToHastBuilder<'code'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('code', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'code' } }
  ): Promise<Child[]> {
    const lang = opts.block[opts.block.type].language || ''
    const codeCode = h(
      'code',
      this.props('code-code'),
      ...(await opts.richTextToHast.build(
        opts.block[opts.block.type].rich_text,
        opts
      ))
    )
    classnames(codeCode, lang)
    const caption = await opts.richTextToHast.build(
      opts.block[opts.block.type].caption,
      opts
    )
    const codeCaption: Child =
      caption.length > 0
        ? h('figcaption', this.props('code-caption'), ...caption)
        : null
    return [
      h(
        'figure',
        this.props('code'),
        h('pre', this.props('code-pre'), codeCode),
        codeCaption,
        ...opts.nest
      )
    ]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockCalloutToHast extends BlockToHastBuilder<'callout'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('callout', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'callout' } }
  ): Promise<Child[]> {
    const iconSrc = opts.block[opts.block.type].icon
    let icon: Child = ''
    if (iconSrc?.type === 'emoji') {
      icon = h('div', this.props('callout-icon-emoji'), iconSrc.emoji)
    } else if (iconSrc?.type === 'external') {
      icon = h(
        'div',
        this.props('callout-icon-image'),
        h('img', { src: iconSrc.external.url })
      )
    } else if (iconSrc?.type === 'file') {
      icon = h(
        'div',
        this.props('callout-icon-image'),
        h('img', { src: iconSrc.file.url })
      )
    }
    return [
      h(
        'div',
        mergeProps(
          this.props('callout'),
          opts.colorProps.props(opts.block[opts.block.type].color)
        ),
        icon,
        h(
          'div',
          this.props('callout-paragraph'),
          h(
            'p',
            {},
            ...(await opts.richTextToHast.build(
              opts.block[opts.block.type].rich_text,
              opts
            ))
          )
        ),
        ...opts.nest
      )
    ]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockDividerToHast extends BlockToHastBuilder<'divider'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('divider', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'divider' } }
  ): Promise<Child[]> {
    return [h('hr', this.props('divider'), ...opts.nest)]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockColumnListToHast extends BlockToHastBuilder<'column_list'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('column_list', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'column_list' } }
  ): Promise<Child[]> {
    return [h('div', this.props('column-list'), ...opts.nest)]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockColumnToHast extends BlockToHastBuilder<'column'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('column', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'column' } }
  ): Promise<Child[]> {
    return [h('div', this.props('column'), ...opts.nest)]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockBulletedListItemToHast extends BlockToHastBuilder<'bulleted_list_item'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('bulleted_list_item', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: 'ul', properties: this.props('bulleted-list') }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & {
      block: { type: 'bulleted_list_item' }
    }
  ): Promise<Child[]> {
    return [
      h(
        'li',
        mergeProps(
          this.props('bulleted-list-item'),
          opts.colorProps.props(opts.block[opts.block.type].color)
        ),
        ...(await opts.richTextToHast.build(
          opts.block[opts.block.type].rich_text,
          opts
        )),
        ...opts.nest
      )
    ]
  }
  isBreak(prevType: PrevType): boolean {
    if (this.blockType === prevType) {
      return false
    }
    return true
  }
}

export class BlockNumberedListItemToHast extends BlockToHastBuilder<'numbered_list_item'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('numbered_list_item', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: 'ol', properties: this.props('numbered-list') }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & {
      block: { type: 'numbered_list_item' }
    }
  ): Promise<Child[]> {
    return [
      h(
        'li',
        mergeProps(
          this.props('numbered-list-item'),
          opts.colorProps.props(opts.block[opts.block.type].color)
        ),
        ...(await opts.richTextToHast.build(
          opts.block[opts.block.type].rich_text,
          opts
        )),
        ...opts.nest
      )
    ]
  }
  isBreak(prevType: PrevType): boolean {
    if (this.blockType === prevType) {
      return false
    }
    return true
  }
}

export class BlockQuoteToHast extends BlockToHastBuilder<'quote'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('quote', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'quote' } }
  ): Promise<Child[]> {
    return [
      h(
        'blockquote',
        mergeProps(
          this.props('quote'),
          opts.colorProps.props(opts.block[opts.block.type].color)
        ),
        ...(await opts.richTextToHast.build(
          opts.block[opts.block.type].rich_text,
          opts
        )),
        ...opts.nest
      )
    ]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockTodoToHast extends BlockToHastBuilder<'to_do'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('to_do', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'to_do' } }
  ): Promise<Child[]> {
    const todo = opts.block[opts.block.type]
    return [
      h(
        'div',
        mergeProps(this.props('todo'), opts.colorProps.props(todo.color)),
        h(
          'div',
          this.props(todo.checked ? 'todo-checked' : 'todo-not-checked')
        ),
        h(
          'div',
          this.props('todo-text'),
          ...(await opts.richTextToHast.build(todo.rich_text, opts))
        ),
        ...opts.nest
      )
    ]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockToggleToHast extends BlockToHastBuilder<'toggle'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('toggle', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'toggle' } }
  ): Promise<Child[]> {
    return [
      h(
        'details',
        mergeProps(
          this.props('toggle'),
          opts.colorProps.props(opts.block[opts.block.type].color)
        ),
        h(
          'summary',
          this.props('toggle-summary'),
          ...(await opts.richTextToHast.build(
            opts.block[opts.block.type].rich_text,
            opts
          ))
        ),
        ...opts.nest
      )
    ]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockTableToHast extends BlockToHastBuilder<'table'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('table', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'table' } }
  ): Promise<Child[]> {
    return [h('table', this.props('table'), ...opts.nest)]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockTableRowToHast extends BlockToHastBuilder<'table_row'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('table_row', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'table_row' } }
  ): Promise<Child[]> {
    let has_column_header: boolean = false
    let has_row_header: boolean = false
    const parent = opts.parents[opts.parents.length - 1]
    if (parent && parent.type === 'table') {
      has_column_header = parent.table.has_column_header
      has_row_header = parent.table.has_row_header
    }
    const cells: Child[] = []
    let colIdx = 0
    for (const cell of opts.block[opts.block.type].cells) {
      let tagName = 'td'
      let properties: Properties = this.props('table-row-cell')
      if (
        (has_column_header && opts.index === 0) ||
        (has_row_header && colIdx === 0)
      ) {
        // index がテーブル行と一致している前提
        tagName = 'th'
      }
      if (tagName === 'th') {
        properties = this.props('table-row-header')
        if (opts.index === 0 && colIdx === 0) {
          properties = Object.assign(
            {},
            properties,
            this.props('table-row-header-top-left')
          )
        } else if (opts.index === 0) {
          properties = Object.assign(
            {},
            properties,
            this.props('table-row-header-top')
          )
        } else if (colIdx === 0) {
          properties = Object.assign(
            {},
            properties,
            this.props('table-row-header-left')
          )
        }
      }
      cells.push(
        h(tagName, properties, ...(await opts.richTextToHast.build(cell, opts)))
      )
      colIdx++
    }
    return [h('tr', this.props('table-row'), ...cells, ...opts.nest)]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

export class BlockBookmarkToHast extends BlockToHastBuilder<'bookmark'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('bookmark', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'bookmark' } }
  ): Promise<Child[]> {
    const caption: Child[] = await opts.richTextToHast.build(
      opts.block[opts.block.type].caption,
      opts
    )
    const bookmarkCaption: Child =
      caption.length > 0
        ? h('figcaption', this.props('bookmark-caption'), ...caption)
        : null
    return [
      h(
        'figure',
        this.props('bookmark'),
        h(
          'a',
          Object.assign({}, this.props('bookmark-link'), {
            href: opts.block[opts.block.type].url
          }),
          opts.block[opts.block.type].url
        ),
        bookmarkCaption,
        ...opts.nest
      )
    ]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}
export class BlockImageToHast extends BlockToHastBuilder<'image'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('image', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(
    opts: BlockToHastBuilderBuildOpts & { block: { type: 'image' } }
  ): Promise<Child[]> {
    const image = opts.block[opts.block.type]
    let src = image.type === 'external' ? image.external.url : image.file.url
    const children = [
      h('img', Object.assign({}, this.props('image-img'), { src }))
    ]
    const caption = await opts.richTextToHast.build(image.caption, opts)
    if (caption.length > 0) {
      children.push(h('figcaption', this.props('image-caption'), ...caption))
    }
    return [h('figure', this.props('image'), ...children, ...opts.nest)]
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}
