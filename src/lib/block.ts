import { h } from 'hastscript'
import type { Child, Properties } from 'hastscript'
import { classnames } from 'hast-util-classnames'
import type {
  Block,
  BlockToHastBuilderBuildOpts,
  BlockToHastBuilderOpts,
  BlockToHastBuilderPropertiesKey,
  BlockToHastBuilderPropertiesMap,
  BlockToHastBuilders,
  BlockToHastOpts,
  ToHastOpts
} from './types.ts'
import { RichTextToHast } from './richtext.ts'
import { Client } from './client.ts'
import { ColorProps } from './color.ts'
import { mergeProps } from './props.ts'
import type { ListBlockChildrenResponse } from '@notionhq/client'

export function isBlock(o: any): o is Block {
  if (o.object === 'block' && typeof o.type === 'string') {
    return true
  }
  return false
}

export class BlockItem {
  private client: Client
  private opts: ToHastOpts
  private blocks: ListBlockChildrenResponse['results']
  private next_cursor: ListBlockChildrenResponse['next_cursor']
  private blocksLen: number
  private idx: number
  constructor(client: Client, opts: ToHastOpts) {
    this.client = client
    this.opts = opts
    this.blocks = []
    this.next_cursor = null
    this.blocksLen = 0
    this.idx = 0
  }
  async init(): Promise<void> {
    let res = await this.client.listBlockChildren({
      block_id: this.opts.block_id
    })
    this.blocks = res.results || []
    this.next_cursor = res.next_cursor
    this.blocksLen = this.blocks.length
    this.idx = 0
  }
  async block(): Promise<Block | null> {
    if (this.idx >= this.blocksLen) {
      if (this.next_cursor) {
        let res = await this.client.listBlockChildren({
          block_id: this.opts.block_id,
          start_cursor: this.next_cursor || undefined
        })
        this.blocks = res.results || []
        this.next_cursor = res.next_cursor
        this.blocksLen = this.blocks.length
        this.idx = 0
      } else {
        return null
      }
    }
    if (this.blocksLen === 0) {
      return null
    }
    const ret = this.blocks[this.idx]
    this.idx++
    if (isBlock(ret)) {
      return ret
    }
    return null
  }
}

export abstract class BlockToHastBuilder<T> {
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
  abstract build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]>
  abstract isBreak(prevType: PrevType): boolean
}

export class BlockParagraphToHast extends BlockToHastBuilder<'paragraph'> {
  constructor(opts: BlockToHastBuilderOpts = {}) {
    super('paragraph', opts)
  }
  outerTag(): { name: string | null; properties?: Properties } {
    return { name: null }
  }
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
      return [h('hr', this.props('divider'), ...opts.nest)]
    }
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
      return [h('div', this.props('column-list'), ...opts.nest)]
    }
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
      return [h('div', this.props('column'), ...opts.nest)]
    }
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
      return [h('table', this.props('table'), ...opts.nest)]
    }
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
          h(
            tagName,
            properties,
            ...(await opts.richTextToHast.build(cell, opts))
          )
        )
        colIdx++
      }
      return [h('tr', this.props('table-row'), ...cells, ...opts.nest)]
    }
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
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
  async build(opts: BlockToHastBuilderBuildOpts): Promise<Child[]> {
    if (this.blockType === opts.block.type) {
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
    return []
  }
  isBreak(_prevType: PrevType): boolean {
    return true
  }
}

type PrevType = Block['type'] | undefined | ''
export class SurroundElement {
  private prevType: PrevType = ''
  private children: Child[] = []
  private defaultBlockToHastBuilders(
    opts: BlockToHastBuilderOpts
  ): BlockToHastBuilders {
    return {
      paragraph: new BlockParagraphToHast(opts),
      heading_1: new BlockHeading1ToHast(opts),
      heading_2: new BlockHeading2ToHast(opts),
      heading_3: new BlockHeading3ToHast(opts),
      heading_4: new BlockHeading4ToHast(opts),
      code: new BlockCodeToHast(opts),
      callout: new BlockCalloutToHast(opts),
      divider: new BlockDividerToHast(opts),
      column_list: new BlockColumnListToHast(opts),
      column: new BlockColumnToHast(opts),
      bulleted_list_item: new BlockBulletedListItemToHast(opts),
      numbered_list_item: new BlockNumberedListItemToHast(opts),
      quote: new BlockQuoteToHast(opts),
      to_do: new BlockTodoToHast(opts),
      toggle: new BlockToggleToHast(opts),
      table: new BlockTableToHast(opts),
      table_row: new BlockTableRowToHast(opts),
      bookmark: new BlockBookmarkToHast(opts),
      image: new BlockImageToHast(opts)
    }
  }
  private blockToHastBuilders: BlockToHastBuilders = {}
  constructor(initType: PrevType, opts: BlockToHastOpts = {}) {
    this.prevType = initType
    const buildersOpts = opts.blockToHastBuilderOpts || {}
    if (typeof buildersOpts.defaultClassname === 'undefined') {
      buildersOpts.defaultClassname = opts.defaultClassName
    }
    this.blockToHastBuilders = Object.assign(
      {},
      this.defaultBlockToHastBuilders(buildersOpts),
      opts.blockToHastBuilders || {}
    )
  }
  protected builder(
    blockType: PrevType
  ): BlockToHastBuilder<Block['type']> | undefined {
    if (blockType) {
      return this.blockToHastBuilders[blockType]
    }
    return undefined
  }
  async append({
    block,
    nest,
    opts,
    index,
    depth,
    parents,
    richTextToHast,
    colorProps
  }: BlockToHastBuilderBuildOpts): Promise<void> {
    const builder = this.builder(block.type)
    if (builder) {
      this.children.push(
        ...(await builder.build({
          block,
          nest,
          index,
          opts,
          depth,
          parents,
          richTextToHast,
          colorProps
        }))
      )
    }
    this.prevType = block.type
    return
  }
  nest(contet: Child): void {
    this.children.push(contet)
  }
  outerTag(): ReturnType<BlockToHastBuilder<Block['type']>['outerTag']> | null {
    const builder = this.builder(this.prevType)
    if (builder) {
      return builder.outerTag()
    }
    return null
  }
  content(): Child[] {
    return this.children
  }
  isBreak(cur: PrevType): boolean {
    if (this.prevType === '') {
      return false
    }
    const builder = this.builder(this.prevType)
    if (builder) {
      return builder.isBreak(cur)
    }
    return true
  }
  reset(): void {
    this.prevType = ''
    this.children = []
  }
}
