import { Client } from '@notionhq/client'
import { HChild, HProperties } from 'hastscript/lib/core'
import { BlockToHastBuilder } from './block'

export type ToHastOpts = {
  block_id: string
  parent?: Block
  blocktoHastOpts?: BlockToHastOpts
  richTexttoHastOpts?: RichTexttoHastOpts
  colorPropsOpts?: ColorPropsOpts
}

// https://github.com/makenotion/notion-sdk-js/issues/280#issuecomment-1086821269
export type Block = Extract<
  Awaited<ReturnType<InstanceType<typeof Client>['blocks']['retrieve']>>,
  { type: string }
>

export type BlockToHastBuilderPropertiesKey =
  | `paragraph`
  | `heading-1`
  | `heading-2`
  | `heading-3`
  | `code`
  | `code-pre`
  | `code-code`
  | `code-caption`
  | `callout`
  | `callout-icon-emoji`
  | `callout-icon-image`
  | `callout-paragraph`
  | `divider`
  | `column-list`
  | `column`
  | `bulleted-list`
  | `bulleted-list-item`
  | `numbered-list`
  | `numbered-list-item`
  | `quote`
  | `todo`
  | `todo-checked`
  | `todo-not-checked`
  | `todo-text`
  | `toggle`
  | `toggle-summary`
  | `table`
  | `table-row`
  | `table-row-cell`
  | `table-row-header`
  | `table-row-header-top-left`
  | `table-row-header-top`
  | `table-row-header-left`
  | `bookmark`
  | `bookmark-link`
  | `bookmark-caption`
  | `image`
  | `image-img`
  | `image-caption`
  | `text-link`
  | `text-bold`
  | `text-code`
  | `text-italic`
  | `text-strikethrough`
  | `text-underline`

// export type BlockToHastBuilderPropertiesMap = Record<
//   BlockToHastBuilderPropertiesKey ,
//   HProperties
// >
export type BlockToHastBuilderPropertiesMap = {
  [key in BlockToHastBuilderPropertiesKey]?: HProperties
}
export type BlockToHastBuilderOpts = {
  defaultClassname?: boolean
  propertiesMap?: BlockToHastBuilderPropertiesMap
}
export type BlockToHastBuilders = Record<
  string,
  BlockToHastBuilder<Block['type']>
>

export type RichTextItem = Extract<
  Block,
  { type: 'paragraph' } // 共通のようなのでとりあえず paragraph から抜きただす
>['paragraph']['rich_text'][0]

export type BlockToHastOpts = {
  defaultClassName?: boolean
  blockToHastBuilderOpts?: BlockToHastBuilderOpts
  blockToHastBuilders?: BlockToHastBuilders
}

export type ColorPropertiesMap = Record<string, HProperties>
export type ColorPropsOpts = {
  colorPropertiesMap?: ColorPropertiesMap
}
export type RichTexttoHastBuildePropertiesMap = Record<string, HProperties>
export type RichTexttoHastBuilderOpts = {
  richTexttoHastBuildePropertiesMap?: RichTexttoHastBuildePropertiesMap
}
export type RichTexttoHastOpts = {
  defaultClassName?: boolean
  richTexttoHastBuilderOpts?: RichTexttoHastBuilderOpts
}
