import type { Child } from 'hastscript'
import type { ListBlockChildrenResponse } from '@notionhq/client'
import { Client } from '../lib/client.ts'
import type {
  Block,
  BlockToHastBuilderBuildOpts,
  BlockToHastBuilderOpts,
  BlockToHastBuilders,
  BlockToHastOpts,
  ToHastOpts
} from '../builder/types.ts'
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
  BlockNumberedListItemToHast,
  BlockParagraphToHast,
  BlockQuoteToHast,
  BlockTableRowToHast,
  BlockTableToHast,
  BlockTodoToHast,
  BlockToggleToHast,
  BlockToHastBuilder,
  type PrevType
} from '../builder/block.ts'

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
